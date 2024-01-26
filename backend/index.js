const express=require('express');
const socketIO=require('socket.io');
const {connection}=require('./db')
const http=require('http');


const app=express();
app.use(express.json());
const server=http.createServer(app);
const io = socketIO(server);

const port=process.env.PORT||3000;

app.get('/',(req,res)=>{
  res.send("Hello world");
})


//connection start
io.on("connection",(socket)=>{
  console.log(socket.id);

  socket.on("new_user",()=>{
    console.log("hii");

    socket.emit("user_details","hello")
})

  socket.on("disconnect",()=>{
    console.log("client has disconnected")
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