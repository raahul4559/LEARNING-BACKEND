import express from 'express';
import dotevn from 'dotenv'
import cors from 'cors'
import db from './utilis/db.js';
import cookieParser from 'cookie-parser';

// import all routes
import userRoutes from "./routes/user.routes.js"

dotevn.config()

const app = express();


app.use(cors({
  origin: process.env.BASE_URL,
  methods:['GET','POST','DELETE','OPTIONS'],
  allowedHeaders:['Content-Type','Authorization']
})
);

app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(cookieParser());

const port = process.env.PORT || 4000;

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.get('/rahul', (req,res)=>{
    res.send('Hello Rahul')
});

//connect to db
db();

//user routes
app.use("/api/v1/users",userRoutes)

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});