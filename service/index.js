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
const { WebSocketServer } = require('ws');


app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());
app.use(express.static('public'));


const apiRouter = express.Router();
app.use('/api', apiRouter);


const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, unique + ext);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: (req, file, cb) => {
    const allowed = ['.jpg', '.jpeg', '.png', '.gif'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (!allowed.includes(ext)) {
      return cb(new Error('Only images are allowed'));
    }
    cb(null, true);
  },
});

// Static serving of uploaded images
app.use('/uploads', express.static(uploadDir));

// Upload endpoint
apiRouter.post('/upload', upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).send({ error: 'No file uploaded' });
  res.send({ imagePath: `/uploads/${req.file.filename}` });
});


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


const verifyAuth = async (req, res, next) => {
  const token = req.cookies[authCookieName];
  const user = await findUser('token', token);
  if (user) next();
  else res.status(401).send({ msg: 'Unauthorized' });
};


apiRouter.get('/post', verifyAuth, async (req, res) => {
  const user = await findUser('token', req.cookies[authCookieName]);
  const friends = await DB.getFriends(user.email);

  const allowedUsers = [...friends, user.email];

  const posts = await DB.getPostsByUsers(allowedUsers);
  res.send(posts);
});

apiRouter.post('/post', verifyAuth, async (req, res) => {
  try {
    const user = await findUser('token', req.cookies[authCookieName]);
    const postData = {
      ...req.body,
      user: user.email,
      timestamp: Date.now(),
    };
    await DB.addPost(postData);
    req.app.locals.wss.broadcastPost(postData);
    res.send(await DB.getNewPost());
  } catch (err) {
    console.error("Error in /post:", err);
    res.status(500).send({ error: err.message });
  }
});


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


app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).send({ error: err.message });
});


const server = app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

const wss = new WebSocketServer({ server });
app.locals.wss = wss;
const DB = require('./database.js');

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
