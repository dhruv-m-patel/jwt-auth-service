export function getAccessTokenSecret(): string {
  const secret = process.env.ACCESS_TOKEN_SECRET;
  if (!secret) {
    throw new Error('Configuration error: Token secrets are not set');
  }
  return secret;
}

export function getRefreshTokenSecret(): string {
  const secret = process.env.REFRESH_TOKEN_SECRET;
  if (!secret) {
    throw new Error('Configuration error: Token secrets are not set');
  }
  return secret;
}
