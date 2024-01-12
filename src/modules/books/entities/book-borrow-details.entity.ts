import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { Book } from './book.entity';
import { User } from '@modules/users/entities/user.entity';
import { BaseModel } from '@common/database/base-model';

@Entity()
export class BookBorrowDetails extends BaseModel {
  @Column()
  bookId: string;

  @ManyToOne(() => Book, book => book.bookBorrowDetails)
  @JoinColumn({ name: 'bookId' })
  book: Book;

  @Column()
  borrowerId: string;

  @ManyToOne(() => User, book => book.bookBorrowDetails)
  @JoinColumn({ name: 'borrowerId' })
  borrower: User;

  @Column({ type: 'timestamp' })
  borrowedDate: Date;

  @Column({ type: 'timestamp' })
  returnDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  actualReturnDate?: Date;
}
