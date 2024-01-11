import { BaseModel } from '@common/database/base-model';
import { Column, DeleteDateColumn, Entity, OneToMany } from 'typeorm';
import { UserVerificationCode } from './user-verification-code.entity';
import { UserRolEnum } from '../user.enum';

@Entity()
export class User extends BaseModel {
  @Column()
  name: string;

  @Column()
  slug: string;

  @Column({
    unique: true,
    nullable: true,
    transformer: {
      from: (val: string) => (val ? val.toLowerCase() : val),
      to: (val: string) => val,
    },
  })
  verifiedEmail?: string;

  @Column({
    unique: false,
    nullable: true,
    transformer: {
      from: (val: string) => (val ? val.toLowerCase() : val),
      to: (val: string) => val,
    },
  })
  notVerifiedEmail?: string;

  @Column()
  password: string;

  @Column({
    type: 'enum',
    enum: UserRolEnum,
    default: UserRolEnum.BORROWER,
  })
  role: UserRolEnum;

  @OneToMany(() => UserVerificationCode, code => code.user)
  userVerificationCodes?: UserVerificationCode[];

  @DeleteDateColumn({ type: 'timestamp' })
  deletedAt: Date;
}
