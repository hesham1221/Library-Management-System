import { Request, Response } from 'express';
import { BookService } from './books.service';
import { CursorBasedPaginationDirection } from '@common/types/types';
export class BookController {
  async getAllBooks(request: Request, response: Response) {
    const bookService = new BookService();
    return bookService.getAllBooks(request, response);
  }
  async createBook(request: Request, response: Response) {
    const bookService = new BookService();
    return bookService.createBook(request.body, response);
  }
  async updateBook(request: Request, response: Response) {
    const bookService = new BookService();
    return bookService.updateBook(request.params.id, request.body, response);
  }

  async deleteBook(request: Request, response: Response) {
    const bookService = new BookService();
    return bookService.deleteBook(request.params.id, response);
  }

  async getSingleBook(request: Request, response: Response) {
    const bookService = new BookService();
    return bookService.getSingleBook(request.params.slug, response);
  }

  async bookABook(request: Request, response: Response) {
    const bookService = new BookService();
    return bookService.bookABook(
      request.params.slug,
      request.user.id,
      request.body,
      response,
    );
  }
  async myBookedBooks(request: Request, response: Response) {
    const bookService = new BookService();
    return bookService.myBookedBooks(
      request.user.id,
      request.query.searchKey as string,
      request.query.page as string,
      request.query.limit as string,
      response,
    );
  }
  async returnBook(request: Request, response: Response) {
    const bookService = new BookService();
    return bookService.returnBook(
      request.params.slug,
      request.user.id,
      response,
    );
  }
  async bookBorrowedTimeLine(request: Request, response: Response) {
    const bookService = new BookService();
    return bookService.bookBorrowedTimeLine(
      request.query.cursor as string,
      request.params.slug as string,
      request.query.direction as CursorBasedPaginationDirection,
      request.query.limit as string,
      response,
    );
  }

  async createBookAuthor(request: Request, response: Response) {
    const bookService = new BookService();
    return bookService.createBookAuthor(request.body, response);
  }
  async updateBookAuthor(request: Request, response: Response) {
    const bookService = new BookService();
    return bookService.updatateBookAuthor(
      request.params.slug,
      request.body,
      response,
    );
  }
  async deleteBookAuthor(request: Request, response: Response) {
    const bookService = new BookService();
    return bookService.deleteBookAuthor(request.params.slug, response);
  }
  async getBookAuthor(request: Request, response: Response) {
    const bookService = new BookService();
    return bookService.getBookAuthor(request.params.slug, response);
  }
  async getBookAuthors(request: Request, response: Response) {
    const bookService = new BookService();
    return bookService.getBookAuthors(
      request.query.searchKey as string,
      request.query.page as string,
      request.query.limit as string,
      response,
    );
  }
}
