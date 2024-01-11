import { UserRolEnum } from '../user.enum';

export class CreateUserByAdminInput {
  name: string;
  email: string;
  password: string;
  role: UserRolEnum = UserRolEnum.BORROWER;
}
