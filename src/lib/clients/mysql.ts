import mysql from 'mysql2/promise';
import { parseISO, format } from 'date-fns';
import { Request } from '../../types';

export async function connect(): Promise<mysql.Pool> {
  const pool = await mysql.createPool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    connectionLimit: 100,
    typeCast: true,
  });
  return pool;
}

export async function query(
  req: Request,
  query: string,
  params: any[] = []
): Promise<any> {
  const pool = req.app.get('db') as mysql.Pool;
  let connection;
  try {
    connection = await pool.getConnection();
    const finalQuery = connection.format(query, params);
    if (process.env.DEBUG_SQL === 'true') {
      console.debug('DEBUG_SQL: Query - ', finalQuery);
    }
    const [rows] = await connection.execute(finalQuery);
    if (process.env.DEBUG_SQL === 'true') {
      console.debug('DEBUG_SQL: Result - ', rows);
    }
    return Array.isArray(rows) ? rows : true;
  } catch (err) {
    console.error('Error executing database query', err);
    throw err;
  } finally {
    if (connection) {
      connection.destroy();
    }
  }
}

export function toMysqlDatetime(date: string): string {
  return format(parseISO(date), 'yyyy-MM-dd HH:mm:ss');
}

export function mysqlDatetimeToJsDate(date: string): Date {
  return new Date(Date.parse(date.replace(/-/g, '/')));
}
