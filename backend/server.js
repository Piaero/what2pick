const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const { dir } = require('console');
const MongoClient = require('mongodb').MongoClient
require('dotenv').config()

const app = express();
const port = process.env.PORT || 5000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// MongoDB Database
const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

client.connect(err => {
  if (err) throw err;
  const db = client.db('what2pick')
  const countersCollection = db.collection("champions");
  console.log('connected to Database')
});

app.get('/champions-list', (req, res) => {
  MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true }, function (err, db) {
    if (err) throw err;
    var database = db.db("what2pick");
    database.collection("champions").distinct("name", function (err, result) {
      if (err) throw err;
      res.json(result);
      db.close();
    });
  });
});

app.post('/selections', (req, res) => {
  function getSuggestions() {
    myRole = req.body.post.myRole
    console.log(`my role is ${myRole}`)

    championToCounter = req.body.post.enemy[myRole.toLowerCase()];
    console.log(`championToCounter is ${championToCounter}`)

    function getDirectCounters() {
      var directCounters = 'No direct counters defined'
      MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true }, function (err, db) {
        db.db("what2pick").collection('champions', function (err, collection) {
          collection.find({ name: championToCounter }).toArray(function (err, results) {
            if (typeof myRole !== "undefined" && typeof championToCounter !== "undefined" && req.body.post.enemy[myRole.toLowerCase()] !== "none" && req.body.post.enemy[myRole.toLowerCase()] !== "Wrong name!") {
              directCounters = results[0].counters[myRole];
            }
            db.close();
          });
        });
      });
      return directCounters;
    }

    return championToCounter;
  }

  console.log(req.body);
  res.json(
    `I received your POST request. This is what you sent me: ${req.body.post}`,
  );
});

if (process.env.NODE_ENV === 'production') {
  // Serve any static files
  app.use(express.static(path.join(__dirname, '..', 'frontend/build')));

  // Handle React routing, return all requests to React app
  app.get('*', function (req, res) {
    res.sendFile(path.join(__dirname, '..', 'frontend/build', 'index.html'));
  });
}

app.listen(port, () => console.log(`Listening on port ${port}`));