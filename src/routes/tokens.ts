import express, { Router, Response } from 'express';
import requireAccessToken from '../middlewares/requireAccessToken';
import { refreshTokensIfValid, verifyRefreshToken } from '../models/auth';
import { Request, TokenResponse } from '../types';

const tokensRouter: Router = express.Router();

tokensRouter.post(
  '/refresh',
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

tokensRouter.post(
  '/verify',
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

export default tokensRouter;
