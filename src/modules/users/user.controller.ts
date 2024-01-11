import { UserService } from './user.service';
import { Request, Response } from 'express';
export class UserController {
  async createUserByAdmin(request: Request, response: Response) {
    const userService: UserService = new UserService();
    return userService.createUserByAdmin(request.body, response);
  }
  async updateUserByAdmin(request: Request, response: Response) {
    const userService: UserService = new UserService();
    return userService.updateUserByAdmin(request.body, response);
  }
  async deleteUserByAdmin(request: Request, response: Response) {
    const userService: UserService = new UserService();
    return userService.deleteUserByAdmin(request.params.id, response);
  }
  async getUsers(request: Request, response: Response) {
    const userService: UserService = new UserService();
    return userService.usersBoard(request, response);
  }
  async userBoard(request: Request, response: Response) {
    const userService: UserService = new UserService();
    return userService.userBoard(request.params.slug, response);
  }
}
