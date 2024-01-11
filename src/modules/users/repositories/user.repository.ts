import { BaseRepository } from '@common/types/base-repository';
import { User } from '../entities/user.entity';
import { DataSource } from 'typeorm';
import { dataSource } from '@common/database';

class UserRepository extends BaseRepository<User> {
  constructor(private dataSource: DataSource) {
    super(User, dataSource.createEntityManager());
  }
}
export default new UserRepository(dataSource);
