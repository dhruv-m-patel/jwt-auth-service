import express, { Router, Response } from 'express';
import { loginWithEmailAndPassword } from '../models/auth';
import { Request, TokenResponse } from '../types';

const loginRouter: Router = express.Router();

loginRouter.post('/', async (req: Request, res: Response) => {
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

export default loginRouter;
