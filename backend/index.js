const express=require('express');
const socketIO=require('socket.io');
const {connection}=require('./db')
const http=require('http');
const {userRouter}=require('./routes/user.routes');
const {auth}=require('./middleware/auth.middleware');
const cors=require('cors');


const app=express();
app.use(cors());
app.use(express.json());
app.use('/user',userRouter);
const server=http.createServer(app);
const io = socketIO(server);

const port=process.env.PORT||3000;



app.get('/',(req,res)=>{
  res.send("Hello world");
})


//connection start
let users={};

io.on("connection",(socket)=>{
  console.log(socket.id);
  socket.on("new-user-joined",(username)=>{
    users[socket.id]=username;
    console.log(users);
    socket.broadcast.emit('user-connected',username);
    io.emit("user-list",users);
  });

  socket.on("disconnect",()=>{
    console.log("client has disconnected")
    socket.broadcast.emit('user-disconnected',user=users[socket.id]);
    delete users[socket.id];
    io.emit("user-list",users);
  });

  socket.on('message',(data)=>{
    socket.broadcast.emit('message',{user:data.user,msg:data.msg});
  })
})


//connection end//

server.listen(port, async() => {
  try{
      await connection
      console.log("Connected to db");
      console.log(`Server is running at ${port}`);
     }
     catch(err){
      console.log(err);
     }
});