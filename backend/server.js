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
// I am using here 3 kind of objects ontations, 2 types of arrays and one JS Object...
app.post('/selections', async (req, res) => {
  var myRole = req.body.post.myRole
  championToCounter = req.body.post.enemy[myRole.toLowerCase()];

  let counterOnLaneMultiplier = 1;
  let counterOtherChampionsMultiplier = 0.45;
  let synergyWithTeammatesMultiplier = 0.20;

  // need to decide wheather these should be an object or array
  let counterOnLane = [];
  let counterOtherChampions = [];
  let countersMerged = [];
  let synergyWithTeammates = [];

  let bestCounters = {};

  let lanes = ["Top", "Jungle", "Middle", "Bottom", "Support", "Unknown"];

  console.log(`--------BEGGINING OF NEW LOG----------`)
  try {
    for (let i = 0; i < lanes.length; i++) {
      let enemyFromLane = req.body.post.enemy[lanes[i].toLowerCase()]
      console.log(`--- Analising champion and his counters: ${enemyFromLane}`)

      if (enemyFromLane !== 'undefined' && enemyFromLane !== "none") {
        await client.db("what2pick").collection('champions').find({ name: enemyFromLane }).toArray()
          .then(results => {

            // Counters to Other Champions: Inputting counters from champions from all lanes other than myRole (because there is different score multiplier)
            if (lanes[i] !== myRole && results[0].counters[myRole] !== undefined) {
              // Iterating trough all champions
              for (let j = 0; j < results[0].counters[myRole].length; j++) {
                console.log(`Added ${results[0].counters[myRole][j].counter} to counterOtherChampions Array (from other lanes)`)
                console.log(results[0].counters[myRole][j])
                results[0].counters[myRole][j].score = results[0].counters[myRole][j].counterRate * counterOtherChampionsMultiplier;
                results[0].counters[myRole][j].source = "COC";
                results[0].counters[myRole][j].counterTo = { [enemyFromLane]: results[0].counters[myRole][j].counterRate };
                counterOtherChampions.push(results[0].counters[myRole][j]);
              }

              // Counters On Lane: Inputting counters from champion from my lane (myRole)
            } else if (results[0].counters[myRole] !== undefined) {
              // Iterating trough all champions
              for (let j = 0; j < results[0].counters[myRole].length; j++) {
                console.log(`Added ${results[0].counters[myRole][j].counter} to counterOtherChampions Array (from myRole lane)`)
                results[0].counters[myRole][j].score = results[0].counters[myRole][j].counterRate * counterOnLaneMultiplier;
                results[0].counters[myRole][j].source = "COL";
                results[0].counters[myRole][j].counterTo = { [enemyFromLane]: results[0].counters[myRole][j].counterRate };
                counterOnLane.push(results[0].counters[myRole][j]);
              }
            }
          })
          .catch(error => console.error(error))
      }
    } // end of populating counterOnLane and counterOtherChampions arrays

    countersMerged = counterOnLane.concat(counterOtherChampions)

    for (let i = 0; i < countersMerged.length; i++) {
      if (bestCounters.hasOwnProperty(countersMerged[i].counter)) {
        console.log(countersMerged[i].counter)
        bestCounters[countersMerged[i].counter].score += countersMerged[i].score
        bestCounters[countersMerged[i].counter].counterTo[Object.keys(countersMerged[i].counterTo)[0]] = {
          counterRate: countersMerged[i].counterRate,
          source: countersMerged[i].source
        }

      } else {
        bestCounters[countersMerged[i].counter] = {
          score: countersMerged[i].score,
          counterTo: {
            [Object.keys(countersMerged[i].counterTo)[0]]: {
              counterRate: countersMerged[i].counterRate,
              source: countersMerged[i].source
            }
          }
        }
      }
    }

    let bestCountersorted = Object.entries(bestCounters).sort((a, b) => (a[1].score < b[1].score) ? 1 : -1);

    console.log(`------------ BELOW countersMerged myRole is: ${myRole}`)
    console.log(countersMerged)
    console.log(`------------ ABOVE countersMerged`)


    console.log(`------------ BELOW bestCounters myRole is: ${myRole}`)
    console.log(bestCountersorted)
    console.log(`------------ ABOVE bestCounters`)

    res.json(`${JSON.stringify(bestCounters)}`)
    
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