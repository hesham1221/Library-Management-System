import {
  Repository,
  FindOptionsOrder,
  FindOptionsSelect,
  FindOptionsSelectByString,
  FindOptionsWhere,
  FindOptionsRelationByString,
  FindOptionsRelations,
  DeepPartial,
  ObjectLiteral,
  IsNull,
  In,
  MoreThan,
  LessThan,
  Not,
} from 'typeorm';
import { TMessage, errorMessages } from '@common/errors/messages';
import BaseError from '@common/errors/base-error';
import {
  CursorBasedPaginationDirection,
  DailyCursuredData,
  PaginationRes,
} from './types';

export class BaseRepository<T extends ObjectLiteral> extends Repository<T> {
  //@ts-ignore
  async findOne(
    where: FindOptionsWhere<T>[] | WhereOptions<T> = {},
    include: FindOptionsRelations<T> | FindOptionsRelationByString = [],
    attributes?: FindOptionsSelect<T> | FindOptionsSelectByString<T>,
    sort?: FindOptionsOrder<T>,
  ) {
    return super.findOne({
      where: this.changeOptions(where),
      relations: include,
      select: attributes,
      order: sort,
    });
  }
  async findOneOrError(
    where: FindOptionsWhere<T>[] | WhereOptions<T> = {},
    errorCode?: TMessage,
    include: FindOptionsRelations<T> | FindOptionsRelationByString = [],
    attributes?: FindOptionsSelect<T> | FindOptionsSelectByString<T>,
  ): Promise<T> {
    const result = await this.findOne(
      this.changeOptions(where),
      include,
      attributes,
    );
    if (!result) throw new BaseError(errorCode || errorMessages.NOT_FOUND);
    return result;
  }

  async findOneWithErorr(
    where: FindOptionsWhere<T>[] | WhereOptions<T> = {},
    errorCode?: TMessage,
    include: FindOptionsRelations<T> | FindOptionsRelationByString = [],
    attributes: FindOptionsSelect<T> | FindOptionsSelectByString<T> = {},
    returnAll: boolean = false,
    customIdField: keyof T = 'id',
  ) {
    const result = await this.findOne(
      this.changeOptions(where),
      include,
      !returnAll
        ? ({ [customIdField]: true, ...attributes } as any)
        : undefined,
    );
    if (result) throw new BaseError(errorCode || errorMessages.NOT_ALLOWED);
    return result;
  }

  async findAllIdsOrError(
    ids: string[],
    where?: WhereOptions<T>,
    errorCode?: TMessage,
    customIdField: keyof T = 'id',
    include: FindOptionsRelations<T> | FindOptionsRelationByString = [],
  ) {
    const result = await this.find({
      where: this.changeOptions({
        [customIdField]: In(ids),
        ...where,
      } as WhereOptions<T>),
      relations: include,
    });
    if (result.length !== ids.length)
      throw new BaseError(errorCode || errorMessages.NOT_FOUND);
    return result;
  }

  async findAllExistsAndNotIds(
    ids: string[],
    customIdField: keyof T = 'id',
    include: FindOptionsRelations<T> | FindOptionsRelationByString = [],
  ) {
    const [result, total] = await this.findAndCount({
      where: { [customIdField]: In(ids) } as FindOptionsWhere<T>,
      relations: include,
    });
    const notExistingIds = ids.filter(
      id => !result.map(item => item[customIdField]).includes(id as any),
    );
    return { exists: result, notExistingIds };
  }

  async findAll(
    where: FindOptionsWhere<T>[] | WhereOptions<T> = {},
    include: FindOptionsRelations<T> | FindOptionsRelationByString = [],
    sort?: FindOptionsOrder<T>,
    attributes?: FindOptionsSelect<T> | FindOptionsSelectByString<T>,
    limit?: number,
    skip?: number,
  ): Promise<T[]> {
    return this.find({
      where: this.changeOptions(where),
      relations: include,
      order: sort,
      select: attributes,
      take: limit,
      skip,
    });
  }

  async findPaginated(
    where: FindOptionsWhere<T>[] | WhereOptions<T> = {},
    sort?: FindOptionsOrder<T>,
    page: number = 1,
    limit: number = 15,
    include: FindOptionsRelations<T> | FindOptionsRelationByString = [],
  ): Promise<PaginationRes<T>> {
    const skip = (page - 1) * limit;
    const [result, total] = await this.findAndCount({
      where: this.changeOptions(where),
      relations: include,
      order: sort,
      take: limit,
      skip,
    });

    return {
      items: result,
      pageInfo: {
        page,
        limit,
        hasBefore: page > 1,
        hasNext: skip + limit < total,
        totalCount: total,
      },
    };
  }

  findPaginatedManually(
    items: T[],
    page: number = 1,
    limit: number = 15,
  ): PaginationRes<T> {
    const skip = page * limit;
    const slicedItems = items.slice(skip, skip + limit);

    return {
      items: slicedItems,
      pageInfo: {
        page,
        hasBefore: page > 1,
        hasNext: slicedItems.length === limit && page * limit < items.length,
      },
    };
  }

  async findCursorPaginated(
    where: FindOptionsWhere<T>[] | WhereOptions<T> = {},
    cursor?: string | Date | number,
    direction: 'AFTER' | 'BEFORE' = 'AFTER',
    sort: 'ASC' | 'DESC' = 'DESC',
    limit: number = 15,
    include: FindOptionsRelations<T> | FindOptionsRelationByString = [],
    paginationKey: keyof T = 'createdAt',
    keyType: 'DATE' | 'NUMBER' = 'DATE',
    initialShift: number = 0, // shift the cursor to the back in the initial to return for eg 1 before the cursor
  ): Promise<PaginationRes<T>> {
    const shifting = !cursor ? initialShift : 0;
    const cursorValue = cursor
      ? keyType === 'DATE'
        ? new Date(isNaN(+cursor) ? String(cursor) : +cursor)
        : +cursor
      : undefined;
    const totalCount = await this.count({
      where: {
        ...this.changeOptions(where),
      },
    });
    const result = await this.findAll(
      {
        ...this.changeOptions(where),
        ...(cursorValue && {
          [paginationKey]:
            direction !== 'AFTER'
              ? Not(LessThan(cursorValue))
              : Not(MoreThan(cursorValue)),
        }),
      },
      include,
      // @ts-ignore
      { [paginationKey]: sort },
      undefined,
      limit + 1,
    );
    const beforeItems = await this.findAll(
      {
        ...this.changeOptions(where),
        [paginationKey]:
          direction === 'AFTER' ? MoreThan(cursorValue) : LessThan(cursorValue),
      },
      undefined,
      // @ts-ignore
      { [paginationKey]: sort },
      totalCount && !shifting && { [paginationKey]: true, id: true },
      shifting ? shifting : 1,
      limit,
    );
    const beforeItem = beforeItems[0];
    let itemData = result.length > limit ? result.slice(0, -1) : result;
    const afterItem = result.length > limit ? result[limit - 1] : undefined;
    itemData = shifting
      ? [...beforeItems, ...itemData].filter(Boolean)
      : itemData;
    return {
      items: itemData,
      pageInfo: {
        limit,
        beforeCursor: beforeItem
          ? beforeItem[paginationKey] === itemData[0][paginationKey]
            ? undefined
            : String(beforeItem[paginationKey])
          : undefined,
        nextCursor: afterItem ? afterItem[paginationKey] : undefined,
        hasBefore: !!beforeItem,
        hasNext: !!afterItem,
        totalCount,
      },
    };
  }

  /**
     * Retrieves days with paginated data based on the given conditions.
     *
     * @param {FindOptionsWhere<T>[] | WhereOptions<T>} where - The conditions to filter the data.
     * @param {string | Date | number | Timestamp} cursor - The cursor to start retrieving data from (date or timestamp for a day).
     * @param {'AFTER' | 'BEFORE'} direction - The direction of pagination.
     * @param {number} limit - The maximum number of days returned with data (if no data in a day it would return it).
     * @param {FindOptionsRelations<T> | FindOptionsRelationByString} include - The relations to include in the data.
     * @param {keyof T} paginationKey - The key to be used for pagination.
     * @param {'DATE' | 'NUMBER'} keyType - The type of the pagination key.
     * @return {Promise<PaginationRes<DailyCursuredData<T>>>} The paginated data.
     * @example 
     * // returned data
     * [
     * {
        "daytimestamp": 1698530400000, // Oct 29 2023
        "data": [ // data for Oct 29 2023
          ...data
        ]
      },
      {
        "daytimestamp": 1698703200000, // Nov 1 2023
        "data": [ // data for Nov 1 2023
          ...data
        ]
      }
     * ]
     */
  async dailyCurseredPaginated(
    where: FindOptionsWhere<T>[] | WhereOptions<T> = {},
    cursor?: string | Date | number,
    direction: 'AFTER' | 'BEFORE' = 'AFTER',
    limit: number = 15,
    include: FindOptionsRelations<T> | FindOptionsRelationByString = [],
    paginationKey: keyof T = 'createdAt',
    keyType: 'DATE' | 'NUMBER' = 'NUMBER',
  ): Promise<PaginationRes<DailyCursuredData<T>>> {
    const todaysTime = new Date().setHours(0, 0, 0, 0);
    const allDatesGrouped: Record<number, number[]> = {};
    const cursorValue = cursor
      ? new Date(isNaN(+cursor) ? String(cursor) : +cursor)
      : new Date(todaysTime);

    const datesData = await this.findAll(
      {
        ...this.changeOptions(where),
        [paginationKey]:
          direction === 'AFTER'
            ? MoreThan(cursorValue.getTime())
            : LessThan(cursorValue.getTime()),
      },
      undefined,
      //@ts-ignore
      { [paginationKey]: direction === 'AFTER' ? 'ASC' : 'DESC' },
      { [paginationKey]: true },
    );

    datesData
      .map(item => item[paginationKey])
      .forEach(timestamp => {
        const date = new Date(
          isNaN(+timestamp) ? String(timestamp) : +timestamp,
        );
        const day = new Date(
          date.getFullYear(),
          date.getMonth(),
          date.getDate(),
        ).getTime();
        if (!allDatesGrouped[day]) {
          allDatesGrouped[day] = [];
        }

        allDatesGrouped[day].push(timestamp);
      });
    const days = Object.keys(allDatesGrouped).sort((a, b) =>
      direction === 'AFTER' ? Number(a) - Number(b) : Number(b) - Number(a),
    );
    const selectedDays = days.slice(0, limit);
    let whereTimeStamp: (number | Date)[] = [];
    selectedDays.map(
      (day: any) =>
        (whereTimeStamp = [...whereTimeStamp, ...allDatesGrouped[day]]),
    );
    whereTimeStamp.map(timestamp =>
      keyType === 'DATE'
        ? new Date(isNaN(+timestamp) ? String(timestamp) : +timestamp)
        : +timestamp,
    );
    const data = await this.findAll(
      {
        ...this.changeOptions(where),
        [paginationKey]: In(whereTimeStamp),
      },
      include,
      // @ts-ignore
      { [paginationKey]: direction === 'AFTER' ? 'ASC' : 'DESC' },
    );

    const grouped = data.reduce(
      (acc, obj) => {
        const day = new Date(
          isNaN(obj[paginationKey])
            ? String(obj[paginationKey])
            : +obj[paginationKey],
        ).setHours(0, 0, 0, 0);

        acc[day] = acc[day] || { daytimestamp: day, data: [] };
        acc[day].data.push(obj);

        return acc;
      },
      {} as Record<number, DailyCursuredData<T>>,
    );
    return {
      items: Object.values(grouped),
      pageInfo: {
        hasNext: !!days[selectedDays.length],
        hasBefore: cursorValue.setHours(0, 0, 0, 0) > todaysTime,
        nextCursor: days[selectedDays.length],
        limit,
        direction: direction as CursorBasedPaginationDirection,
      },
    };
  }

  softDeleteWithUpdate(
    where: FindOptionsWhere<T>[] | WhereOptions<T> = {},
    input: DeepPartial<T>,
  ): Promise<T[]> {
    return this.updateAll(where, { ...input, deletedAt: new Date() });
  }

  async sumField(
    field: keyof T,
    where: FindOptionsWhere<T>[] | WhereOptions<T> = {},
  ): Promise<number> {
    const result = await this.createQueryBuilder()
      .select(`SUM(${String(field)})`, 'sum')
      .where(this.changeOptions(where))
      .getRawOne();

    return parseInt(result.sum) || 0;
  }

  async createOne(input: DeepPartial<T>): Promise<T> {
    const entity = this.create(input);
    return await this.save(entity);
  }

  async createOneOrUpdate<K extends keyof DeepPartial<T>>(
    input: DeepPartial<T> | ((item: T) => DeepPartial<T>),
    where: FindOptionsWhere<T>[] | WhereOptions<T> = {},
    primaryKey: K = 'id' as K,
  ): Promise<T> {
    let finalInput: DeepPartial<T>;
    if (typeof input === 'function') {
      finalInput = input({} as T);
    } else {
      finalInput = input;
    }
    const item = await this.findOne(
      this.changeOptions({
        ...where,
        ...(finalInput[primaryKey] && { [primaryKey]: finalInput[primaryKey] }),
      }),
    );

    if (item) {
      let updateInput: DeepPartial<T>;
      if (typeof input === 'function') {
        updateInput = input(item);
      } else {
        updateInput = input;
      }
      return await this.updateOneFromExistingModel(item, updateInput);
    } else {
      return await this.createOne(finalInput);
    }
  }

  async bulkCreate(models: DeepPartial<T>[]): Promise<T[]> {
    const entities = this.create(models);
    return this.save(entities);
  }

  async findOrCreate(
    where: WhereOptions<T> = {},
    input?: DeepPartial<T>,
  ): Promise<T> {
    let item = await this.findOne(this.changeOptions(where));
    if (!item) item = await this.createOne({ ...where, ...input });
    return item;
  }

  //TODO: make it accept null values
  async updateOneFromExistingModel(
    model: T,
    input: DeepPartial<T>,
  ): Promise<T> {
    Object.assign(model, input);
    return await this.save(model);
  }

  async updateAll(
    where: FindOptionsWhere<T>[] | WhereOptions<T> = {},
    input: DeepPartial<T>,
  ): Promise<T[]> {
    const models = await this.find({ where: this.changeOptions(where) });
    models.forEach(model => Object.assign(model, input));
    return this.save(models);
  }

  async deleteAll(where: WhereOptions<T>): Promise<number> {
    const result = await this.delete(
      this.changeOptions(where) as WhereOptions<T>,
    );
    return result.affected || 0;
  }

  async truncateModel(): Promise<void> {
    await this.query(`DELETE FROM ${this.metadata.tableName}`);
  }

  async rawDelete(): Promise<void> {
    await this.query(`DELETE FROM ${this.metadata.tableName}`);
  }

  async rawQuery<T>(sql: string): Promise<T> {
    const result = await this.query(sql);
    return result[0];
  }

  // TypeOrm dosn't give data if you put null in FindOptions you need to use IsNull
  // And this method edits the final query where, And in every object in findOptions
  //TODO: add Inner $or for the types
  private changeOptions(
    options: FindOptionsWhere<T>[] | WhereOptions<T>,
  ): FindOptionsWhere<T>[] | FindOptionsWhere<T> {
    if (Array.isArray(options)) {
      return options.map(obj =>
        Object.fromEntries(
          Object.entries(obj).map(([k, v]) => [k, v !== null ? v : IsNull()]),
        ),
      ) as FindOptionsWhere<T>[];
    } else {
      const { $or, ...common } = options;
      if (!$or) {
        return Object.fromEntries(
          Object.entries(options).map(([k, v]) => [
            k,
            v !== null ? v : IsNull(),
          ]),
        ) as FindOptionsWhere<T> | FindOptionsWhere<T>[];
      } else {
        const final = $or.map(obj => ({ ...obj, ...common }));
        return this.changeOptions(final) as FindOptionsWhere<T>[];
      }
    }
  }

  private getMinMaxTimestamps(
    timestamp: number,
    futureDays: number,
    previousDays: number,
    returnType: 'NUMBER' | 'DATE' = 'NUMBER',
  ) {
    const timestamps: number[] = [];
    let currentDate = new Date(timestamp);

    // Add previous days (if any)
    if (previousDays > 0) {
      for (let i = 0; i < previousDays; i++) {
        currentDate.setDate(currentDate.getDate() - 1);
        timestamps.unshift(currentDate.getTime()); // Add to the beginning of the array
      }
    }

    // Reset to the original timestamp
    currentDate = new Date(timestamp);

    // Add future days
    for (let i = 0; i < futureDays; i++) {
      currentDate.setDate(currentDate.getDate() + 1);
      timestamps.push(currentDate.getTime());
    }
    const min = previousDays > 0 ? Math.min(...timestamps) : timestamp;
    const max = Math.max(...timestamps);
    return {
      minTimestamp: returnType === 'NUMBER' ? min : new Date(min),
      maxTimestamp: returnType === 'NUMBER' ? max : new Date(max),
    };
  }
}

export type WhereOptions<T> = FindOptionsWhere<T> & {
  $or?: FindOptionsWhere<T>[];
};
