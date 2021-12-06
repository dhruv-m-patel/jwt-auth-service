import bcrypt from 'bcrypt';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { query, toMysqlDatetime } from '../lib/clients/mysql';
import { add } from 'date-fns';
import { v4 as uuidV4 } from 'uuid';
import { MysqlTokenRecord, Request, TokenResponse, User } from '../types';
import { getAccessTokenSecret, getRefreshTokenSecret } from '../lib/utils';

function getTokens(user: Omit<User, 'password'>): {
  accessToken: string;
  accessTokenExpiry: Date;
  refreshToken: string;
  refreshTokenExpiry: Date;
} {
  const accessTokenExpiry = add(new Date(), { minutes: 2 });
  const refreshTokenExpiry = add(new Date(), { minutes: 5 });
  const accessToken = jwt.sign(
    { data: user, exp: Math.floor(Date.now() / 1000) + 2 * 60 }, // expire refresh tokens after 2 mins
    getAccessTokenSecret()
  );
  const refreshToken = jwt.sign(
    { data: user, exp: Math.floor(Date.now() / 1000) + 5 * 60 }, // expire refresh tokens after 5 mins
    getRefreshTokenSecret()
  );
  return {
    accessToken,
    accessTokenExpiry,
    refreshToken,
    refreshTokenExpiry,
  };
}

export async function loginWithEmailAndPassword(
  req: Request,
  email: string,
  plainTextPassword: string
): Promise<{
  accessToken: string;
  accessTokenExpiry: string;
  refreshToken: string;
  refreshTokenExpiry: string;
}> {
  const matchedRecords: User[] = await query(
    req,
    'SELECT * FROM users WHERE email=?',
    [email]
  );

  if (matchedRecords.length) {
    const [{ password, ...user }] = matchedRecords;
    const pass = bcrypt.compareSync(plainTextPassword, password);
    if (pass) {
      const tokens = getTokens(user);
      await query(
        req,
        `INSERT INTO tokens
          (user_id, access_token, access_token_expires_at, refresh_token, refresh_token_expires_at)
          VALUES
          (?, ?, ?, ?, ?)`,
        [
          user.id,
          tokens.accessToken,
          toMysqlDatetime(tokens.accessTokenExpiry.toISOString()),
          tokens.refreshToken,
          toMysqlDatetime(tokens.refreshTokenExpiry.toISOString()),
        ]
      );
      return {
        ...tokens,
        accessTokenExpiry: tokens.accessTokenExpiry.toISOString(),
        refreshTokenExpiry: tokens.refreshTokenExpiry.toISOString(),
      };
    }
  }

  throw new Error('User not found');
}

export async function registerUser(
  req: Request,
  email: string,
  plainTextPassword: string
): Promise<void> {
  const matchedRecords: User[] = await query(
    req,
    'SELECT * FROM users WHERE email=?',
    [email]
  );

  if (matchedRecords.length) {
    throw new Error('User already exists');
  }

  const hashedPassword = bcrypt.hashSync(plainTextPassword, 12);
  await query(req, `INSERT INTO users(guid, email, password) VALUES(?, ?, ?)`, [
    uuidV4(),
    email,
    hashedPassword,
  ]);
}

export async function logoutUser(req: Request, userId: number) {
  await query(req, `DELETE FROM tokens WHERE user_id=?`, [userId]);
}

export function verifyAccessToken(
  req: Request,
  accessToken: string
): JwtPayload {
  return jwt.verify(accessToken, getAccessTokenSecret()) as JwtPayload;
}

export function verifyRefreshToken(
  req: Request,
  refreshToken: string
): JwtPayload {
  return jwt.verify(refreshToken, getRefreshTokenSecret()) as JwtPayload;
}

export async function refreshTokensIfValid(
  req: Request,
  userId: Number,
  refreshToken: string
): Promise<TokenResponse> {
  const [user, currentTokenRecord]: [User[], MysqlTokenRecord[]] =
    await Promise.all([
      query(req, 'SELECT * FROM users WHERE id=?', [userId]),
      query(req, 'SELECT * FROM tokens WHERE user_id=?', [userId]),
    ]);

  if (
    currentTokenRecord.length &&
    currentTokenRecord[0].refresh_token === refreshToken &&
    !!verifyRefreshToken(req, refreshToken)
  ) {
    const newTokens = getTokens(user[0]);
    await query(
      req,
      `UPDATE tokens
        SET
          access_token=?,
          access_token_expires_at=?,
          refresh_token=?,
          refresh_token_expires_at=?
        WHERE
          user_id=?`,
      [
        newTokens.accessToken,
        toMysqlDatetime(newTokens.accessTokenExpiry.toISOString()),
        newTokens.refreshToken,
        toMysqlDatetime(newTokens.refreshTokenExpiry.toISOString()),
        user[0].id,
      ]
    );
    return {
      ...newTokens,
      accessTokenExpiry: newTokens.accessTokenExpiry.toISOString(),
      refreshTokenExpiry: newTokens.refreshTokenExpiry.toISOString(),
    };
  } else {
    throw new Error('Invalid refresh token');
  }
}
