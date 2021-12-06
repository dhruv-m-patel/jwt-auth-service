import express, { Request, Response } from 'express';

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get('health', (req: Request, res: Response) => {
  res.status(200).send('Service is healthy');
});

app.listen(3000, () => {
  console.log('App is running at http://localhost:3000');
});
