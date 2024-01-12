import { BaseRepository } from '@common/types/base-repository';
import { DataSource } from 'typeorm';
import { dataSource } from '@common/database';
import { Book } from '../entities/book.entity';

class BookRepository extends BaseRepository<Book> {
  constructor(private dataSource: DataSource) {
    super(Book, dataSource.createEntityManager());
  }
}
export default new BookRepository(dataSource);
