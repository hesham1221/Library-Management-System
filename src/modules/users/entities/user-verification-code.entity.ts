import { Entity, Column, ManyToOne } from 'typeorm';
import { User } from './user.entity';
import { BaseModel } from '@common/database/base-model';
import { UserVerificationCodeUseCaseEnum } from '../user.enum';

@Entity()
export class UserVerificationCode extends BaseModel {
  @Column({
    type: 'enum',
    enum: UserVerificationCodeUseCaseEnum,
    default: UserVerificationCodeUseCaseEnum.PASSWORD_RESET,
  })
  useCase: UserVerificationCodeUseCaseEnum;

  @Column()
  code: string;

  @Column({ type: 'timestamp' })
  expiryDate: Date;

  @ManyToOne(() => User, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  user: User;
}
