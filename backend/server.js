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

app.post('/selections', async (req, res) => {
  console.log(`------------------BEGGINING OF NEW LOG (app.post('/selections')--------------------------`)

  var myRole = req.body.post.myRole

  let counterOnMyLaneMultiplier = 1;
  let counterOtherLaneMultiplier = 0.45;
  let synergyWithTeammatesMultiplier = 0.20;

  let lanes = ["Top", "Jungle", "Middle", "Bottom", "Support", "Unknown"];

  var queryForAvoidToCounter = `counters.${myRole}.counter`
  var projectionForAvoidToCounter = `counters.${myRole}.counter.$`

  var picksProposition = {}
  var avoidToPickProposition = {}

  function pushPicksIntoPicksProposition(championName, results, isMyRole, isCounterOrSynergy) {

    let counterSynergyMultiplier = isCounterOrSynergy === "counters" ? isMyRole ? counterOnMyLaneMultiplier : counterOtherLaneMultiplier : synergyWithTeammatesMultiplier
    let counterOrSynergy = isCounterOrSynergy === "counters" ? "counter" : "synergy"
    let counterRateOrSynergyRate = isCounterOrSynergy === "counters" ? "counterRate" : "synergyRate"
    let counterToOrSynergyTo = isCounterOrSynergy === "counters" ? "counterTo" : "synergyTo"

    if (results !== undefined) {
      for (let j = 0; j < results.length; j++) {
        if (picksProposition.hasOwnProperty(results[j][counterOrSynergy])) {
          picksProposition[results[j][counterOrSynergy]].score += results[j][counterRateOrSynergyRate] * counterSynergyMultiplier
          picksProposition[results[j][counterOrSynergy]][counterToOrSynergyTo][championName] = {
            [counterRateOrSynergyRate]: results[j][counterRateOrSynergyRate],
            source: lanes[i],
          }
        } else {
          picksProposition[results[j][counterOrSynergy]] = {
            score: results[j][counterRateOrSynergyRate] * counterSynergyMultiplier,
            synergyTo: {},
            counterTo: {}
          }
          picksProposition[results[j][counterOrSynergy]][counterToOrSynergyTo] = {
            [championName]: {
              [counterRateOrSynergyRate]: results[j][counterRateOrSynergyRate],
              source: lanes[i],
            }
          }
        }
      }
    }
  }

  function pushAvoidToPickIntoAvoidsProposition(championName, results, isMyRole) {

    let counterSynergyMultiplier = isMyRole ? counterOnMyLaneMultiplier : counterOtherLaneMultiplier

    if (results !== undefined) {
      for (let j = 0; j < results.length; j++) {
        if (avoidToPickProposition.hasOwnProperty(results[j].name)) {
          avoidToPickProposition[results[j].name].score += results[j].counters[myRole][0].counterRate * counterSynergyMultiplier
          avoidToPickProposition[results[j].name].counterTo[championName] = {
            counterRate: results[j].counters[myRole][0].counterRate,
            source: lanes[i]
          }
        } else {
          avoidToPickProposition[results[j].name] = {
            score: results[j].counters[myRole][0].counterRate * counterSynergyMultiplier,
            counterTo: {
              [championName]: {
                counterRate: results[j].counters[myRole][0].counterRate,
                source: lanes[i]
              }
            }
          }
        }
      }
    }
  }

    for (var i = 0; i < lanes.length; i++) {
      let enemyFromLane = req.body.post.enemy[lanes[i].toLowerCase()]
      let teammateFromLane = req.body.post.teammate[lanes[i].toLowerCase()]

      if (enemyFromLane !== 'undefined' && enemyFromLane !== "none" && enemyFromLane !== "Wrong name!") {

        // Picks, Avoids and Synergies (!== myRole)
        if (lanes[i] !== myRole && myRole !== "none" && myRole !== undefined) {

          await client.db("what2pick").collection('champions').find({ name: enemyFromLane }).project({ name: 1, counters: 1 }).toArray()
            .then(results => {
              pushPicksIntoPicksProposition(enemyFromLane, results[0] && results[0].counters && results[0].counters[myRole], false, "counters")
            })
            .catch(error => console.error(error))

          await client.db("what2pick").collection('champions').find({ [queryForAvoidToCounter]: enemyFromLane }).project({ [projectionForAvoidToCounter]: 1, name: 1 }).toArray()
            .then(results => {
              pushAvoidToPickIntoAvoidsProposition(enemyFromLane, results, false)
            })
            .catch(error => console.error(error))

          await client.db("what2pick").collection('champions').find({ name: teammateFromLane }).project({ name: 1, synergies: 1 }).toArray()
            .then(results => {
              pushPicksIntoPicksProposition(teammateFromLane, results[0] && results[0].synergies, null, "synergies")
            })
            .catch(error => console.error(error))

          // Picks and Avoids (myRole)
        } else if (myRole !== "none" && myRole !== undefined) {
          await client.db("what2pick").collection('champions').find({ name: enemyFromLane }).project({ name: 1, counters: 1 }).toArray()
            .then(results => {
              pushPicksIntoPicksProposition(enemyFromLane, results[0] && results[0].counters && results[0].counters[myRole], true, "counters")
            })
            .catch(error => console.error(error))

          await client.db("what2pick").collection('champions').find({ [queryForAvoidToCounter]: enemyFromLane }).project({ [projectionForAvoidToCounter]: 1, name: 1 }).toArray()
            .then(results => {
              pushAvoidToPickIntoAvoidsProposition(enemyFromLane, results, true)
            })
            .catch(error => console.error(error))
        }
      }
    } // End of iterating trough all lanes

    // Remove from Counter propositions champions that aren't playable (laneType) on myRole
    let queryForRemovalCountersFromOtherLanes = []

    for (let i = 0; i < Object.keys(picksProposition).length; i++) {
      let tempObject = { name: Object.keys(picksProposition)[i] }
      queryForRemovalCountersFromOtherLanes.push(tempObject)
    }

    if (queryForRemovalCountersFromOtherLanes.length) {
      await client.db("what2pick").collection('champions').find({ $or: queryForRemovalCountersFromOtherLanes }).project({ name: 1, laneType: 1 }).toArray()
        .then(results => {
          for (let i = 0; i < results.length; i++) {
            if (!results[i].laneType.includes(myRole)) {
              delete picksProposition[results[i].name]
            }
          }
        })
        .catch(error => console.error(error))
    }

    // Remove from Avoid to Pick propositions champions that aren't playable (laneType) on myRole
    let queryForRemovalAvoidsFromOtherLanes = []

    for (let i = 0; i < Object.keys(avoidToPickProposition).length; i++) {
      let tempObject = { name: Object.keys(avoidToPickProposition)[i] }
      queryForRemovalAvoidsFromOtherLanes.push(tempObject)
    }

    if (queryForRemovalAvoidsFromOtherLanes.length) {
      await client.db("what2pick").collection('champions').find({ $or: queryForRemovalAvoidsFromOtherLanes }).project({ name: 1, laneType: 1 }).toArray()
        .then(results => {
          for (let i = 0; i < results.length; i++) {
            if (!results[i].laneType.includes(myRole)) {
              delete avoidToPickProposition[results[i].name]
            }
          }
        })
        .catch(error => console.error(error))
    }

    // Adjust score of Champions that are both in "avoidToPickFromAllLanes" and "CountersProposition"
    for (let i = 0; i < Object.entries(avoidToPickProposition).length; i++) {
      if (picksProposition.hasOwnProperty(Object.entries(avoidToPickProposition)[i][0])) {
        picksProposition[Object.entries(avoidToPickProposition)[i][0]].score -= avoidToPickProposition[Object.entries(avoidToPickProposition)[i][0]].score
      }
    }

    let response = {
      bestCountersSorted: Object.entries(picksProposition).sort((a, b) => (a[1].score < b[1].score) ? 1 : -1),
      bestAvoidSorted: Object.entries(avoidToPickProposition).sort((a, b) => (a[1].score < b[1].score) ? 1 : -1)
    }

    console.log(`------------------------req.body.post-------------------------------------`)
    console.log(JSON.stringify(req.body.post, null, " "))
    console.log(`------------------------req.body.post-------------------------------------`)

    console.log(`------------------------RESPONSE-------------------------------------`)
    console.log(JSON.stringify(response, null, " "))
    console.log(`------------------------RESPONSE-------------------------------------`)

    res.json(response)


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