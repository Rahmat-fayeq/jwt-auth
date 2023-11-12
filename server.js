require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/dbConnection');

 const port = process.env.PORT || 5000;
 connectDB();   
 const app = express();
  app.use(express.json()); 
  app.use(cookieParser());
  app.use('/auth',require('./routes/auth'));

  app.listen(port,()=>{
    console.log(`Server started & listening on ${port}`);
  });