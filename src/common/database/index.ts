import { get } from 'env-var';
import '@config/env';
import { join } from 'path';
import { DataSource } from 'typeorm';

import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';

export const databaseConfig: PostgresConnectionOptions = {
  type: 'postgres',
  host: get('DB_HOST').required().asString(),
  port: get('DB_PORT').required().asIntPositive(),
  username: get('DB_USER').required().asString(),
  password: get('DB_PASS').required().asString(),
  database: get('DB_NAME').required().asString(),
  entities: [join(__dirname, '..', '..', '**', '*.entity.{ts,js}')],

  // We are using migrations, synchronize should be set to false.
  synchronize: false,

  // Run migrations automatically,
  // you can disable this if you prefer running migration manually.
  migrationsRun: false,
  logging: false,
  migrations: [join(__dirname, '..', '..', '**', 'migrations', '*.{ts,js}')],
  //logger: 'file',
};

export const postgresConnectionUri = `postgres://${databaseConfig.username}:${databaseConfig.password}@${databaseConfig.host}/${databaseConfig.database}`;
export const dataSource = new DataSource(databaseConfig);
