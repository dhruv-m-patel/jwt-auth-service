import express, { Router, Response } from 'express';
import {
  loginWithEmailAndPassword,
  logoutUser,
  refreshTokensIfValid,
  registerUser,
  verifyRefreshToken,
} from '../models/auth';
import { Request, TokenResponse } from '../types';
import requireAccessToken from '../middlewares/requireAccessToken';

const router: Router = express.Router();

router.post('/register', async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email?.trim()?.length || !password?.trim().length) {
    res.sendStatus(400);
  } else {
    await registerUser(req, email, password);
    res.sendStatus(201);
  }
});

router.post('/login', async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email?.trim()?.length || !password?.trim().length) {
    res.sendStatus(400);
  } else {
    const jwtTokensMeta: TokenResponse = await loginWithEmailAndPassword(
      req,
      email,
      password
    );
    res.send(jwtTokensMeta);
  }
});

router.post(
  '/tokens/refresh',
  requireAccessToken,
  async (req: Request, res: Response) => {
    const { refreshToken } = req.body;
    if (!refreshToken.trim().length) {
      res.sendStatus(400);
    } else {
      const tokens: TokenResponse = await refreshTokensIfValid(
        req,
        Number(req.user?.id),
        refreshToken
      );
      res.send(tokens);
    }
  }
);

router.post(
  '/tokens/verify',
  requireAccessToken,
  async (req: Request, res: Response) => {
    // Access token will already be validated at this point so no need to validate that
    const { refreshToken } = req.body;
    if (!refreshToken.trim().length) {
      res.sendStatus(400);
    } else {
      const tokenVerificationResult = verifyRefreshToken(req, refreshToken);
      res.send({
        valid: !!tokenVerificationResult,
      });
    }
  }
);

router.delete(
  '/logout',
  requireAccessToken,
  async (req: Request, res: Response) => {
    if (!req.user?.id) {
      res.sendStatus(400);
    } else {
      await logoutUser(req, req.user.id);
      res.sendStatus(204);
    }
  }
);

export default router;
