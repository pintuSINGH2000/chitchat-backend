import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import AuthRoute from "./routes/AuthRoutes.js";
dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth",AuthRoute);

const server = app.listen(process.env.PORT,()=>{
    console.log(`server started onport ${process.env.PORT}`);
})