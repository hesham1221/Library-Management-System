import { Response } from 'express';
import { hashPassword, slugify } from '@common/utils';
import { UserService } from '../user.service';
import { CreateUserByAdminInput } from '../dto/create-user-by-admin.dto';
import userRepository from '../repositories/user.repository';
import { UserRolEnum } from '../user.enum';

jest.mock('../repositories/user.repository', () => ({
  ...jest.requireActual('../repositories/user.repository'),
  findOneWithErorr: jest.fn(),
  createOne: jest.fn(),
  findPaginated: jest.fn(),
}));
jest.mock('@common/utils', () => ({
  hashPassword: jest.fn(),
  responseWrapper: jest.fn(),
  slugify: jest.fn(),
}));

describe('UserService', () => {
  let userService: UserService;
  let mockResponse: Response;

  beforeEach(() => {
    userService = new UserService();
    mockResponse = new Response() as any;
  });

  describe('createUserByAdmin', () => {
    it('should create a new user', async () => {
      const input: CreateUserByAdminInput = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
        role: UserRolEnum.BORROWER,
      };
      const expectedSlug = 'test-user';
      const hashedPassword = 'hashedPassword123';

      (userRepository.findOneWithErorr as jest.Mock).mockResolvedValue(null);
      (hashPassword as jest.Mock).mockResolvedValue(hashedPassword);
      (slugify as jest.Mock).mockReturnValue(expectedSlug);
      await userService.createUserByAdmin(input, mockResponse);
      expect(userRepository.findOneWithErorr).toHaveBeenCalledWith(
        { verifiedEmail: input.email },
        expect.anything(),
      );
      expect(hashPassword).toHaveBeenCalledWith(input.password);
      expect(slugify).toHaveBeenCalledWith(input.name);
      expect(userRepository.createOne).toHaveBeenCalledWith(expect.any(Object));
    });
  });
});
