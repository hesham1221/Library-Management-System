import { BaseModel } from '@common/database/base-model';
import {
  Column,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { BookBorrowDetails } from './book-borrow-details.entity';
import { BookAuthor } from './book-author.entity';

@Entity()
export class Book extends BaseModel {
  @Column()
  title: string;

  @Column()
  ISBN: string;

  @Column({ nullable: true })
  bookCover?: string;

  @Column()
  slug: string;

  @Column({ default: 0 })
  numberOfBorrowed: number; // number of books that are borrowed now

  @Column({ default: 0 })
  borrowTime: number; // number the times of the book that been borrowed

  @Column({ default: 0 })
  availableQuantity: number; // available quantity of the book now (without borrowed books)

  @Column({ default: 0 })
  totalQuantity: number; // total quantity of the book

  @Column({ nullable: true })
  description?: string;

  @Column({ nullable: true })
  shelfLocation?: string;

  @Column()
  authorId: string;

  @ManyToOne(() => BookAuthor, author => author.books)
  author: BookAuthor;

  @OneToMany(() => BookBorrowDetails, details => details.borrower)
  bookBorrowDetails?: BookBorrowDetails[];

  @DeleteDateColumn({ type: 'timestamp' })
  deletedAt: Date;
}
