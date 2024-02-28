const express = require('express');
var mysql = require('mysql');
const moment = require('moment');
const app = express();
require('dotenv').config()

const db = mysql.createConnection({
    host : process.env.MYSQL_HOST,
    user : process.env.MYSQL_USER,
    password : process.env.MYSQL_PASSWORD,
    database : process.env.MYSQL_DB,
});

const port = 8080

db.connect(function(err){
    if(err){
        console.error('Error connecting :' + err.stack);
        return;
    }
    console.log('connected as id' + db.threadId);
});



app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
  });

app.get('/health'), (req, res) => {
    console.log("data");
    res.json("hi");
}

app.get('/showData/:range', (req, res) => {
  const range = req.params.range;

  const sqlQuery = `select * from LeaderBoard ORDER BY Score DESC LIMIT ${range};`;

    db.query(sqlQuery, (err, results) => {
        if (err) {
          console.error('Error executing query:', err);
          res.status(500).json({ error: 'Internal Server Error' });
          return;
        }
        res.json(results);
      });
  });


app.get('/insert-data/:range', (req, res) => {
  const range = req.params.range;

  const sqlQuery = "insert into LeaderBoard (UID, Name, Score, Country, Timestamp) values ?";

    db.query(sqlQuery, [createData(range)], (err, results) => {
        if (err) {
          console.error('Error executing query:', err);
          res.status(500).json({ error: 'Internal Server Error' });
          return;
        }
        res.json(results);
      });
  });


app.get('/remove-data', (req, res) => {

  const sqlQuery = "delete from LeaderBoard;"

    db.query(sqlQuery, (err, results) => {
        if (err) {
          console.error('Error executing query:', err);
          res.status(500).json({ error: 'Internal Server Error' });
          return;
        }
        res.json(results);
      });
  }
);

app.get('/current-week-leaderboard', (req, res) => {
    const startOfWeek = moment().startOf('isoWeek').format('YYYY-MM-DD HH:mm:ss');
    const endOfWeek = moment().endOf('isoWeek').format('YYYY-MM-DD HH:mm:ss');
  
    const query = `
      SELECT *
      FROM LeaderBoard
      WHERE TimeStamp BETWEEN '${startOfWeek}' AND '${endOfWeek}'
      ORDER BY Score DESC
      LIMIT 200;
    `;
  
    db.query(query, (err, results) => {
      if (err) {
        console.error('Error executing query:', err);
        res.status(500).json({ error: 'Internal Server Error' });
        return;
      }
  
      res.json(results);
    });
  });
  
  // API to display last week leaderboard given a country by the user (Top 200)
  app.get('/last-week-leaderboard/:country', (req, res) => {
    const country = req.params.country;
    const startOfLastWeek = moment().subtract(1, 'weeks').startOf('isoWeek').format('YYYY-MM-DD HH:mm:ss');
    const endOfLastWeek = moment().subtract(1, 'weeks').endOf('isoWeek').format('YYYY-MM-DD HH:mm:ss');
  
    const query = `
      SELECT *
      FROM LeaderBoard
      WHERE Country = '${country}' AND TimeStamp BETWEEN '${startOfLastWeek}' AND '${endOfLastWeek}'
      ORDER BY Score DESC
      LIMIT 200;
    `;
  
    db.query(query, (err, results) => {
      if (err) {
        console.error('Error executing query:', err);
        res.status(500).json({ error: 'Internal Server Error' });
        return;
      }
  
      res.json(results);
    });
  });

  

  app.get('/user-rank/:userId', (req, res) => {
    const userId = req.params.userId;
    console.log(userId);
  
    const query = `select count(*) from LeaderBoard where Score > (select Score from LeaderBoard where UID = '${userId}')`;
  
    db.query(query, (err, results) => {

      if (err) {
        console.error('Error executing query:', err);
        res.status(500).json({ error: 'Internal Server Error' });
        return;
      }
  
      if (results.length === 0) {
        res.status(404).json({ error: 'User not found' });
        return;
      }
      res.json({ rank: Object.values(results[0])[0]});

    });
  });



  let name = ['satish', 'vivek','abhishek','rohit','mohit','raj','robin','rakesh','rahul','aman','saurbh']
  let surname = ['kumar','pal','jha','tiwari','kohli','singh']
  let country = ['uk','in','pk','ch','us','ny','ck','mp','ap']

  console.log(name[8], surname[6], country[5]);

  function generateRandomName() {
    const nameArraySize = name.length;
    const surnameArraySize = surname.length;
    const indexOfName = Math.floor(Math.random() * nameArraySize);
    const indexOfSurname = Math.floor(Math.random() * surnameArraySize);
    return name[indexOfName] + "_" + surname[indexOfSurname];
  }

  function generateScore() {
    return Math.floor(Math.random() * 1000);
  }

  function generateCountry() {
    const countryArraySize = country.length;
    const indexOfCountry = Math.floor(Math.random() * countryArraySize);
    const countryName = country[indexOfCountry];
    return countryName;
  }

  function generateRandomDateTime() {
    const from = new Date(2023, 0, 1);
    const to =  new Date();
    return new Date(
      from.getTime() +
        Math.random() * (to.getTime() - from.getTime()),
    );
  }

function createData(range) {
  const values = [];
  for(let i=1;i<=range;i++){
    const val = []
    val.push(i);
    val.push(generateRandomName());
    val.push(generateScore());
    val.push(generateCountry());
    val.push(generateRandomDateTime());
    
    values.push(val);
  }
  console.log(values);
  return values;
}





  
