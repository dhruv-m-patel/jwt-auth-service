import path from 'path';
import express, { Response, NextFunction } from 'express';
import cors from 'cors';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import fs from 'fs';
import * as uuid from 'uuid';
import swaggerUi from 'swagger-ui-express';
import SwaggerUiDist from 'swagger-ui-dist';
import * as ExpressOpenApiValidator from 'express-openapi-validator';
import jsyaml from 'js-yaml';
import yamljs from 'yamljs';
import { Application, AppOptions, Request, ResponseError } from './types';
import healthRouter from './routes/health';
import loginRouter from './routes/login';
import logoutRouter from './routes/logout';
import tokensRouter from './routes/tokens';
import registerRouter from './routes/register';

function finalErrorHandler(
  err: ResponseError,
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (err) {
    console.error(err.message, err.stack);
    res.status(err.status || 500).send({
      message: err.message || 'Internal server error',
    });
  } else {
    try {
      next();
    } catch (error: any) {
      console.error(error.message, error.stack);
    }
  }
}

export function configureApp(options: AppOptions): express.Application {
  const app: Application = express();
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cors());
  app.use(compression());
  app.use(cookieParser());

  const { appName = 'Service', apiOptions, setup } = options;

  // Add service discovery to APIs
  if (apiOptions && apiOptions.apiSpec) {
    const { apiSpec, specType, validateResponses = true } = apiOptions;

    // Provide Swagger UI for consumers to look at API specs
    app.use(express.static(SwaggerUiDist.getAbsoluteFSPath()));
    app.use(
      '/api/docs',
      swaggerUi.serve,
      swaggerUi.setup(yamljs.load(apiSpec))
    );

    // Enforce request-response validations
    app.use(
      ExpressOpenApiValidator.middleware({
        apiSpec: jsyaml.load(fs.readFileSync(apiSpec, 'utf8')) as string,
        validateRequests: true,
        validateResponses: validateResponses,
      })
    );
  }

  // Add traceability to all requests assigning them a unique identifier
  app.use((req: Request, res: Response, next: NextFunction) => {
    req.id = uuid.v4();
    next();
  });

  // Add health check by default on all web and api applications
  app.get('/health', (req: Request, res: Response) => {
    res.status(200).send(`${appName} is healthy`);
  });

  // Allow consumer to run their route setup
  setup(app);

  // Add final error handler by default as the last middleware to handle unhandled errors from express routes
  app.use(finalErrorHandler);

  return app;
}

const apiSpec = path.join(__dirname, '../build/api/api-spec.yaml');

const app: Application = configureApp({
  apiOptions: {
    apiSpec,
    specType: 'openapi',
    validateResponses: true,
  },
  setup: (theApp: Application) => {
    theApp.use('/api/health', healthRouter);
    theApp.use('/api/login', loginRouter);
    theApp.use('/api/logout', logoutRouter);
    theApp.use('/api/tokens', tokensRouter);
    theApp.use('/api/register', registerRouter);
  },
});

export default app;
