import cors from "cors";
import express, {
  type Express,
  json,
  type NextFunction,
  type Request,
  type Response,
} from "express";

import { DEFAULT_PORT } from "./constants";

const app: Express = express();

app.use(cors());
app.use(json());

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err.stack);
  res.status(500).send("Internal Server Error");
});

app.listen(DEFAULT_PORT, () => {
  console.log(`Running server listening on port ${DEFAULT_PORT}`);
});
