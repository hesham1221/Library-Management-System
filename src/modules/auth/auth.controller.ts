import { Request, Response } from 'express';
import { AuthService } from './auth.service';
export class AuthController {
  login(request: Request, response: Response) {
    const authService = new AuthService();
    return authService.loginAdmin(request.body, response);
  }
}
