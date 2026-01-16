import { Injectable, Logger } from '@nestjs/common';
import { FirebaseAdminService } from '../../common/external/firebase/firebase-admin.service';
import { ApiErrorCode } from '../../common/enums/codes/api-error.enum';
import { ApiErrorSubCode } from '../../common/enums/codes/api-error-subcode.enum';
import { HttpStatusCode } from '../../common/enums/codes/http-error-code.enum';
import { CustomError } from '../../common/errors/custom.error';
import { OtpDAO } from '../daos/otp.dao';
import * as crypto from 'crypto';
import { UserService } from 'src/user/services/user.service';
import { FirebaseClientService } from 'src/common/external/firebase/firebase-client.service';
import { UserCreateRequest } from 'src/user/requests/user-create.request';
import { UserStatus } from 'src/user/enums/role-user.enum';
import { UserCreateResponse } from 'src/user/responses/user-create.response';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly firebaseAdminService: FirebaseAdminService,
    private readonly otpDAO: OtpDAO,
    private readonly userService: UserService,
    private readonly firebaseClientService: FirebaseClientService,
  ) { }

  async signup(data: UserCreateRequest): Promise<{ user: UserCreateResponse; otp: string }> {
    const normalizedEmail = data.email.toLowerCase().trim();
    this.logger.log(`Attempting signup for email=${normalizedEmail}`);
    try {
      const existingUser = await this.userService.findSession(normalizedEmail);
      if (existingUser) {
        throw new CustomError('Email already exists.', HttpStatusCode.CONFLICT, ApiErrorCode.USER, ApiErrorSubCode.ALREADY_EXISTS);
      }

      const displayName = `${data.firstName} ${data.lastName}`.trim();

      const firebaseUser = await this.firebaseAdminService.createUser(normalizedEmail, data.password, displayName, data.role);

      const userId = firebaseUser.user.uid;

      const createdUser = await this.userService.createUser({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
        role: data.role,
        userId,
      });

      const otp = await this.generateOtp(data.email);

      const userResponse: UserCreateResponse = {
        id: createdUser.id,
        createdAt: createdUser.createdAt,
        updatedAt: createdUser.updatedAt,
        firstName: createdUser.firstName,
        lastName: createdUser.lastName,
        email: createdUser.email,
        status: UserStatus.PENDING,
        roles: [data.role],
        userId: userId,
      };

      this.logger.log(`Signup successful for email=${data.email}, OTP generated`);
      return { user: userResponse, otp };
    } catch (error) {
      this.logger.error(`Signup failed for email=${data.email}: ${error.message}`, error.stack);
      throw error;
    }
  }

  async login(email: string, password: string): Promise<{ token: string; user: any }> {
    this.logger.log(`Attempting login for email=${email}`);
    try {
      // Normalize email to lowercase for consistent authentication
      const normalizedEmail = email.toLowerCase().trim();
      const authResponse = await this.firebaseClientService.signInWithEmail(normalizedEmail, password);
      const user = await this.firebaseAdminService.getUserByEmail(normalizedEmail);

      if (!user.emailVerified) {
        throw new CustomError('Email not verified.', HttpStatusCode.UNAUTHORIZED, ApiErrorCode.USER, ApiErrorSubCode.NOT_VERIFIED);
      }

      const userProfile = await this.userService.getSelfUserProfile(user.uid);

      if (!userProfile) {
        throw new CustomError('User not found.', HttpStatusCode.NOT_FOUND, ApiErrorCode.USER, ApiErrorSubCode.NOT_FOUND);
      }

      // Update lastLoginAt timestamp
      await this.userService.updateLastLogin(userProfile.userId);

      // Refresh user profile to include updated lastLoginAt
      const updatedUserProfile = await this.userService.getSelfUserProfile(user.uid);

      const customClaims = {
        email: updatedUserProfile.email,
        role: updatedUserProfile.role,
        roles: [updatedUserProfile.role],
      };

      await this.firebaseAdminService.setCustomUserClaims(user.uid, customClaims);

      const token = await this.firebaseAdminService.createCustomToken(user.uid, customClaims);

      this.logger.log(`Login successful for email=${email}`);
      return { token, user: updatedUserProfile };
    } catch (error) {
      this.logger.error(`Login failed for email=${email}: ${error.message}`, error.stack);
      throw new CustomError(`Invalid email or password: ${error.message}`, HttpStatusCode.UNAUTHORIZED, ApiErrorCode.USER, ApiErrorSubCode.INVALID_CREDENTIALS, error.stack);
    }
  }

  async generateOtp(email: string): Promise<string> {
    this.logger.log(`Generating OTP for email=${email}`);
    try {
      // Normalize email to lowercase for consistent storage
      const normalizedEmail = email.toLowerCase().trim();
      const user = await this.firebaseAdminService.getUserByEmail(normalizedEmail);
      const otp = crypto.randomInt(100000, 999999).toString();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

      await this.otpDAO.create({
        email: normalizedEmail,
        otp,
        expiresAt,
        used: false,
      });

      this.logger.log(`OTP generated for email=${email}`);
      return otp;
    } catch (error) {
      this.logger.error(`Failed to generate OTP for email=${email}: ${error.message}`, error.stack);
      throw new CustomError(`Failed to generate OTP: ${error.message}`, HttpStatusCode.BAD_REQUEST, ApiErrorCode.USER, ApiErrorSubCode.OPERATION_FAILED, error.stack);
    }
  }

  async verifyOtp(email: string, otp: string, type: 'forgot-password' | 'email-verification'): Promise<{ token: string; user: any }> {
    this.logger.log(`Verifying OTP for email=${email},${otp} ,type=${type}`);
    try {
      // Normalize email to lowercase for consistent matching
      const normalizedEmail = email.toLowerCase().trim();
      const otpRecord = await this.otpDAO.findByEmailAndOtp(normalizedEmail, otp, false);
      if (!otpRecord || otpRecord.expiresAt < new Date()) {
        throw new CustomError('Invalid or expired OTP', HttpStatusCode.BAD_REQUEST, ApiErrorCode.USER, ApiErrorSubCode.INVALID_CREDENTIALS);
      }

      await this.otpDAO.markAsUsed(otpRecord.id);

      const firebaseUser = await this.firebaseAdminService.getUserByEmail(email);
      console.log('🚀 ~ auth.service.ts:151 ~ AuthService ~ verifyOtp ~ firebaseUser:', firebaseUser);

      this.logger.log(`Fetched Firebase user: uid=${firebaseUser.uid}, email=${firebaseUser.email}`);
      await this.firebaseAdminService.updateUser(firebaseUser.uid, { emailVerified: true });

      const userProfile = await this.userService.findSession(firebaseUser.uid);
      this.logger.log(`Fetched user profile: ${JSON.stringify(userProfile)}`);
      if (!userProfile) {
        throw new CustomError('User profile not found in database.', HttpStatusCode.NOT_FOUND, ApiErrorCode.USER, ApiErrorSubCode.NOT_FOUND);
      }

      await this.userService.updateUserStatus(userProfile.userId, UserStatus.ACTIVE);

      const customClaims = {
        email: userProfile.email,
        role: userProfile.role,
        roles: [userProfile.role],
      };

      await this.firebaseAdminService.setCustomUserClaims(firebaseUser.uid, customClaims);

      const token = await this.firebaseAdminService.createCustomToken(firebaseUser.uid, customClaims);

      this.logger.log(`OTP verified for email=${email}, type=${type}`);
      return { token, user: userProfile };
    } catch (error) {
      this.logger.error(`Failed to verify OTP for email=${email}: ${error.message}`, error.stack);
      throw new CustomError(
        `Failed to verify OTP: ${error.message || 'Unknown error'}`,
        HttpStatusCode.BAD_REQUEST,
        ApiErrorCode.USER,
        ApiErrorSubCode.INVALID_CREDENTIALS,
        error.stack,
      );
    }
  }

  async resetPassword(email: string, otp: string, newPassword: string): Promise<void> {
    this.logger.log(`Resetting password for email=${email}`);
    try {
      const isValidOtp = await this.verifyOtp(email, otp, 'forgot-password');
      if (!isValidOtp) {
        throw new CustomError('Invalid OTP', HttpStatusCode.BAD_REQUEST, ApiErrorCode.USER, ApiErrorSubCode.INVALID_CREDENTIALS);
      }

      const user = await this.firebaseAdminService.getUserByEmail(email);
      await this.firebaseAdminService.updateUser(user.uid, { password: newPassword });
      this.logger.log(`Password reset successfully for email=${email}`);
    } catch (error) {
      this.logger.error(`Failed to reset password for email=${email}: ${error.message}`, error.stack);
      throw new CustomError(`Failed to reset password: ${error.message}`, HttpStatusCode.BAD_REQUEST, ApiErrorCode.USER, ApiErrorSubCode.OPERATION_FAILED, error.stack);
    }
  }
}
