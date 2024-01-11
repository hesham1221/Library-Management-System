import { Request, Response } from 'express';
import { AuthService } from './auth.service';
export class AuthController {
  login(request: Request, response: Response) {
    const authService = new AuthService();
    return authService.login(request.body, response);
  }
  signupBorrower(request: Request, response: Response) {
    const authService = new AuthService();
    return authService.signupBorrower(request.body, response);
  }
  resendOtp(request: Request, response: Response) {
    const authService = new AuthService();
    return authService.resendOtp(
      request.body.email,
      request.body.useCase,
      response,
    );
  }
  verifyOtp(request: Request, response: Response) {
    const authService = new AuthService();
    return authService.verifyOtp(
      request.body.email,
      request.body.otp,
      request.body.useCase,
      response,
    );
  }
  forgetPassword(request: Request, response: Response) {
    const authService = new AuthService();
    return authService.forgetPassword(request.body.email, response);
  }
  resetPassword(request: Request, response: Response) {
    const authService = new AuthService();
    return authService.resetPassword(
      request.body.email,
      request.body.otp,
      request.body.newPassword,
      response,
    );
  }
}
