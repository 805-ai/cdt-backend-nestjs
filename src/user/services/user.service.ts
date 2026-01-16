import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import { PaginatedData } from 'src/common/base/baseDAO';
import { ApiErrorSubCode } from 'src/common/enums/codes/api-error-subcode.enum';
import { ApiErrorCode } from 'src/common/enums/codes/api-error.enum';
import { HttpStatusCode } from 'src/common/enums/codes/http-error-code.enum';
import { CustomError } from 'src/common/errors/custom.error';
import { FirebaseAdminService } from 'src/common/external/firebase/firebase-admin.service';
import { UserDAO } from '../daos/user.dao';
import { UserDTO } from '../dtos/user.dto';
import { Role, UserStatus } from '../enums/role-user.enum';
import { UserCreateRequest } from '../requests/user-create.request';
import { UserUpdateRequest } from '../requests/user-update.request';
import { UserCreateResponse } from '../responses/user-create.response';
import { PartnerSignupRequest } from '../requests/partner-signup.request';
import * as crypto from 'crypto';
import { PartnerService } from 'src/partner/services/partner.service';
import { ConsentService } from 'src/consent/services/consent.service';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    private readonly userDAO: UserDAO,
    private readonly firebaseAdminService: FirebaseAdminService,
    @Inject(forwardRef(() => PartnerService))
    private readonly partnerService: PartnerService,
    @Inject(forwardRef(() => ConsentService))
    private readonly consentService: ConsentService,
  ) { }

  async onboardPartner(data: PartnerSignupRequest): Promise<UserCreateResponse> {
    this.logger.log(`Partner signup for email=${data.email}, partnerId=${data.partnerId}`);

    // Validate partner exists
    const validtePartner = await this.partnerService.getPartnerById(data.partnerId);
    if (!validtePartner) {
      throw new CustomError('Partner not found or not allowed to onboard users.', HttpStatusCode.BAD_REQUEST, ApiErrorCode.PARTNER, ApiErrorSubCode.NOT_ALLOWED);
    }

    const randomPassword = crypto.randomBytes(8).toString('hex');

    const existingUser = await this.userDAO.find({ email: data.email }, ['id']);
    if (existingUser.data.length > 0) {
      throw new CustomError('Email already exists.', HttpStatusCode.CONFLICT, ApiErrorCode.USER, ApiErrorSubCode.ALREADY_EXISTS);
    }

    const displayName = `${data.firstName} ${data.lastName}`.trim();
    const firebaseUser = await this.firebaseAdminService.createUser(data.email.toLowerCase().trim(), randomPassword, displayName, data.role);

    const userId = firebaseUser.user.uid;

    const createdUser = await this.userDAO.create({
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      userId,
      role: data.role,
      status: UserStatus.PENDING,
      partnerId: data.partnerId,
    });

    this.logger.log(`Email sent to ${data.email} with password: ${randomPassword} and dashboard access`);

    const userResponse: UserCreateResponse = {
      id: createdUser.id,
      createdAt: createdUser.createdAt,
      updatedAt: createdUser.updatedAt,
      firstName: createdUser.firstName,
      lastName: createdUser.lastName,
      email: createdUser.email,
      status: createdUser.status,
      roles: [createdUser.role],
      userId: createdUser.userId,
    };

    return userResponse;
  }

  async getUserProfileById(id: string): Promise<UserDTO> {
    return await this.userDAO.findById(id);
  }

  async getUsers(filter: any = { status: UserStatus.ACTIVE }, page: number, perPage: number): Promise<PaginatedData<UserDTO>> {
    return this.userDAO.find(filter, ['*'], page, perPage);
  }

  async createUser(data: UserCreateRequest & { userId?: string }): Promise<UserCreateResponse> {
    this.logger.log(`Creating user: email=${data.email}, userId=${data.userId}`);
    const existingUser = await this.userDAO.find({ email: data.email }, ['id']);
    if (existingUser.data.length > 0) {
      throw new CustomError('Email already exists.', HttpStatusCode.CONFLICT, ApiErrorCode.USER, ApiErrorSubCode.ALREADY_EXISTS);
    }

    const createdUser = await this.userDAO.create({
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      userId: data.userId || `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      role: data.role,
      status: UserStatus.PENDING,
    });

    this.logger.log(`User created in MongoDB: email=${data.email}, userId=${createdUser.userId}, id=${createdUser.id}`);
    return {
      id: createdUser.id,
      createdAt: createdUser.createdAt,
      updatedAt: createdUser.updatedAt,
      firstName: createdUser.firstName,
      lastName: createdUser.lastName,
      email: createdUser.email,
      status: createdUser.status,
      roles: [createdUser.role],
      userId: createdUser.userId,
    };
  }

  async findByEmail(email: string): Promise<UserDTO | null> {
    return await this.userDAO.findByEmail(email);
  }

  async updateUserProfileById(userId: string, data: UserUpdateRequest): Promise<UserDTO> {
    const users = await this.userDAO.find({ userId }, ['id']);
    if (users.data.length === 0) throw new CustomError('User not found.', HttpStatusCode.NOT_FOUND, ApiErrorCode.USER, ApiErrorSubCode.NOT_FOUND);
    return this.userDAO.update(users.data[0].id, data);
  }

  async updateUserStatus(userId: string, status: UserStatus): Promise<UserDTO> {
    const users = await this.userDAO.find({ userId }, ['id']);
    if (users.data.length === 0) throw new CustomError('User not found.', HttpStatusCode.NOT_FOUND, ApiErrorCode.USER, ApiErrorSubCode.NOT_FOUND);
    return this.userDAO.update(users.data[0].id, { status });
  }

  async getSelfUserProfile(userId: string): Promise<UserDTO> {
    const user = (await this.userDAO.find({ userId }, ['*'])).data[0];
    if (!user) throw new CustomError('User not found.', HttpStatusCode.NOT_FOUND, ApiErrorCode.USER, ApiErrorSubCode.NOT_FOUND);
    if (user.status !== UserStatus.ACTIVE) throw new CustomError('Email not verified.', HttpStatusCode.FORBIDDEN, ApiErrorCode.USER, ApiErrorSubCode.NOT_VERIFIED);
    return user;
  }

  async updateLastLogin(userId: string): Promise<void> {
    const users = await this.userDAO.find({ userId }, ['id']);
    if (users.data.length === 0) {
      throw new CustomError('User not found.', HttpStatusCode.NOT_FOUND, ApiErrorCode.USER, ApiErrorSubCode.NOT_FOUND);
    }

    await this.userDAO.update(users.data[0].id, {
      lastLoginAt: new Date().toISOString()
    });
  }

  async deleteUserProfile(userId: string): Promise<UserDTO> {
    const users = await this.userDAO.find({ userId, status: UserStatus.ACTIVE }, ['id']);
    if (users.data.length === 0) throw new CustomError('User not found.', HttpStatusCode.NOT_FOUND, ApiErrorCode.USER, ApiErrorSubCode.NOT_FOUND);
    await this.userDAO.update(users.data[0].id, { status: UserStatus.DEACTIVATED });
    return this.userDAO.findById(users.data[0].id);
  }

  async findSession(identifier: string): Promise<UserDTO | null> {
    this.logger.log(`Finding session for identifier=${identifier}`);

    // Try finding by email
    const userByEmail = await this.userDAO.find({ email: identifier }, ['*']);
    if (userByEmail.data.length > 0) {
      this.logger.log(`Found user by email: ${identifier}, userId=${userByEmail.data[0].userId}`);
      return userByEmail.data[0];
    }

    // Try finding by userId
    const userByUserId = await this.userDAO.find({ userId: identifier }, ['*']);
    if (userByUserId.data.length > 0) {
      this.logger.log(`Found user by userId: ${identifier}`);
      return userByUserId.data[0];
    }

    this.logger.warn(`No user found for identifier=${identifier}`);
    return null;
  }

  async getUserStats(): Promise<{ total: number; active: number; admins: number; deactivated: number }> {
    // Use service layer methods to get counts
    const totalUsers = await this.getUsers({}, 1, 1);
    const activeUsers = await this.getUsers({ status: UserStatus.ACTIVE }, 1, 1);
    const adminUsers = await this.getUsers({ role: Role.ADMIN }, 1, 1);
    const deactivatedUsers = await this.getUsers({ status: UserStatus.DEACTIVATED }, 1, 1);

    return {
      total: totalUsers.data.length,
      active: activeUsers.data.length,
      admins: adminUsers.data.length,
      deactivated: deactivatedUsers.data.length,
    };
  }

  async getUsersforDashboard(
    page: number,
    perPage: number,
    search?: string,
    status?: string,
    role?: string,
  ): Promise<PaginatedData<UserDTO & { consentCount: number; lastLogin: string }>> {
    const filter: any = {};

    // Search filter
    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    // Status filter
    if (status) {
      filter.status = status;
    }

    // Role filter
    if (role) {
      filter.role = role;
    }

    this.logger.log(`[USER-ADMIN] Fetching users with filter:`, filter);

    const users = await this.getUsers(filter, page, perPage);

    // Use service layer to get consent counts
    const enhancedData = await Promise.all(
      users.data.map(async (user) => {
        const consentCount = await this.consentService.getConsentCountForUser(user.userId);

        return {
          ...user,
          consentCount,
          lastLogin: user.lastLoginAt || null,
        };
      }),
    );

    this.logger.log(`[USER-ADMIN] Found ${enhancedData.length} users on page ${page}`);
    return { ...users, data: enhancedData };
  }
}
