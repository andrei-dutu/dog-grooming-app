import "dotenv/config";
import cors from "cors";
import express from "express";
import apiRoutes from "./src/routes/index.js";
import { errorHandler } from "./src/middleware/errorHandler.js";
import { pool } from "./src/db/prisma.js";

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api", apiRoutes);
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});

process.on("SIGINT", async () => {
  await pool.end();
  process.exit(0);
});
