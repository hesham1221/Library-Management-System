import { UserRolEnum } from '../user.enum';

export class UpdateUserDetails {
  name?: string;
  email?: string;
  userId: string;
  password?: string;
  role?: UserRolEnum;
}
