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
  client.db("what2pick").collection('champions').distinct("name", function (err, result) {
    if (err) throw err;
    res.json(result);
  });
});

// BUG: After updating state in main section grid, it sends 2 requests to server
app.post('/selections', async (req, res) => {
  var myRole = req.body.post.myRole
  championToCounter = req.body.post.enemy[myRole.toLowerCase()];

  let CounterOnLaneMultiplier = 1;
  let CounterOtherChampionsMultiplier = 0.8;
  let synergyWithTeammatesMultiplier = 0.45;

  // need to decide wheather these should be an object or array
  let CounterOnLane = [];
  var CounterOtherChampions = [];
  let synergyWithTeammates = [];

  let BestCounters = [];

  let lanes = ["Top", "Jungle", "Middle", "Bottom", "Support", "Unknown"];

  console.log(`--------BEGGINING OF NEW LOG----------`)
  try {
    for (let i = 0; i < lanes.length; i++) {
      let enemyFromLane = req.body.post.enemy[lanes[i].toLowerCase()]
      console.log(enemyFromLane)

      if (enemyFromLane !== 'undefined' && enemyFromLane !== "none") {
        await client.db("what2pick").collection('champions').find({ name: enemyFromLane }).toArray()
          .then(results => {

            // Inputting counters from champions from all lanes other than myRole (because there is different score multiplier)
            if (lanes[i] !== myRole && results[0].counters[myRole] !== undefined) {

              // Iterating trough all champions
              for (let j = 0; j < results[0].counters[myRole].length; j++) {
                console.log(`Added ${results[0].counters[myRole][j].counter} to CounterOtherChampions Array (from other lanes)`)
                // console.log(results[0].counters[myRole][j])
                CounterOtherChampions.push(results[0].counters[myRole][j].counter + " from " + results[0].name)
              }
              
              // Inputting counters from champion from my lane (myRole)
            } else if (results[0].counters[myRole] !== undefined) {
              // Iterating trough all champions
              for (let j = 0; j < results[0].counters[myRole].length; j++) {
                console.log(`Added ${results[0].counters[myRole][j].counter} to CounterOtherChampions Array (from myRole lane)`)
                // console.log(results[0].counters[myRole][j])
                CounterOtherChampions.push(results[0].counters[myRole][j].counter + " from " + results[0].name)
              }
            }
          })
          .catch(error => console.error(error))
      }
    }
    console.log(`BELOW CounterOtherChampions`)
    console.log(CounterOtherChampions)
    console.log(`ABOVE CounterOtherChampions`)

    res.json(`${CounterOtherChampions}`)
  } catch (error) {
    console.log(error);
  }
})

if (process.env.NODE_ENV === 'production') {
  // Serve any static files
  app.use(express.static(path.join(__dirname, '..', 'frontend/build')));

  // Handle React routing, return all requests to React app
  app.get('*', function (req, res) {
    res.sendFile(path.join(__dirname, '..', 'frontend/build', 'index.html'));
  });
}

app.listen(port, () => console.log(`Listening on port ${port}`));