import 'dotenv/config';
import { DataSource, DataSourceOptions } from 'typeorm';

const dbHost = process.env.DB_HOST ?? 'localhost';
const isLocalDb = dbHost === 'localhost' || dbHost === '127.0.0.1';
const useSsl =
  process.env.DB_SSL !== undefined
    ? process.env.DB_SSL === 'true'
    : !isLocalDb;

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: dbHost,
  port: Number(process.env.DB_PORT ?? 5432),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: useSsl ? { rejectUnauthorized: false } : false,
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/migrations/*{.ts,.js}'],
  synchronize: false,
  migrationsRun: true,
};

const dataSource = new DataSource(dataSourceOptions);
export default dataSource;