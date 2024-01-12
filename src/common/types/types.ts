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

export enum CronDuration {
  EVERY_MINUTE = '* * * * *',
  EVERY_5_MINUTES = '*/5 * * * *',
  EVERY_10_MINUTES = '*/10 * * * *',
  EVERY_HOUR = '0 * * * *',
  EVERY_2_HOURS = '0 */2 * * *',
  EVERY_DAY_MIDNIGHT = '0 0 * * *', // Every day at midnight
  EVERY_DAY_NOON = '0 12 * * *', // Every day at noon
  EVERY_WEEK = '0 0 * * 0', // Every Sunday at midnight
  FIRST_DAY_OF_MONTH = '0 0 1 * *', // First day of every month at midnight
  LAST_DAY_OF_MONTH = '0 0 28-31 * *', // Last day of every month at midnight
}
