var MongoClient = require('mongodb').MongoClient;
const config = require('./config');
const express = require('express');
const app = express();


var print = console.log;
const client = new MongoClient(config.mongodb_url);

(async () => {
  try {
    await client.connect();
    const db = client.db('cihistory');

		app.db = db;
		app.listen(config.express_port, () => console.log(`Example app listening on port ${config.express_port}!`));

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
