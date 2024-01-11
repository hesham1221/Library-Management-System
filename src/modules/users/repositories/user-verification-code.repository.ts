import { DataSource } from 'typeorm';
import { UserVerificationCode } from '../entities/user-verification-code.entity';
import { BaseRepository } from '@common/types/base-repository';
import { dataSource } from '@common/database';

class UserVerificationCodeRepository extends BaseRepository<UserVerificationCode> {
  constructor(private dataSource: DataSource) {
    super(UserVerificationCode, dataSource.createEntityManager());
  }
}

export default new UserVerificationCodeRepository(dataSource);
