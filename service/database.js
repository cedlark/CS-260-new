const { MongoClient } = require('mongodb');
const config = require('./dbConfig.json');

const url = `mongodb+srv://${config.userName}:${config.password}@${config.hostname}`;
const client = new MongoClient(url);
await client.connect();
const db = client.db('startup');
const userCollection = db.collection('user');
const postCollection = db.collection('posts');


// This will asynchronously test the connection and exit the process if it fails
(async function testConnection() {
  try {
    await db.command({ ping: 1 });
    console.log(`Connect to database`);
  } catch (ex) {
    console.log(`Unable to connect to database with ${url} because ${ex.message}`);
    process.exit(1);
  }
})();

function getUser(email) {
  return userCollection.findOne({ email: email });
}

function getUserByToken(token) {
  return userCollection.findOne({ token: token });
}

async function addUser(user) {
  await userCollection.insertOne(user);
}

async function updateUser(user) {
  await userCollection.updateOne({ email: user.email }, { $set: user });
}

async function addPost(post) {
  return postCollection.insertOne(post);
}

async function getNewPost() {
  const options = { sort: { _id: -1 }, limit: 10 };
  const cursor = postCollection.find({}, options);
  return cursor.toArray();
}
async function addFriend(email, friendEmail) {
  return userCollection.updateOne(
    { email },
    { $addToSet: { friends: friendEmail } }  // prevents duplicates
  );
}

async function getFriends(email) {
  const user = await userCollection.findOne({ email });
  return user?.friends || [];
}

async function searchUsers(query) {
  // Use a case-insensitive regex search on the email or username field
  const filter = {
    email: { $regex: query, $options: "i" }
  };

  const projection = { email: 1, _id: 0 };
  const users = await userCollection.find(filter, { projection }).limit(10).toArray();
  return users;
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
  searchUsers
};
