const express = require('express');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');
const uuid = require('uuid');

const app = express();
const port = process.argv.length > 2 ? process.argv[2] : 3000;

// --- Middleware setup ---
app.use(express.json());
app.use(cookieParser());
app.use(express.static('public')); // serves frontend build if needed

// --- Data structures ---
let users = [];
let scores = [];
const authCookieName = 'token';

// --- Helper functions ---
async function findUser(field, value) {
  return users.find((u) => u[field] === value);
}

async function createUser(email, password) {
  const passwordHash = await bcrypt.hash(password, 10);
  const user = {
    email,
    password: passwordHash,
    token: uuid.v4(),
  };
  users.push(user);
  return user;
}

function setAuthCookie(res, token) {
  res.cookie(authCookieName, token, {
    secure: false, // true if using HTTPS
    httpOnly: true,
    sameSite: 'strict',
  });
}

// --- API Routes ---
const apiRouter = express.Router();
app.use('/api', apiRouter);

// Create new user
apiRouter.post('/auth/create', async (req, res) => {
  if (await findUser('email', req.body.email)) {
    res.status(409).send({ msg: 'Existing user' });
  } else {
    const user = await createUser(req.body.email, req.body.password);
    setAuthCookie(res, user.token);
    res.send({ email: user.email });
  }
});

// Login existing user
apiRouter.post('/auth/login', async (req, res) => {
  const user = await findUser('email', req.body.email);
  if (user && await bcrypt.compare(req.body.password, user.password)) {
    user.token = uuid.v4();
    setAuthCookie(res, user.token);
    res.send({ email: user.email });
  } else {
    res.status(401).send({ msg: 'Unauthorized' });
  }
});

// Logout
apiRouter.delete('/auth/logout', async (req, res) => {
  const user = await findUser('token', req.cookies[authCookieName]);
  if (user) delete user.token;
  res.clearCookie(authCookieName);
  res.status(204).end();
});

// Authorization middleware
async function verifyAuth(req, res, next) {
  const user = await findUser('token', req.cookies[authCookieName]);
  if (user) next();
  else res.status(401).send({ msg: 'Unauthorized' });
}

// Example protected routes
apiRouter.get('/post', verifyAuth, (_req, res) => {
  res.send(scores);
});

apiRouter.post('/friends', verifyAuth, (req, res) => {
  scores.push(req.body);
  res.send(scores);
});

// --- Error handling ---
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).send({ type: err.name, message: err.message });
});

// Fallback route (for SPA)
app.use((_req, res) => {
  res.sendFile('index.html', { root: 'public' });
});

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
