import getPrismaInstance from "../utils/PrismaClient.js";
import { renameSync } from 'fs';

export const addMessage = async (req, res, next) => {
  try {
    const prisma = getPrismaInstance();
    const { message, from, to } = req.body;
    const getUser = onlineUsers.get(to);
    if (message && from && to) {
      const newMessage = await prisma.message.create({
        data: {
          message,
          sender: { connect: { id: from } },
          receiver: { connect: { id: to } },
          messageStatus: getUser ? "delivered" : "sent",
        },
        include: { sender: true, receiver: true },
      });
      return res.status(201).send({ message: newMessage });
    }
    return res.status(400).send("form, to and message is required");
  } catch (err) {
    next(err);
  }
};

export const getMessages = async (req, res, next) => {
  try {
    const prisma = getPrismaInstance();
    const { from, to } = req.params;
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          {
            senderId: from,
            receiverId: to,
          },
          {
            senderId: to,
            receiverId: from,
          },
        ],
      },
      orderBy: {
        id: "asc",
      },
    });
    const unreadMessage = [];
    messages.forEach((message, index) => {
      if (message.messageStatus !== "read" && message.senderId === to) {
        (messages[index].messageStatus = "read"), unreadMessage.push(message.id);
      }
    });

    await prisma.message.updateMany({
        where:{
            id:{in:unreadMessage},
        },
        data:{
            messageStatus:"read",
        },
    });

    res.status(200).json({messages});
  } catch (err) {
    next(err);
  }
};

export const addImageMessage = async (req,res,next) => {
  try{
     if(req.file){
      const date = Date.now();
      let fileName = "uploads/images/" + date + req.file.originalname;
      renameSync(req.file.path,fileName);
      const prisma = getPrismaInstance();
      const {from,to} = req.query;

      if(from && to ){
        const message = await prisma.message.create({
          data:{
            sender: { connect: { id: from } },
            receiver: { connect: { id: to } },
            message:fileName,
            type:"image"
          }
        });
        return res.status(201).json({message});
      }
      return res.status(400).send("From, to is required");
     }
    return res.status(400).send("Image is required");
  }catch(err){
    next(err);
  }
}

export const addAudioMessage = async (req,res,next) => {
  try{
     if(req.file){
      const date = Date.now();
      let fileName = "uploads/recordings/" + date + req.file.originalname;
      renameSync(req.file.path,fileName);
      const prisma = getPrismaInstance();
      const {from,to} = req.query;

      if(from && to ){
        const message = await prisma.message.create({
          data:{
            sender: { connect: { id: from } },
            receiver: { connect: { id: to } },
            message:fileName,
            type:"audio"
          }
        });
        return res.status(201).json({message});
      }
      return res.status(400).send("From, to is required");
     }
    return res.status(400).send("Audio is required");
  }catch(err){
    next(err);
  }
}
