//#region src/types/express.d.ts

declare global {
  namespace Express {
    interface Request {
      cauth?: {
        id: string;
        role: string;
      };
    }
  }
}