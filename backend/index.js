const express=require('express');
const mongoose=require('mongoose');
const socketIO=require('socket.io');
const jwt=require('jsonwebtoken');
const {UserModel}=require('./schema/user.model')
const {connection}=require('./db');
const http=require('http');
const {userRouter}=require('./routes/user.routes');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
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

//github start
app.get('/auth/github',async(req,res)=>{
  const {code}=req.query;
  console.log(code);
 const token_response= await fetch("https://github.com/login/oauth/access_token",{
      method:"POST",
      headers:{
        Accept:"application/json",
      "content-type":"application/json"
      },
      body:JSON.stringify({
          client_id:"1c5423b8349237604119",
          client_secret:"6ac4a4f083d43e9bee62a3dfcfd8416d14dc5143",
          code:code
      })
  })
  .then((res)=>res.json())
  console.log(token_response);
  const access_token=token_response.access_token
  res.send("code is:"+code);

  const githubUserResponse =await fetch("https://api.github.com/user",{
      headers:{
          Authorization: `Bearer ${access_token}`
      }
  })
  const githubUser = await githubUserResponse.json();
  console.log(githubUser);

  // const userId = String(githubUser.id);
  const user = await UserModel.findOneAndUpdate(
      { name: githubUser.login },
      {
          $set: {
              name: githubUser.login,
              image:githubUser.avatar_url,
          },
      },
      { upsert: true, new: true }
  );

  console.log(user);

  const token = jwt.sign({ userID: user._id }, "Anjali");

  // res.json({ token });
  console.log(token);
  // res.send(token);
  
 
});




//github end


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