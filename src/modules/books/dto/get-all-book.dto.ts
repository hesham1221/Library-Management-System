import { SortTypeEnum } from '@common/types/types';

export class GetAllBooksDto {
  page?: number;
  limit?: number;
  searchKey?: string;
  authorId?: string;
  available?: boolean;
  sortBy?: {
    numberOfBorrowed?: SortTypeEnum;
    availableQuantity?: SortTypeEnum;
    totalQuantity?: SortTypeEnum;
    createdAt?: SortTypeEnum;
  };
}
