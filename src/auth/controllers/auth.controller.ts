import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { AuthControllerSwagger, ForgotPasswordSwagger, LoginSwagger, ResetPasswordSwagger, VerifyEmailOtpSwagger, SignupSwagger } from '../decorators/auth-swagger.decorator';
import { ForgotPasswordDto } from '../dtos/forgot-password.dto';
import { LoginDto } from '../dtos/login.dto';
import { ResetPasswordDto } from '../dtos/reset-password.dto';
import { VerifyEmailOtpDto } from '../dtos/verify-email-otp.dto';
import { AuthService } from '../services/auth.service';
import { UserCreateRequest } from 'src/user/requests/user-create.request';
import { UserCreateResponse } from 'src/user/responses/user-create.response';

@AuthControllerSwagger()
@Controller({
  path: 'auth',
  version: '1',
})
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  @HttpCode(201)
  @SignupSwagger()
  async signup(@Body() signupDto: UserCreateRequest) {
    const res = await this.authService.signup(signupDto);
    console.log('🚀 ~ auth.controller.ts:24 ~ AuthController ~ signup ~ res:', res);

    return res;
  }

  @Post('login')
  @HttpCode(200)
  @LoginSwagger()
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto.email, loginDto.password);
  }

  @Post('forgot-password')
  @HttpCode(200)
  @ForgotPasswordSwagger()
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    const otp = await this.authService.generateOtp(forgotPasswordDto.email);
    return { message: 'OTP generated', otp };
  }

  @Post('reset-password')
  @HttpCode(200)
  @ResetPasswordSwagger()
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    await this.authService.resetPassword(resetPasswordDto.email, resetPasswordDto.otp, resetPasswordDto.newPassword);
    return { message: 'Password reset successfully' };
  }

  @Post('verify-email-otp')
  @HttpCode(200)
  @VerifyEmailOtpSwagger()
  async verifyEmailOtp(@Body() verifyEmailOtpDto: VerifyEmailOtpDto) {
    return this.authService.verifyOtp(verifyEmailOtpDto.email, verifyEmailOtpDto.otp, 'email-verification');
  }
}
