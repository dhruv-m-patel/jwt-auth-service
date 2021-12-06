import express, { Router, Response } from 'express';
import { Request } from '../types';
import { logoutUser } from '../models/auth';
import requireAccessToken from '../middlewares/requireAccessToken';

const logoutRouter: Router = express.Router();

logoutRouter.delete(
  '/',
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

export default logoutRouter;
