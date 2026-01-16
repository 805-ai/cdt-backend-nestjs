import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { getFirebaseClientConfig } from './firebase.init';
import { CustomError } from '../../errors/custom.error';
import { HttpStatusCode } from '../../enums/codes/http-error-code.enum';
import { ApiErrorCode } from '../../enums/codes/api-error.enum';
import { ApiErrorSubCode } from '../../enums/codes/api-error-subcode.enum';

@Injectable()
export class FirebaseClientService {
  private readonly apiKey: string;

  constructor() {
    const config = getFirebaseClientConfig();
    this.apiKey = config.apiKey;
  }

  async signUpWithEmail(email: string, password: string) {
    try {
      const response = await axios.post(`https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${this.apiKey}`, {
        email,
        password,
        returnSecureToken: true,
      });
      return response.data;
    } catch (error) {
      throw new CustomError(
        `Sign up failed: ${error.response?.data?.error?.message || error.message}`,
        HttpStatusCode.BAD_REQUEST,
        ApiErrorCode.USER,
        ApiErrorSubCode.OPERATION_FAILED,
        error.stack,
      );
    }
  }

  async signInWithEmail(email: string, password: string) {
    try {
      const response = await axios.post(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${this.apiKey}`, {
        email,
        password,
        returnSecureToken: true,
      });
      return response.data;
    } catch (error) {
      throw new CustomError(
        `Sign in failed: ${error.response?.data?.error?.message || error.message}`,
        HttpStatusCode.UNAUTHORIZED,
        ApiErrorCode.USER,
        ApiErrorSubCode.INVALID_CREDENTIALS,
        error.stack,
      );
    }
  }

  async changePassword(idToken: string, password: string) {
    try {
      const response = await axios.post(`https://identitytoolkit.googleapis.com/v1/accounts:update?key=${this.apiKey}`, {
        idToken,
        password,
        returnSecureToken: true,
      });
      return response.data;
    } catch (error) {
      throw new CustomError(
        `Password change failed: ${error.response?.data?.error?.message || error.message}`,
        HttpStatusCode.BAD_REQUEST,
        ApiErrorCode.USER,
        ApiErrorSubCode.OPERATION_FAILED,
        error.stack,
      );
    }
  }

  async resetPassword(email: string) {
    try {
      const response = await axios.post(`https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=${this.apiKey}`, {
        requestType: 'PASSWORD_RESET',
        email,
      });
      return response.data;
    } catch (error) {
      throw new CustomError(
        `Password reset failed: ${error.response?.data?.error?.message || error.message}`,
        HttpStatusCode.BAD_REQUEST,
        ApiErrorCode.USER,
        ApiErrorSubCode.OPERATION_FAILED,
        error.stack,
      );
    }
  }

  async refreshToken(refreshToken: string) {
    try {
      const response = await axios.post(`https://securetoken.googleapis.com/v1/token?key=${this.apiKey}`, {
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      });
      return response.data;
    } catch (error) {
      throw new CustomError(
        `Token refresh failed: ${error.response?.data?.error?.message || error.message}`,
        HttpStatusCode.UNAUTHORIZED,
        ApiErrorCode.USER,
        ApiErrorSubCode.INVALID_CREDENTIALS,
        error.stack,
      );
    }
  }
}
