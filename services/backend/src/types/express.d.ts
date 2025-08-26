import "express";

declare module "express-serve-static-core" {
  interface Request {
    user?: {
      email?: string | undefined;
    };
    auth?: {
      payload: {
        [key: string]: any;
        sub?: string;
        email?: string;
      };
      token: string;
    };
  }
}
