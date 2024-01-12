import { BaseRepository } from '@common/types/base-repository';
import { DataSource } from 'typeorm';
import { dataSource } from '@common/database';
import { BookBorrowDetails } from '../entities/book-borrow-details.entity';

class BookBorrowDetailsRepository extends BaseRepository<BookBorrowDetails> {
  constructor(private dataSource: DataSource) {
    super(BookBorrowDetails, dataSource.createEntityManager());
  }
}
export default new BookBorrowDetailsRepository(dataSource);
