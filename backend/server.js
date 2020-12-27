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
// TODO: unify objects. I am using here 3 kind of objects notations, 2 types of arrays and one JS Object...

app.post('/selections', async (req, res) => {
  var myRole = req.body.post.myRole

  let counterOnLaneMultiplier = 1;
  let counterOtherChampionsMultiplier = 0.45;
  let synergyWithTeammatesMultiplier = 0.20;

  let countersFromAllLanes = [];
  let CountersProposition = {};

  let avoidToPickFromAllLanes = [];

  let synergyWithTeammates = [];



  let lanes = ["Top", "Jungle", "Middle", "Bottom", "Support", "Unknown"];

  let queryForAvoidToCounter = `counters.${myRole}.counter`
  let projectionForAvoidToCounter = `counters.${myRole}.counter.$`

  console.log(`------------------BEGGINING OF NEW LOG--------------------------`)

  try {
    for (let i = 0; i < lanes.length; i++) {
      let enemyFromLane = req.body.post.enemy[lanes[i].toLowerCase()]
      let teammateFromLane = req.body.post.teammate[lanes[i].toLowerCase()]

      console.log(`--- Analising champion and his counters: ${enemyFromLane}`)

      if (enemyFromLane !== 'undefined' && enemyFromLane !== "none" && enemyFromLane !== "Wrong name!") {

        // Counters to Other Champions: Inputting counters from champions from all lanes other than myRole (because there is different score multiplier)
        if (lanes[i] !== myRole && myRole !== "none" && myRole !== undefined) {

          //  I should use projection parameter to reduce results
          await client.db("what2pick").collection('champions').find({ name: enemyFromLane }).toArray()
            .then(results => {

              if (results[0].counters[myRole] !== undefined) {
                for (let j = 0; j < results[0].counters[myRole].length; j++) {
                  results[0].counters[myRole][j].score = results[0].counters[myRole][j].counterRate * counterOtherChampionsMultiplier;
                  results[0].counters[myRole][j].source = lanes[i];
                  results[0].counters[myRole][j].counterTo = { [enemyFromLane]: results[0].counters[myRole][j].counterRate };
                  countersFromAllLanes.push(results[0].counters[myRole][j]);
                }
              }
            })
            .catch(error => console.error(error))


          // Avoid to pick propositions (!== myRole)
          await client.db("what2pick").collection('champions').find({ [queryForAvoidToCounter]: enemyFromLane }).project({ [projectionForAvoidToCounter]: 1, name: 1 }).toArray()
            .then(results => {
              if (results.length !== 0) {
                for (let j = 0; j < results.length; j++) {

                  let championToPush = {}

                  championToPush.name = results[j].name
                  championToPush.score = results[j].counters[myRole][0].counterRate * counterOtherChampionsMultiplier
                  championToPush.counterTo = { [enemyFromLane]: { counterRate: results[j].counters[myRole][0].counterRate, source: lanes[i] } }

                  avoidToPickFromAllLanes.push(championToPush);
                }
              }
            })
            .catch(error => console.error(error))

          // Counters On Lane: Inputting counters from champion from my lane (myRole)
        } else if (myRole !== "none" && myRole !== undefined) {

          //  I should use projection parameter to reduce results
          await client.db("what2pick").collection('champions').find({ name: enemyFromLane }).toArray()
            .then(results => {

              if (results[0].counters[myRole] !== undefined) {
                for (let j = 0; j < results[0].counters[myRole].length; j++) {
                  results[0].counters[myRole][j].score = results[0].counters[myRole][j].counterRate * counterOnLaneMultiplier;
                  results[0].counters[myRole][j].source = lanes[i];
                  results[0].counters[myRole][j].counterTo = { [enemyFromLane]: results[0].counters[myRole][j].counterRate };
                  countersFromAllLanes.push(results[0].counters[myRole][j]);
                }
              }
            })
            .catch(error => console.error(error))

          // Avoid to pick propositions (myRole)
          await client.db("what2pick").collection('champions').find({ [queryForAvoidToCounter]: enemyFromLane }).project({ [projectionForAvoidToCounter]: 1, name: 1 }).toArray()
            .then(results => {
              if (results.length !== 0) {
                for (let j = 0; j < results.length; j++) {

                  let championToPush = {}

                  championToPush.name = results[j].name
                  championToPush.score = results[j].counters[myRole][0].counterRate * counterOnLaneMultiplier
                  championToPush.counterTo = { [enemyFromLane]: { counterRate: results[j].counters[myRole][0].counterRate, source: lanes[i] } }

                  avoidToPickFromAllLanes.push(championToPush);
                }
              }
            })
            .catch(error => console.error(error))
        }
      }

      // Get synergies for all lanes except myRole
      await client.db("what2pick").collection('champions').find({ name: teammateFromLane }).project({ name: 1, synergies: 1 }).toArray()
        .then(results => {
          if (results[0] !== undefined && results[0].synergies.length !== 0 && lanes[i] !== myRole) {
            for (let j = 0; j < results[0].synergies.length; j++) {
              let championToPush = {}

              championToPush.name = results[0].synergies[j].synergy
              championToPush.score = results[0].synergies[j].synergyRate * synergyWithTeammatesMultiplier
              championToPush.synergyTo = { [teammateFromLane]: { synergyRate: results[0].synergies[j].synergyRate, source: lanes[i] } }

              synergyWithTeammates.push(championToPush);
            }
          }
        })
        .catch(error => console.error(error))

    } // End of iterating trough all lanes


    // Merge counters into one and create "SynergiesTo" key
    for (let i = 0; i < countersFromAllLanes.length; i++) {
      if (CountersProposition.hasOwnProperty(countersFromAllLanes[i].counter)) {
        CountersProposition[countersFromAllLanes[i].counter].score += countersFromAllLanes[i].score
        CountersProposition[countersFromAllLanes[i].counter].counterTo[Object.keys(countersFromAllLanes[i].counterTo)[0]] = {
          counterRate: countersFromAllLanes[i].counterRate,
          source: countersFromAllLanes[i].source
        }
        CountersProposition[countersFromAllLanes[i].counter].synergyTo = {}

      } else {
        CountersProposition[countersFromAllLanes[i].counter] = {
          score: countersFromAllLanes[i].score,
          counterTo: {
            [Object.keys(countersFromAllLanes[i].counterTo)[0]]: {
              counterRate: countersFromAllLanes[i].counterRate,
              source: countersFromAllLanes[i].source
            }
          },
          synergyTo: {}
        }
      }
    }

    // Merge Synergies with Counters
    for (let i = 0; i < synergyWithTeammates.length; i++) {
      if (CountersProposition.hasOwnProperty(synergyWithTeammates[i].name)) {
        CountersProposition[synergyWithTeammates[i].name].score += synergyWithTeammates[i].score
        CountersProposition[synergyWithTeammates[i].name].synergyTo[Object.keys(synergyWithTeammates[i].synergyTo)[0]] = {
          synergyRate: synergyWithTeammates[i].synergyTo[Object.keys(synergyWithTeammates[i].synergyTo)[0]].synergyRate,
          source: synergyWithTeammates[i].synergyTo[Object.keys(synergyWithTeammates[i].synergyTo)[0]].source
        }
      } else {
        CountersProposition[synergyWithTeammates[i].name] = {
          score: synergyWithTeammates[i].score,
          synergyTo: {
            [Object.keys(synergyWithTeammates[i].synergyTo)[0]]: {
              synergyRate: synergyWithTeammates[i].synergyTo[Object.keys(synergyWithTeammates[i].synergyTo)[0]].synergyRate,
              source: synergyWithTeammates[i].synergyTo[Object.keys(synergyWithTeammates[i].synergyTo)[0]].source
            }
          }
        }
      }
    }

    function mergeAvoidIntoSortableObject(array) {
      let avoidToPickProposition = {};

      for (let i = 0; i < array.length; i++) {
        if (avoidToPickProposition.hasOwnProperty(array[i].name)) {
          avoidToPickProposition[array[i].name].score += array[i].score
          avoidToPickProposition[array[i].name].counterTo[Object.keys(array[i].counterTo)[0]] = {
            counterRate: array[i].counterTo[Object.keys(array[i].counterTo)[0]].counterRate,
            source: array[i].counterTo[Object.keys(array[i].counterTo)[0]].source
          }
        } else {
          avoidToPickProposition[array[i].name] = {
            score: array[i].score,
            counterTo: {
              [Object.keys(array[i].counterTo)[0]]: {
                counterRate: array[i].counterTo[Object.keys(array[i].counterTo)[0]].counterRate,
                source: array[i].counterTo[Object.keys(array[i].counterTo)[0]].source
              }
            }
          }
        }
      }

      return avoidToPickProposition
    }

    // Merge avoid into one and adjust score of duplicates

    let bestCountersSorted = Object.entries(CountersProposition).sort((a, b) => (a[1].score < b[1].score) ? 1 : -1);
    let bestAvoidSorted = Object.entries(mergeAvoidIntoSortableObject(avoidToPickFromAllLanes)).sort((a, b) => (a[1].score < b[1].score) ? 1 : -1);

    console.log(`------------------------TEST-------------myRole is: ${myRole}----`)
    console.log(JSON.stringify(bestCountersSorted, null, " "))
    console.log(`------------------------TEST-------------------------------------`)

    res.json(`${JSON.stringify(bestCountersSorted)}`)

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