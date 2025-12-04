const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');
const express = require('express');
const uuid = require('uuid');
const DB = require('./database.js');
const { WebSocketServer } = require('ws');

const app = express();
const authCookieName = 'token';
const port = process.argv.length > 2 ? process.argv[2] : 4000;

// Allow large JSON bodies for Base64 images
app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());
app.use(express.static('public'));

const apiRouter = express.Router();
app.use('/api', apiRouter);

// ---------- AUTH ROUTES ----------

apiRouter.post('/auth/create', async (req, res) => {
  if (await findUser('email', req.body.email)) {
    res.status(409).send({ msg: 'Existing user' });
  } else {
    const user = await createUser(req.body.email, req.body.password);
    setAuthCookie(res, user.token);
    res.send({ email: user.email });
  }
});

apiRouter.post('/auth/login', async (req, res) => {
  const user = await findUser('email', req.body.email);
  if (user && await bcrypt.compare(req.body.password, user.password)) {
    user.token = uuid.v4();
    await DB.updateUser(user);
    setAuthCookie(res, user.token);
    res.send({ email: user.email });
  } else {
    res.status(401).send({ msg: 'Unauthorized' });
  }
});

apiRouter.delete('/auth/logout', async (req, res) => {
  const user = await findUser('token', req.cookies[authCookieName]);
  if (user) {
    delete user.token;
    DB.updateUser(user);
  }
  res.clearCookie(authCookieName);
  res.status(204).end();
});

// ---------- AUTH MIDDLEWARE ----------

const verifyAuth = async (req, res, next) => {
  const token = req.cookies[authCookieName];
  const user = await findUser('token', token);
  if (user) next();
  else res.status(401).send({ msg: 'Unauthorized' });
};

// ---------- POSTS (now with Base64 image in req.body.image) ----------

apiRouter.get('/post', verifyAuth, async (req, res) => {
  const user = await findUser('token', req.cookies[authCookieName]);
  const friends = await DB.getFriends(user.email);

  const allowedUsers = [...friends, user.email];

  const posts = await DB.getPostsByUsers(allowedUsers);
  // Optional: newest first
  posts.sort((a, b) => b.timestamp - a.timestamp);
  res.send(posts);
});

apiRouter.post('/post', verifyAuth, async (req, res) => {
  try {
    const user = await findUser('token', req.cookies[authCookieName]);
    const postData = {
      ...req.body,          // text + image (Base64) from frontend
      user: user.email,
      timestamp: Date.now(),
    };
    await DB.addPost(postData);
    req.app.locals.wss.broadcastPost(postData);
    res.send({ ok: true });
  } catch (err) {
    console.error('Error in /post:', err);
    res.status(500).send({ error: err.message });
  }
});

// ---------- FRIENDS ----------

apiRouter.post('/friends', verifyAuth, async (req, res) => {
  const user = await findUser('token', req.cookies[authCookieName]);
  await DB.addFriend(user.email, req.body.friendEmail);
  res.send(await DB.getFriends(user.email));
});

apiRouter.get('/friends', verifyAuth, async (req, res) => {
  const user = await findUser('token', req.cookies[authCookieName]);
  res.send(await DB.getFriends(user.email));
});

apiRouter.post('/friends/remove', verifyAuth, async (req, res) => {
  try {
    const user = await findUser('token', req.cookies[authCookieName]);
    const { friendEmail } = req.body;

    if (!friendEmail) {
      return res.status(400).send({ msg: 'Missing friend email' });
    }

    await DB.removeFriend(user.email, friendEmail);
    const updatedFriends = await DB.getFriends(user.email);
    res.send(updatedFriends);
  } catch (err) {
    console.error('Error in /friends/remove:', err);
    res.status(500).send({ error: err.message });
  }
});

apiRouter.get('/users/search', verifyAuth, async (req, res) => {
  const query = req.query.q || "";
  if (!query.trim()) return res.status(400).send({ msg: "Missing search query" });

  res.send(await DB.searchUsers(query));
});

// ---------- USER HELPERS ----------

async function createUser(email, password) {
  const passwordHash = await bcrypt.hash(password, 10);
  const user = { email, password: passwordHash, token: uuid.v4() };
  await DB.addUser(user);
  return user;
}

async function findUser(field, value) {
  if (!value) return null;
  return field === 'token'
    ? DB.getUserByToken(value)
    : DB.getUser(value);
}

function setAuthCookie(res, authToken) {
  res.cookie(authCookieName, authToken, {
    maxAge: 1000 * 60 * 60 * 24 * 365,
    secure: false,
    httpOnly: true,
    sameSite: 'lax',
  });
}

// ---------- ERROR HANDLER ----------

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).send({ error: err.message });
});

// ---------- START SERVER + WEBSOCKET ----------

const server = app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

const wss = new WebSocketServer({ server });
app.locals.wss = wss;

wss.on('connection', async (socket, req) => {
  socket.isAlive = true;

  socket.on('pong', () => {
    socket.isAlive = true;
  });

  socket.on('message', async (data) => {
    let msg;

    try {
      msg = JSON.parse(data);
    } catch {
      return;
    }

    if (msg.type === "auth") {
      const user = await DB.getUserByToken(msg.token);

      if (!user) {
        socket.close();
        return;
      }

      socket.email = user.email;
      console.log("WebSocket auth:", socket.email);
    }
  });
});

setInterval(() => {
  wss.clients.forEach(client => {
    if (!client.isAlive) return client.terminate();
    client.isAlive = false;
    client.ping();
  });
}, 10000);

wss.broadcastPost = async function(post) {
  const friends = await DB.getFriends(post.user);
  const allowed = new Set([...friends, post.user]);

  wss.clients.forEach(client => {
    if (client.readyState === 1 && allowed.has(client.email)) {
      client.send(JSON.stringify({
        type: "post",
        post
      }));
    }
  });
};
