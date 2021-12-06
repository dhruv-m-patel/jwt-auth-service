import cluster from 'cluster';
import os from 'os';
import process from 'process';
import { Application } from './types';
import mysql from 'mysql2/promise';
import app from './app';
import { connect } from './lib/clients/mysql';

const startApp = (app: Application, port: number, processId?: number) => {
  app.listen(port, () => {
    console.info(
      processId
        ? `Server child process id ${processId} running, listening on port ${port}`
        : `Server listening on port ${port}`
    );
  });
};

function runApp(
  app: Application,
  port = 5000,
  useClusteredStart = false
): void {
  if (useClusteredStart) {
    if (cluster.isMaster) {
      console.info(`Main server process id: ${process.pid}`);
      const cpus = os.cpus();
      console.info(
        `Forking ${cpus.length} child server processes on CPU Model ${cpus[0].model}`
      );
      for (let i = 0; i < cpus.length; i++) {
        cluster.fork();
      }
    } else {
      startApp(app, port, process.pid);
    }
  } else {
    startApp(app, port);
  }
}

process.on('exit', (code) => {
  console.warn(`Process ${process.pid} is exiting with exit code ${code}`);
});

async function start() {
  try {
    const appDb: mysql.Pool = await connect();
    if (!appDb) {
      console.error('DATABASE_ERROR: Could not connect to database');
      process.exit(1);
    } else {
      app.set('db', appDb);
      runApp(app, Number(process.env.AUTH_SERVICE_PORT || 5000));
    }
  } catch (err) {
    console.error('DATABASE_ERROR: Error connecting to database', err);
  }
}

start();
