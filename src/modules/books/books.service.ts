import { Request, Response } from 'express';
import { GetAllBooksDto } from './dto/get-all-book.dto';
import bookRepository from './repositories/book.repository';
import { Like, MoreThan } from 'typeorm';
import {
  formatDateddmmyyyy,
  getDateOnly,
  responseWrapper,
  slugify,
} from '@common/utils';
import { CreateBookDto } from './dto/create-book.dto';
import bookAuthorRepository from './repositories/book-author.repository';
import { errorMessages } from '@common/errors/messages';
import fileService from '@modules/file/file.service';
import queueService from '@common/providers/queue';
import mailService from '@common/providers/mail';
import { BookABookDto } from './dto/book-a-book.dto';
import userRepository from '@modules/users/repositories/user.repository';
import bookBorrowDetailsRepository from './repositories/book-borrow-details.repository';
import { differenceInDays, differenceInMilliseconds } from 'date-fns';
import { ReturnBookDto } from './dto/return-book.dto';
import { CursorBasedPaginationDirection } from '@common/types/types';
import BaseError from '@common/errors/base-error';
import { BookAuthor } from './entities/book-author.entity';
export class BookService {
  bookQueueName = 'bookQueue';
  constructor() {
    queueService.createQueue(
      this.bookQueueName,
      undefined,
      this.processBookJob.bind(this),
    );
  }
  async getAllBooks(request: Request, response: Response) {
    const { authorId, page, limit, sortBy, searchKey, available } =
      request.params as GetAllBooksDto;
    const books = bookRepository.findPaginated(
      {
        ...(searchKey && {
          $or: [
            { title: Like(`%${searchKey}%`) },
            { ISBN: Like(`%${searchKey}%`) },
            { author: { name: Like(`%${searchKey}%`) } },
          ],
        }),
        ...(authorId && { authorId }),
        ...(available !== undefined && {
          availableQuantity: available ? MoreThan(0) : 0,
        }),
      },
      sortBy,
      page,
      limit,
    );
    return responseWrapper(books, response);
  }

  async createBook(input: CreateBookDto, response: Response) {
    await bookAuthorRepository.findOneOrError(
      { id: input.authorId },
      errorMessages.AUTHOR_NOT_FOUND,
    );
    if (input.bookCover) {
      await fileService.validateFilePath(input.bookCover);
      await fileService.makeFileHaveRefrence(input.bookCover);
    }
    const book = await bookRepository.createOne({
      ...input,
      slug: slugify(input.title),
      availableQuantity: input.totalQuantity,
    });
    return responseWrapper(book, response);
  }

  async updateBook(
    id: string,
    input: Partial<CreateBookDto>,
    response: Response,
  ) {
    const book = await bookRepository.findOneOrError(
      { id },
      errorMessages.BOOK_NOT_FOUND,
    );
    if (input.bookCover) {
      await fileService.validateFilePath(input.bookCover);
      await fileService.silentRemoveReference(book?.bookCover);
      await fileService.makeFileHaveRefrence(input.bookCover);
    }
    await bookRepository.updateOneFromExistingModel(book, {
      ...input,
      ...(input.totalQuantity && {
        availableQuantity: input.totalQuantity - book.numberOfBorrowed,
      }),
    });
    return responseWrapper(book, response);
  }

  async deleteBook(id: string, response: Response) {
    const book = await bookRepository.findOneOrError(
      { id },
      errorMessages.BOOK_NOT_FOUND,
    );
    await fileService.silentRemoveReference(book?.bookCover);
    await bookRepository.softDelete({ id });
    return responseWrapper(null, response);
  }

  async getSingleBook(slug: string, response: Response) {
    const book = await bookRepository.findOneOrError(
      { slug },
      errorMessages.BOOK_NOT_FOUND,
    );
    return responseWrapper(book, response);
  }

  async bookABook(
    bookSlug: string,
    userId: string,
    input: BookABookDto,
    response: Response,
  ) {
    const today = new Date();
    if (today > input.returnDate) {
      throw new BaseError(errorMessages.BOOKING_DATE_CANNOT_BE_IN_PAST);
    }
    if (differenceInDays(input.returnDate, today) >= 7) {
      throw new BaseError(
        errorMessages.BOOKING_DATE_CANNOT_BE_GREATER_THAN_7_DAYS,
      ); //TODO: change it according to business logic
    }
    const user = await userRepository.findOneOrError(
      { id: userId },
      errorMessages.USER_NOT_FOUND,
    );
    const book = await bookRepository.findOneOrError(
      { slug: bookSlug, availableQuantity: MoreThan(0) },
      errorMessages.BOOK_NOT_FOUND,
    );
    await bookBorrowDetailsRepository.createOne({
      bookId: book.id,
      borrowerId: user.id,
      returnDate: new Date(input.returnDate),
      borrowedDate: today,
    });
    await bookRepository.updateOneFromExistingModel(book, {
      availableQuantity: book.availableQuantity - 1,
      numberOfBorrowed: book.numberOfBorrowed + 1,
      borrowTime: book.borrowTime + 1,
    });
    await mailService.sendMail({
      to: user.verifiedEmail!,
      subject: 'Book Booked Successfully',
      templateName: 'booked-successfully',
      templateData: {
        bookName: book.title,
        startBookingDate: formatDateddmmyyyy(today),
        endBookingDate: formatDateddmmyyyy(new Date(input.returnDate)),
      },
    });
    await queueService.delayOrCreateWithDelay(
      this.bookQueueName,
      `${user.slug}-${book.slug}`,
      {
        input: {
          bookTitle: book.title,
          email: user.verifiedEmail!,
        },
      },
      differenceInMilliseconds(
        getDateOnly(new Date(input.returnDate)), // get only date without time
        getDateOnly(new Date()),
      ),
    );
    return responseWrapper(true, response);
  }

  async returnBook(bookSlug: string, userId: string, response: Response) {
    const book = await bookRepository.findOneOrError(
      { slug: bookSlug },
      errorMessages.BOOK_NOT_FOUND,
    );
    const user = await userRepository.findOneOrError(
      { id: userId },
      errorMessages.USER_NOT_FOUND,
    );
    const bookingDetails = await bookBorrowDetailsRepository.findOneOrError(
      {
        bookId: book.id,
        borrowerId: userId,
        actualReturnDate: null,
      },
      errorMessages.BOOKING_NOT_FOUND,
      undefined,
      undefined,
      { returnDate: 'ASC' }, // in case the user booked more than one in diffrent days return the nearest one
    );
    await bookBorrowDetailsRepository.updateOneFromExistingModel(
      bookingDetails,
      {
        actualReturnDate: new Date(),
      },
    );
    await bookRepository.updateOneFromExistingModel(book, {
      availableQuantity: book.availableQuantity + 1,
      numberOfBorrowed: book.numberOfBorrowed - 1,
    });
    await queueService.removeFromQueue(
      this.bookQueueName,
      `${user.slug}-${book.slug}`,
    );
    return responseWrapper(true, response);
  }

  async myBookedBooks(
    userId: string,
    searchKey: string,
    page: number | string = 1,
    limit: number | string = 15,
    response: Response,
  ) {
    const bookDetails = await bookBorrowDetailsRepository.findPaginated(
      {
        borrowerId: userId,
        ...(searchKey && {
          book: {
            title: Like(`%${searchKey}%`),
            description: Like(`%${searchKey}%`),
            ISBN: Like(`%${searchKey}%`),
            author: {
              name: Like(`%${searchKey}%`),
            },
          },
        }),
      },
      {
        borrowedDate: 'DESC',
      },
      +page,
      +limit,
      { book: true },
    );
    return responseWrapper(bookDetails, response);
  }

  async bookBorrowedTimeLine(
    cursor: string,
    slug: string,
    direction: CursorBasedPaginationDirection = CursorBasedPaginationDirection.AFTER,
    limit: number | string = 15,
    response: Response,
  ) {
    const bookDetails =
      await bookBorrowDetailsRepository.dailyCurseredPaginated(
        { book: { slug } },
        cursor,
        direction,
        +limit,
        { book: true, borrower: true },
        'borrowedDate',
        'DATE',
      );
    return responseWrapper(bookDetails, response);
  }

  async createBookAuthor(input: Partial<BookAuthor>, response: Response) {
    await bookAuthorRepository.findOneWithErorr({
      name: input.name,
    });
    if (input.avatar) {
      await fileService.validateFilePath(input.avatar);
      await fileService.makeFileHaveRefrence(input.avatar);
    }
    const bookAuthor = await bookAuthorRepository.createOne({
      ...input,
      slug: slugify(input.name!),
    });
    return responseWrapper(bookAuthor, response);
  }

  async updatateBookAuthor(
    authorSlug: string,
    input: Partial<BookAuthor>,
    response: Response,
  ) {
    const author = await bookAuthorRepository.findOneOrError(
      {
        slug: authorSlug,
      },
      errorMessages.AUTHOR_NOT_FOUND,
    );
    if (input.avatar) {
      await fileService.validateFilePath(input.avatar);
      await fileService.silentRemoveReference(author?.avatar);
      await fileService.makeFileHaveRefrence(input.avatar);
    }
    const updatedAuthor = await bookAuthorRepository.updateOneFromExistingModel(
      author,
      input,
    );
    return responseWrapper(updatedAuthor, response);
  }

  async deleteBookAuthor(authorSlug: string, response: Response) {
    await bookAuthorRepository.findOneOrError(
      {
        slug: authorSlug,
      },
      errorMessages.AUTHOR_NOT_FOUND,
    );
    await bookAuthorRepository.softDelete({ slug: authorSlug });
    return responseWrapper(null, response);
  }

  async getBookAuthors(
    searchKey: string,
    page: number | string = 1,
    limit: number | string = 15,
    response: Response,
  ) {
    const authors = await bookAuthorRepository.findPaginated(
      {
        ...(searchKey && {
          name: Like(`%${searchKey}%`),
        }),
      },
      {
        createdAt: 'DESC',
      },
      +page,
      +limit,
    );
    return responseWrapper(authors, response);
  }

  async getBookAuthor(authorSlug: string, response: Response) {
    const author = await bookAuthorRepository.findOneOrError(
      {
        slug: authorSlug,
      },
      errorMessages.AUTHOR_NOT_FOUND,
    );
    return responseWrapper(author, response);
  }

  private async processBookJob(job: any) {
    const input = job.data
      ? job.data.input
      : (job.input as { bookTitle: string; email: string });
    await mailService.sendMail({
      to: input.email,
      subject: 'Book return reminder',
      templateName: 'warn-to-return',
      templateData: {
        bookTitle: input.bookTitle,
      },
    });
  }
}
