import { errorMessages } from '@common/errors/messages';
import { CreateUserByAdminInput } from './dto/create-user-by-admin.dto';
import userRepository from './repositories/user.repository';
import {
  hashPassword,
  matchPassword,
  responseWrapper,
  slugify,
} from '@common/utils';
import { Response, Request } from 'express';
import { UpdateUserDetails } from './dto/update-borrower-details';
import BaseError from '@common/errors/base-error';
import { Like } from 'typeorm';
import { UserRolEnum } from './user.enum';
export class UserService {
  async createUserByAdmin(input: CreateUserByAdminInput, response: Response) {
    await userRepository.findOneWithErorr(
      { verifiedEmail: input.email },
      errorMessages.USER_ALREADY_EXISTS,
    );
    const { email, password, ...rest } = input;
    const user = await userRepository.createOne({
      ...rest,
      verifiedEmail: email,
      password: await hashPassword(password),
      slug: slugify(rest.name),
    });
    return responseWrapper(user, response);
  }

  async updateUserByAdmin(
    slug: string,
    input: UpdateUserDetails,
    response: Response,
  ) {
    const { email, password, ...rest } = input;
    const user = await userRepository.findOneOrError({ slug: slug });
    email &&
      (await userRepository.findOneWithErorr(
        { verifiedEmail: email },
        errorMessages.USER_WITH_SAME_EMAIL_ALREADY_EXISTS,
      ));
    if (password && (await matchPassword(password, user.password, false))) {
      throw new BaseError(errorMessages.PASSWORD_CANNOT_BE_SAME);
    }
    const updatedUser = await userRepository.updateOneFromExistingModel(user, {
      ...rest,
      ...(email && { verifiedEmail: email }),
      ...(password && { password: await hashPassword(password) }),
    });
    return responseWrapper(updatedUser, response);
  }

  async deleteUserByAdmin(slug: string, response: Response) {
    await userRepository.findOneOrError({ slug }, errorMessages.USER_NOT_FOUND);
    await userRepository.softDelete({ slug }); // soft delete user as if he borrowed a book
    return responseWrapper(null, response);
  }

  async usersBoard(request: Request, response: Response) {
    const page = Number(request.query.page) || 1;
    const limit = Number(request.query.limit) || 15;
    const searchKey = request.query.searchKey;
    const role = request.query.role as UserRolEnum;

    const users = await userRepository.findPaginated(
      {
        ...(searchKey && {
          $or: [
            { name: Like(`%${searchKey}%`) },
            { verifiedEmail: Like(`%${searchKey}%`) },
          ],
        }),
        ...(role && { role }),
      },
      { createdAt: 'desc' },
      page,
      limit,
    );
    return responseWrapper(users, response, undefined, undefined, 'items');
  }

  async userBoard(slug: string, response: Response) {
    const user = await userRepository.findOneOrError({ slug });
    return responseWrapper(user, response);
  }

  async me(request: Request, response: Response) {
    const user = await userRepository.findOneOrError(
      { id: request.user.id },
      errorMessages.USER_NOT_FOUND,
    );
    return responseWrapper(user, response);
  }
}
