import { Router } from 'express';
import { BookController } from '../book.controller';
import isAuthenticated from '@common/middlewares/is-authenticated.middleware';
import isAdmin from '@common/middlewares/is-admin.middleware';
import { Joi, Segments, celebrate } from 'celebrate';
import { enumToArray } from '@common/utils';
import { CursorBasedPaginationDirection } from '@common/types/types';

const bookRouter = Router();
const bookController = new BookController();

bookRouter.get('/books', bookController.getAllBooks);
bookRouter.get('/booked', isAuthenticated, bookController.myBookedBooks);
bookRouter.get('/book/:slug', bookController.getSingleBook);
bookRouter.get(
  '/book/:slug/history',
  celebrate({
    [Segments.QUERY]: {
      cursor: Joi.string(),
      direction: Joi.string().valid(
        ...enumToArray(CursorBasedPaginationDirection),
      ),
      limit: Joi.number(),
    },
  }),
  isAuthenticated,
  isAdmin,
  bookController.bookBorrowedTimeLine,
);
bookRouter.post(
  '/book/:slug/return',
  isAuthenticated,
  bookController.returnBook,
);
bookRouter.post(
  '/book/:slug',
  isAuthenticated,
  celebrate({
    [Segments.BODY]: {
      returnDate: Joi.number().required(),
    },
  }),
  bookController.bookABook,
);
bookRouter.post(
  '/book',
  celebrate({
    [Segments.BODY]: {
      title: Joi.string().required(),

      ISBN: Joi.string().required(),

      bookCover: Joi.string(),

      totalQuantity: Joi.number().default(0),

      description: Joi.string(),

      shelfLocation: Joi.string(),

      authorId: Joi.string().required(),
    },
  }),
  isAuthenticated,
  isAdmin,
  bookController.createBook,
);
bookRouter.patch(
  '/book/:id',
  celebrate({
    [Segments.BODY]: {
      title: Joi.string(),

      ISBN: Joi.string(),

      bookCover: Joi.string(),

      totalQuantity: Joi.number(),

      description: Joi.string(),

      shelfLocation: Joi.string(),

      authorId: Joi.string(),
    },
  }),
  isAuthenticated,
  isAdmin,
  bookController.updateBook,
);
bookRouter.delete(
  '/book/:id',
  isAuthenticated,
  isAdmin,
  bookController.deleteBook,
);
bookRouter.post(
  '/author',
  celebrate({
    [Segments.BODY]: {
      name: Joi.string().required(),
      description: Joi.string(),
      avatar: Joi.string(),
    },
  }),
  isAuthenticated,
  isAdmin,
  bookController.createBookAuthor,
);
bookRouter.patch(
  '/author/:slug',
  celebrate({
    [Segments.BODY]: {
      name: Joi.string(),
      description: Joi.string(),
      avatar: Joi.string(),
    },
  }),
  isAuthenticated,
  isAdmin,
  bookController.updateBookAuthor,
);
bookRouter.delete(
  '/author/:slug',
  isAuthenticated,
  isAdmin,
  bookController.deleteBookAuthor,
);

bookRouter.get('/author', bookController.getBookAuthors);
bookRouter.get('/author/:slug', bookController.getBookAuthor);
export default bookRouter;
