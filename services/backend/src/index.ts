import express = require('express');
import metadata = require('./metadata');
import expressOAuth2JWTBearer = require('express-oauth2-jwt-bearer');
import cors = require('cors');

const { auth } = expressOAuth2JWTBearer;

const name = metadata.packageData['name'] as string;
const containerPort = metadata.packageData['containerPort'] as number;
const hostPort = metadata.packageData['hostPort'] as number;

const AUTH0_AUDIENCE = process.env['AUTH0_AUDIENCE'] as string;
const AUTH0_ISSUER_BASE_URL = process.env['AUTH0_ISSUER_BASE_URL'] as string;
const FRONTEND_MAIN_URL = process.env['FRONTEND_MAIN_URL'] as string;
const NOAUTH = (process.env['NOAUTH'] ?? '') === 'true';

const app = express();

const authOptions = {
  audience: AUTH0_AUDIENCE,
  issuerBaseURL: AUTH0_ISSUER_BASE_URL,
} as expressOAuth2JWTBearer.AuthOptions;

const errorHandler: express.ErrorRequestHandler = (err, _req, res, _next) => {
  if (err) {
    const status = (err?.status ?? 500) as number;
    const statusCode = (err?.statusCode ?? 500) as number;
    const message = (err?.message ?? 'Something bad happend.') as string;
    res.status(status).json({
      statusCode,
      message,
    });
  }
};

app.use(
  cors({
    origin: FRONTEND_MAIN_URL,
  })
);
if (!NOAUTH) app.use(auth(authOptions));

app.get('/', (_req, res) => {
  res.json('Hello world.');
});

app.use(errorHandler);

app.listen(containerPort, () => {
  console.log(`${name} is listening on port ${hostPort}:${containerPort}`);
});
