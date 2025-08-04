const express = require('express');
const dotenv = require('dotenv');

const app = express();
dotenv.config();

const connectDb = require('./config/db.js');
const port  = process.env.PORT || 5000 ; 

 connectDb();

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});  
