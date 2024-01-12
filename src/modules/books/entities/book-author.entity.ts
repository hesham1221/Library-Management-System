import { Column, DeleteDateColumn, Entity, OneToMany } from 'typeorm';
import { Book } from './book.entity';
import { BaseModel } from '@common/database/base-model';

@Entity()
export class BookAuthor extends BaseModel {
  @Column()
  name: string;

  @Column()
  slug: string;

  @Column({ nullable: true , type: 'text'})
  description?: string;

  @Column({ nullable: true })
  avatar?: string;

  @OneToMany(() => Book, book => book.author)
  books: Book[];

  @DeleteDateColumn({ type: 'timestamp' })
  deletedAt: Date;
}
