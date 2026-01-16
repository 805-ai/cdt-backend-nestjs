import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { ApiErrorSubCode } from '../../enums/codes/api-error-subcode.enum';
import { ApiErrorCode } from '../../enums/codes/api-error.enum';
import { HttpStatusCode } from '../../enums/codes/http-error-code.enum';
import { CustomError } from '../../errors/custom.error';
import { initializeFirebaseAdmin, verifyFirebaseConnection } from './firebase.init';

@Injectable()
export class FirebaseAdminService implements OnModuleInit {
  private readonly logger = new Logger(FirebaseAdminService.name);
  private adminApp: admin.app.App;

  constructor() {
    try {
      this.adminApp = initializeFirebaseAdmin();
    } catch (error) {
      this.logger.error('Failed to initialize Firebase Admin SDK in service', error.stack);
      throw new CustomError(
        `Firebase Admin initialization failed: ${error.message}`,
        HttpStatusCode.INTERNAL_SERVER_ERROR,
        ApiErrorCode.SYSTEM,
        ApiErrorSubCode.INITIALIZATION_FAILED,
        error.stack,
      );
    }
  }

  async onModuleInit() {
    try {
      const isConnected = await verifyFirebaseConnection(this.adminApp);
      if (!isConnected) {
        const errorMessage = 'Firebase Admin SDK connection verification failed';
        this.logger.error(errorMessage);
        throw new CustomError(errorMessage, HttpStatusCode.INTERNAL_SERVER_ERROR, ApiErrorCode.SYSTEM, ApiErrorSubCode.INITIALIZATION_FAILED);
      }
      this.logger.log('Firebase Admin SDK connection verified during module initialization');
    } catch (error) {
      this.logger.error('Failed to verify Firebase connection during module initialization', error.stack);
      throw error;
    }
  }

  private checkFirebaseConfig() {
    if (!this.adminApp) {
      throw new CustomError('Firebase Admin SDK not initialized', HttpStatusCode.INTERNAL_SERVER_ERROR, ApiErrorCode.SYSTEM, ApiErrorSubCode.INITIALIZATION_FAILED);
    }
  }

  async createUser(email: string, password: string, displayName?: string, role: string = 'USER') {
    this.checkFirebaseConfig();
    this.logger.log(`Creating user with email=${email}, displayName=${displayName}, role=${role}`);
    try {
      const userRecord = await this.adminApp.auth().createUser({
        email,
        password,
        displayName,
      });
      const customClaims = {
        email,
        role,
        roles: [role],
      };
      await this.adminApp.auth().setCustomUserClaims(userRecord.uid, customClaims);
      const token = await this.adminApp.auth().createCustomToken(userRecord.uid, customClaims);

      this.logger.log(`User created successfully: ${JSON.stringify(userRecord)}`);
      return { user: userRecord, token };
    } catch (error) {
      this.logger.error(`Failed to create user with email=${email}`, error.stack);
      throw new CustomError(`Failed to create user: ${error.message}`, HttpStatusCode.BAD_REQUEST, ApiErrorCode.USER, ApiErrorSubCode.OPERATION_FAILED, error.stack);
    }
  }

  async getUser(uid: string) {
    this.checkFirebaseConfig();
    this.logger.log(`Fetching user uid=${uid}`);
    try {
      const userRecord = await this.adminApp.auth().getUser(uid);
      this.logger.log(`Fetched user: ${JSON.stringify(userRecord)}`);
      return userRecord;
    } catch (error) {
      this.logger.error(`Failed to get user uid=${uid}`, error.stack);
      throw new CustomError(`Failed to get user: ${error.message}`, HttpStatusCode.NOT_FOUND, ApiErrorCode.USER, ApiErrorSubCode.NOT_FOUND, error.stack);
    }
  }

  async getUserByEmail(email: string) {
    this.checkFirebaseConfig();
    this.logger.log(`Fetching user by email=${email}`);
    try {
      const userRecord = await this.adminApp.auth().getUserByEmail(email);
      this.logger.log(`Fetched user: ${JSON.stringify(userRecord)}`);
      return userRecord;
    } catch (error) {
      this.logger.error(`Failed to get user by email=${email}`, error.stack);
      throw new CustomError(`Failed to get user: ${error.message}`, HttpStatusCode.NOT_FOUND, ApiErrorCode.USER, ApiErrorSubCode.NOT_FOUND, error.stack);
    }
  }

  async createCustomToken(uid: string, additionalClaims?: object) {
    this.checkFirebaseConfig();
    this.logger.log(`Creating custom token for uid=${uid}`);
    try {
      const token = await this.adminApp.auth().createCustomToken(uid, additionalClaims);
      this.logger.log(`Custom token created successfully for uid=${uid}`);
      return token;
    } catch (error) {
      this.logger.error(`Failed to create custom token for uid=${uid}`, error.stack);
      throw new CustomError(
        `Failed to create custom token: ${error.message}`,
        HttpStatusCode.INTERNAL_SERVER_ERROR,
        ApiErrorCode.SYSTEM,
        ApiErrorSubCode.OPERATION_FAILED,
        error.stack,
      );
    }
  }

  async updateUser(uid: string, updates: admin.auth.UpdateRequest) {
    this.checkFirebaseConfig();
    this.logger.log(`Updating user uid=${uid}, updates=${JSON.stringify(updates)}`);
    try {
      const userRecord = await this.adminApp.auth().updateUser(uid, updates);
      this.logger.log(`User updated successfully: ${JSON.stringify(userRecord)}`);
      return userRecord;
    } catch (error) {
      this.logger.error(`Failed to update user uid=${uid}`, error.stack);
      throw new CustomError(`Failed to update user: ${error.message}`, HttpStatusCode.BAD_REQUEST, ApiErrorCode.USER, ApiErrorSubCode.OPERATION_FAILED, error.stack);
    }
  }

  async deleteUser(uid: string) {
    this.checkFirebaseConfig();
    this.logger.log(`Deleting user uid=${uid}`);
    try {
      await this.adminApp.auth().deleteUser(uid);
      this.logger.log(`User deleted successfully uid=${uid}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to delete user uid=${uid}`, error.stack);
      throw new CustomError(`Failed to delete user: ${error.message}`, HttpStatusCode.BAD_REQUEST, ApiErrorCode.USER, ApiErrorSubCode.OPERATION_FAILED, error.stack);
    }
  }

  async setCustomUserClaims(uid: string, claims: any) {
    this.checkFirebaseConfig();
    this.logger.log(`Setting custom claims for uid=${uid}, claims=${JSON.stringify(claims)}`);
    try {
      await this.adminApp.auth().setCustomUserClaims(uid, claims);
      this.logger.log(`Custom claims set successfully for uid=${uid}, claims = ${claims}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to set custom claims for uid=${uid}`, error.stack);
      throw new CustomError(`Failed to set custom claims: ${error.message}`, HttpStatusCode.BAD_REQUEST, ApiErrorCode.USER, ApiErrorSubCode.OPERATION_FAILED, error.stack);
    }
  }

  async verifyIdToken(idToken: string) {
    this.checkFirebaseConfig();
    this.logger.log(`Verifying ID token`);
    try {
      const decodedToken = await this.adminApp.auth().verifyIdToken(idToken);
      this.logger.log(`ID token verified successfully: ${JSON.stringify(decodedToken)}`);
      return decodedToken;
    } catch (error) {
      this.logger.error(`Failed to verify ID token`, error.stack);
      throw new CustomError(`Failed to verify token: ${error.message}`, HttpStatusCode.UNAUTHORIZED, ApiErrorCode.USER, ApiErrorSubCode.INVALID_CREDENTIALS, error.stack);
    }
  }
}
