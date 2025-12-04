const { MongoClient } = require('mongodb');
const config = require('./dbConfig.json');

const url = `mongodb+srv://${config.userName}:${config.password}@${config.hostname}`;
const client = new MongoClient(url);
let db;
let userCollection;
let postCollection;

async function connect() {
  if (!db) {
    await client.connect();
    db = client.db('startup');
    userCollection = db.collection('user');
    postCollection = db.collection('posts');
    console.log('✅ Connected to MongoDB');
  }
}

async function getUser(email) {
  await connect();
  return userCollection.findOne({ email });
}

async function getUserByToken(token) {
  await connect();
  return userCollection.findOne({ token });
}

async function addUser(user) {
  await connect();
  await userCollection.insertOne(user);
}

async function updateUser(user) {
  await connect();
  await userCollection.updateOne({ email: user.email }, { $set: user });
}

async function addPost(post) {
  await connect();
  return postCollection.insertOne(post);
}

async function getNewPost() {
  await connect();
  const options = { sort: { _id: -1 }, limit: 10 };
  const cursor = postCollection.find({}, options);
  return cursor.toArray();
}

async function addFriend(email, friendEmail) {
  await connect();
  return userCollection.updateOne({ email }, { $addToSet: { friends: friendEmail } });
}

async function getFriends(email) {
  await connect();
  const user = await userCollection.findOne({ email });
  return user?.friends || [];
}

async function searchUsers(query) {
  await connect();
  const filter = { email: { $regex: query, $options: 'i' } };
  const projection = { email: 1, _id: 0 };
  return userCollection.find(filter, { projection }).limit(10).toArray();
}

async function removeFriend(email, friendEmail) {
  await connect();
  return userCollection.updateOne(
    { email },
    { $pull: { friends: friendEmail } }
  );
}

async function getPostsByUsers(userEmails) {
  await connect();
  return postCollection
    .find({ user: { $in: userEmails } })
    .sort({ timestamp: -1 })
    .toArray();
}

module.exports = {
  getUser,
  getUserByToken,
  addUser,
  updateUser,
  addPost,
  getNewPost,
  addFriend,
  getFriends,
  searchUsers,
  removeFriend,
  getPostsByUsers,
};
