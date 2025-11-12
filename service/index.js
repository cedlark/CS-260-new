const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');
const express = require('express');
const uuid = require('uuid');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const DB = require('./database.js');

const app = express();
const authCookieName = 'token';
const port = process.argv.length > 2 ? process.argv[2] : 4000;

// JSON body parsing (supports larger payloads for safety)
app.use(express.json({ limit: '10mb' }));

// Router for service endpoints
const apiRouter = express.Router();
app.use('/api', apiRouter);

// Ensure the uploads folder exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, uniqueName + ext);
  },
});

// Optional: restrict to image types & max size (5 MB)
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (req, file, cb) => {
    const allowed = ['.png', '.jpg', '.jpeg', '.gif'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (!allowed.includes(ext)) {
      return cb(new Error('Only images are allowed'));
    }
    cb(null, true);
  },
});

// Serve uploaded files statically
app.use('/uploads', express.static(uploadDir));

// File upload endpoint
apiRouter.post('/upload', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).send({ error: 'No file uploaded' });
  }
  const imagePath = `/uploads/${req.file.filename}`;
  res.send({ imagePath });
});

// Use cookie parser for auth tracking
app.use(cookieParser());

// Serve up static frontend content
app.use(express.static('public'));

// CreateAuth token for a new user
apiRouter.post('/auth/create', async (req, res) => {
  if (await findUser('email', req.body.email)) {
    res.status(409).send({ msg: 'Existing user' });
  } else {
    const user = await createUser(req.body.email, req.body.password);
    setAuthCookie(res, user.token);
    res.send({ email: user.email });
  }
});

// GetAuth token for the provided credentials
apiRouter.post('/auth/login', async (req, res) => {
  const user = await findUser('email', req.body.email);
  if (user) {
    if (await bcrypt.compare(req.body.password, user.password)) {
      user.token = uuid.v4();
      await DB.updateUser(user);
      setAuthCookie(res, user.token);
      res.send({ email: user.email });
      return;
    }
  }
  res.status(401).send({ msg: 'Unauthorized' });
});

// DeleteAuth token
apiRouter.delete('/auth/logout', async (req, res) => {
  const user = await findUser('token', req.cookies[authCookieName]);
  if (user) {
    delete user.token;
    DB.updateUser(user);
  }
  res.clearCookie(authCookieName);
  res.status(204).end();
});

// Middleware to verify that the user is authorized
const verifyAuth = async (req, res, next) => {
  const user = await findUser('token', req.cookies[authCookieName]);
  if (user) {
    next();
  } else {
    res.status(401).send({ msg: 'Unauthorized' });
  }
};

// Get all posts
apiRouter.get('/post', verifyAuth, async (req, res) => {
  const posts = await DB.getNewPost();
  res.send(posts);
});

// Add a new post
apiRouter.post('/post', verifyAuth, async (req, res) => {
  try {
    const posts = await updatePosts(req.body);
    res.send(posts);
  } catch (err) {
    console.error('Error in /post:', err);
    res.status(500).send({ error: err.message });
  }
});

// Add a friend
apiRouter.post('/friends', verifyAuth, async (req, res) => {
  const user = await findUser('token', req.cookies[authCookieName]);
  const { friendEmail } = req.body;
  if (!friendEmail) return res.status(400).send({ msg: 'Missing friend email' });

  await DB.addFriend(user.email, friendEmail);
  const friends = await DB.getFriends(user.email);
  res.send(friends);
});

// Get friend list
apiRouter.get('/friends', verifyAuth, async (req, res) => {
  const user = await findUser('token', req.cookies[authCookieName]);
  const friends = await DB.getFriends(user.email);
  res.send(friends);
});

// Search users
apiRouter.get('/users/search', verifyAuth, async (req, res) => {
  const query = req.query.q || '';
  if (!query.trim()) {
    return res.status(400).send({ msg: 'Missing search query' });
  }

  const users = await DB.searchUsers(query);
  res.send(users);
});

async function updatePosts(newPost) {
  await DB.addPost(newPost);
  return DB.getNewPost();
}

async function createUser(email, password) {
  const passwordHash = await bcrypt.hash(password, 10);
  const user = { email, password: passwordHash, token: uuid.v4() };
  await DB.addUser(user);
  return user;
}

async function findUser(field, value) {
  if (!value) return null;
  if (field === 'token') {
    return DB.getUserByToken(value);
  }
  return DB.getUser(value);
}

function setAuthCookie(res, authToken) {
  res.cookie(authCookieName, authToken, {
    maxAge: 1000 * 60 * 60 * 24 * 365,
    secure: true,
    httpOnly: true,
    sameSite: 'strict',
  });
}


// Default error handler
app.use(function (err, req, res, next) {
  console.error('Unhandled error:', err);
  res.status(500).send({ type: err.name, message: err.message });
});

// Default page handler
app.use((_req, res) => {
  res.sendFile('index.html', { root: 'public' });
});

// Start the server
const httpService = app.listen(port, () => {
  console.log(`✅ Listening on port ${port}`);
});
