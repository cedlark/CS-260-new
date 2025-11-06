import express from "express";
import cookieParser from "cookie-parser";
import bcrypt from "bcryptjs";
import uuid from "uuid";

const app = express();
const port = process.env.PORT || 4000;

app.use(express.json());
app.use(cookieParser());

let users = [];
let posts = [];
let friends = [];

const apiRouter = express.Router();

apiRouter.post("/auth/create", async (req, res) => {
  // TODO: Add user creation logic
  res.sendStatus(200);
});

apiRouter.post("/auth/login", async (req, res) => {
  // TODO: Add login logic
  res.sendStatus(200);
});

apiRouter.delete("/auth/logout", async (req, res) => {
  // TODO: Add logout logic
  res.sendStatus(204);
});

apiRouter.get("/posts", (req, res) => {
  // TODO: Return all posts later
  res.sendStatus(200);
});

apiRouter.post("/posts", (req, res) => {
  // TODO: Handle adding new posts later
  res.sendStatus(201);
});

apiRouter.get("/friends", (req, res) => {
  // TODO: Return friends list later
  res.sendStatus(200);
});

apiRouter.post("/friends", (req, res) => {
  // TODO: Handle adding a friend later
  res.sendStatus(201);
});

app.use("/api", apiRouter);

import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, "../frontend/dist")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/dist", "index.html"));
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
