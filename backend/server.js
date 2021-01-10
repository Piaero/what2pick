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
  let avoidToPickProposition = {};
  let synergyWithTeammates = [];

  let lanes = ["Top", "Jungle", "Middle", "Bottom", "Support", "Unknown"];

  let queryForAvoidToCounter = `counters.${myRole}.counter`
  let projectionForAvoidToCounter = `counters.${myRole}.counter.$`

  console.log(`------------------BEGGINING OF NEW LOG (app.post('/selections')--------------------------`)

  try {
    for (let i = 0; i < lanes.length; i++) {
      let enemyFromLane = req.body.post.enemy[lanes[i].toLowerCase()]
      let teammateFromLane = req.body.post.teammate[lanes[i].toLowerCase()]

      if (enemyFromLane !== 'undefined' && enemyFromLane !== "none" && enemyFromLane !== "Wrong name!") {

        // Counters to Other Champions: Inputting counters from champions from all lanes other than myRole (because there is different score multiplier)
        if (lanes[i] !== myRole && myRole !== "none" && myRole !== undefined) {

          //  Get counters from lanes different than myRole
          await client.db("what2pick").collection('champions').find({ name: enemyFromLane }).project({ name: 1, counters: 1, laneType: 1 }).toArray()
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

          //  Get counters from myRole
          await client.db("what2pick").collection('champions').find({ name: enemyFromLane }).project({ name: 1, counters: 1, laneType: 1 }).toArray()
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
          if (results[0] !== undefined && results[0].synergies.length !== 0 && lanes[i] !== myRole && myRole !== "none") {
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

    // Merge avoit to pick from all lanes
    for (let i = 0; i < avoidToPickFromAllLanes.length; i++) {
      if (avoidToPickProposition.hasOwnProperty(avoidToPickFromAllLanes[i].name)) {
        avoidToPickProposition[avoidToPickFromAllLanes[i].name].score += avoidToPickFromAllLanes[i].score
        avoidToPickProposition[avoidToPickFromAllLanes[i].name].counterTo[Object.keys(avoidToPickFromAllLanes[i].counterTo)[0]] = {
          counterRate: avoidToPickFromAllLanes[i].counterTo[Object.keys(avoidToPickFromAllLanes[i].counterTo)[0]].counterRate,
          source: avoidToPickFromAllLanes[i].counterTo[Object.keys(avoidToPickFromAllLanes[i].counterTo)[0]].source
        }
      } else {
        avoidToPickProposition[avoidToPickFromAllLanes[i].name] = {
          score: avoidToPickFromAllLanes[i].score,
          counterTo: {
            [Object.keys(avoidToPickFromAllLanes[i].counterTo)[0]]: {
              counterRate: avoidToPickFromAllLanes[i].counterTo[Object.keys(avoidToPickFromAllLanes[i].counterTo)[0]].counterRate,
              source: avoidToPickFromAllLanes[i].counterTo[Object.keys(avoidToPickFromAllLanes[i].counterTo)[0]].source
            }
          }
        }
      }
    }

    // Remove from Counter propositions champions that aren't playable (laneType) on myRole
    let queryForRemovalCountersFromOtherLanes = []

    for (let i = 0; i < Object.keys(CountersProposition).length; i++) {
      let tempObject = { name: Object.keys(CountersProposition)[i] }
      queryForRemovalCountersFromOtherLanes.push(tempObject)
    }

    await client.db("what2pick").collection('champions').find({ $or: queryForRemovalCountersFromOtherLanes }).project({ name: 1, laneType: 1 }).toArray()
      .then(results => {
        for (let i = 0; i < results.length; i++) {
          if (!results[i].laneType.includes(myRole)) {
            delete CountersProposition[results[i].name]
          }
        }
      })
      .catch(error => console.error(error))


    // Remove from Avoid to Pick propositions champions that aren't playable (laneType) on myRole
    let queryForRemovalAvoidsFromOtherLanes = []

    for (let i = 0; i < Object.keys(avoidToPickProposition).length; i++) {
      let tempObject = { name: Object.keys(avoidToPickProposition)[i] }
      queryForRemovalAvoidsFromOtherLanes.push(tempObject)
    }

    await client.db("what2pick").collection('champions').find({ $or: queryForRemovalAvoidsFromOtherLanes }).project({ name: 1, laneType: 1 }).toArray()
      .then(results => {

        for (let i = 0; i < results.length; i++) {
          if (!results[i].laneType.includes(myRole)) {
            delete avoidToPickProposition[results[i].name]
          }
        }
      })
      .catch(error => console.error(error))

    // Adjust score of Champions that are both in "avoidToPickFromAllLanes" and "CountersProposition"
    for (let i = 0; i < Object.entries(avoidToPickProposition).length; i++) {
      if (CountersProposition.hasOwnProperty(Object.entries(avoidToPickProposition)[i][0])) {
        CountersProposition[Object.entries(avoidToPickProposition)[i][0]].score -= avoidToPickProposition[Object.entries(avoidToPickProposition)[i][0]].score
      }
    }

    let response = {
      bestCountersSorted: Object.entries(CountersProposition).sort((a, b) => (a[1].score < b[1].score) ? 1 : -1),
      bestAvoidSorted: Object.entries(avoidToPickProposition).sort((a, b) => (a[1].score < b[1].score) ? 1 : -1)
    }

    console.log(`------------------------req.body.post-------------------------------------`)
    console.log(JSON.stringify(req.body.post, null, " "))
    console.log(`------------------------req.body.post-------------------------------------`)

    console.log(`------------------------RESPONSE-------------------------------------`)
    console.log(JSON.stringify(response, null, " "))
    console.log(`------------------------RESPONSE-------------------------------------`)

    res.json(response)

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