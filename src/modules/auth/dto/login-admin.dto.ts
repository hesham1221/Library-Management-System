import { UserRolEnum } from '@modules/users/user.enum';

export class LoginDto {
  email: string;
  password: string;
  role: UserRolEnum = UserRolEnum.BORROWER;
}
