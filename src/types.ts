import express, {
  Request as ExpressRequest,
  Application as ExpressApplication,
} from 'express';
import mysql from 'mysql2';

export interface AppOptions {
  appName?: string;
  apiOptions?: {
    apiSpec: string;
    specType: 'openapi' | 'swagger';
    validateResponses?: boolean;
  };
  setup: (app: express.Application) => void;
}

export interface ResponseError extends Error {
  status?: number;
}

export interface Application extends ExpressApplication {
  db?: mysql.Pool;
}

export interface Request extends ExpressRequest {
  id?: string;
  user?: {
    id?: number;
    email: string;
    password: string;
    guid: string;
  };
  app: Application;
}

/* eslint-disable camelcase */
export interface User {
  id?: number;
  email: string;
  password: string;
  guid: string;
}

export interface UserWithoutPassword {
  id?: number;
  email: string;
  guid: string;
}

export interface TokenResponse {
  accessToken: string;
  accessTokenExpiry: string;
  refreshToken: string;
  refreshTokenExpiry: string;
}

export interface MysqlTokenRecord {
  user_id: number;
  access_token: string;
  access_token_expires_at: string;
  refresh_token: string;
  refresh_token_expires_at: string;
}
/* eslint-enable camelcase */
