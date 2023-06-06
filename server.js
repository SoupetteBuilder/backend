const express = require('express');
const app = express();
const port = 3001;
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database(':memory:');

require('dotenv').config();


app.get('/', (req, res) => {
  res.send('Hello World!');
});

// Initialize the users table
db.serialize(function() {
  db.run("CREATE TABLE users (email TEXT UNIQUE, password TEXT)");
});

app.use(express.json());

const usersRouter = require('./routes/users')(db);
app.use('/users', usersRouter);

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});

process.on('SIGINT', () => {
  db.close();
  process.exit(0);
});
