export enum LangEnum {
  EN = 'EN',
  AR = 'AR',
}

export interface PaginationRes<T> {
  items: T[];
  pageInfo: {
    page?: number;
    limit?: number;
    nextCursor?: string;
    beforeCursor?: string;
    totalCount?: number;
    hasNext: boolean;
    hasBefore: boolean;
    direction?: CursorBasedPaginationDirection;
  };
}

export enum CursorBasedPaginationDirection {
  BEFORE = 'BEFORE',
  AFTER = 'AFTER',
}

export enum CursorBasedSortType {
  ASC = 'ASC',
  DESC = 'DESC',
}

export enum SortTypeEnum {
  ASC = 'ASC',
  DESC = 'DESC',
}

export class DailyCursuredData<T> {
  daytimestamp: number;
  data: T[];
}

export interface IJwtPayload {
  email: string;
  id: string;
  name: string;
}
