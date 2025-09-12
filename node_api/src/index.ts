import "dotenv/config";
import express from "express";
import cors from "cors";
import morgan from "morgan";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

//morgan
app.use(morgan("dev"));

// Healthcheck
app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "hexoo-node-api", ts: Date.now() });
});

// Simple example endpoint
app.get("/api/greeting", (req, res) => {
  const name = (req.query.name as string) || "friend";
  res.json({ message: `Hello, ${name}!` });
});

const PORT = Number(process.env.PORT || 3001);
app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
});
