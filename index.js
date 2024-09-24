import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import AuthRoute from "./routes/AuthRoutes.js";
import MessageRoute from "./routes/MessageRoutes.js";
import  { Server } from 'socket.io';

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth",AuthRoute);
app.use("/api/message",MessageRoute);

const server = app.listen(process.env.PORT,()=>{
    console.log(`server started onport ${process.env.PORT}`);
})

const io = new Server(server,{
    cors:{
        origin:"http://localhost:3000",
    }
})

global.onlineUsers = new Map();

io.on("connection",(socket) => {
   global.chatSocket = socket;
   socket.on("add-user",(userId)=>{
    onlineUsers.set(userId,socket.id);
   })
   socket.on("send-msg",(data)=>{
    const sendUserSocket = onlineUsers.get(data.to);
    if(sendUserSocket){
        socket.to(sendUserSocket).emit("msg-receive",{
            from: data.from,
            message:data.message,
        })
    }
   })
})
