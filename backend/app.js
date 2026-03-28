import express from "express";

import authRouter from "./routes/auth.js";
import bookRouter from "./routes/book.js";
import dbRouter from "./routes/db.js";
import loanRouter from "./routes/loan.js";
import opensearchRouter from "./routes/opensearch.js";
import pingRouter from "./routes/ping.js";
import userRouter from "./routes/user.js";

const app = express();
app.use(express.json());

app.use("/ping", pingRouter);
app.use("/db", dbRouter);
app.use("/user", userRouter);
app.use("/book", bookRouter);
app.use("/loan", loanRouter);
app.use("/opensearch", opensearchRouter);
app.use("/auth", authRouter);

const port = 3001;
app.listen(port, () => {
  console.log(`API server running on port ${port}`);
});
