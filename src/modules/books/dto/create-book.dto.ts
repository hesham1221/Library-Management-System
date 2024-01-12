export class CreateBookDto {
  title: string;

  ISBN: string;

  bookCover?: string;

  totalQuantity?: number = 0;

  description?: string;

  shelfLocation?: string;

  authorId: string;
}
