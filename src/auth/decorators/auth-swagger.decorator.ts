import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

export function AuthControllerSwagger() {
  return applyDecorators(ApiTags('auth'));
}

export function SignupSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Sign up a new user with email and password' }),
    ApiResponse({ status: 201, description: 'User created, OTP sent for verification' }),
    ApiResponse({ status: 409, description: 'Email already exists' }),
  );
}

export function LoginSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Login a user with email and password' }),
    ApiResponse({ status: 200, description: 'User logged in successfully' }),
    ApiResponse({ status: 401, description: 'Invalid email or password' }),
  );
}

export function ForgotPasswordSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Request a password reset OTP' }),
    ApiResponse({ status: 200, description: 'OTP generated and returned (local testing)' }),
    ApiResponse({ status: 400, description: 'User not found' }),
  );
}

export function ResetPasswordSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Reset password using OTP' }),
    ApiResponse({ status: 200, description: 'Password reset successfully' }),
    ApiResponse({ status: 400, description: 'Invalid or expired OTP' }),
  );
}

export function VerifyEmailOtpSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Verify email using OTP' }),
    ApiResponse({ status: 200, description: 'Email verified successfully' }),
    ApiResponse({ status: 400, description: 'Invalid or expired OTP' }),
  );
}
