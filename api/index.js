var MongoClient = require('mongodb').MongoClient;
const express = require('express');
const app = express();
const port = 3000;



var url = "mongodb://admin:password@mongo:27017/";
var print = console.log;
const client = new MongoClient(url);

(async () => {
  try {
    await client.connect();
    const db = client.db('cihistory');

		app.db = db;
		app.listen(port, () => console.log(`Example app listening on port ${port}!`));

  } catch(e) {
    console.error("Database error " + e);
    // TODO: Close connection else where. Maybe on express servr close?
    client.close();
  }

})();

function wrap_results(data) {
	return {
  	results: data,
    count: data.length,
	}
}

app.get('/api/v1/suites/', function (req, res) {
  (async () => {
		const suites = await app.db.collection('suites').find({}).toArray();
		res.send(wrap_results(suites));
  })();
});


/*
app.get('/api/v1/cases/', function (req, res) {
  (async () => {
		const suites = await app.db.collection('cases').find({}).toArray();
		res.send(wrap_results(suites));
  })();
});
*/
