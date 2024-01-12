import { BaseRepository } from '@common/types/base-repository';
import { DataSource } from 'typeorm';
import { dataSource } from '@common/database';
import { BookAuthor } from '../entities/book-author.entity';

class BookAuthorRepository extends BaseRepository<BookAuthor> {
  constructor(private dataSource: DataSource) {
    super(BookAuthor, dataSource.createEntityManager());
  }
}
export default new BookAuthorRepository(dataSource);
