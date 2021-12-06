import express, { Router, Request, Response } from 'express';
import { registerUser } from '../models/auth';

const registerRouter: Router = express.Router();

registerRouter.post('/', async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email?.trim()?.length || !password?.trim().length) {
    res.sendStatus(400);
  } else {
    await registerUser(req, email, password);
    res.sendStatus(201);
  }
});

export default registerRouter;
