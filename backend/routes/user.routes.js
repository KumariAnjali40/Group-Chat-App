const express=require('express');
const multer=require('multer');
const {BlackListModel}=require('../schema/blacklist.models')
const firebase = require("firebase-admin"); // firebase-admin
const serviceAccount = require("../fileuploade-8d375-firebase-adminsdk-j7g10-cd74b7d26e.json"); // file-path for admin details

firebase.initializeApp({credential:firebase.credential.cert(serviceAccount),storageBucket:"gs://fileuploade-8d375.appspot.com"});


const {UserModel}=require('../schema/user.model')
const bcrypt=require('bcrypt');
const jwt=require('jsonwebtoken')


const userRouter=express.Router();

userRouter.post('/register',async(req,res)=>{
    const {name,email,pass}=req.body
    try{
        if (!(name && email && pass)) {
            return res.status(400).json({ msg: "Empty input field" });
        } 

        const user = await UserModel.findOne({ email });

        if (user) {
            return res.status(400).json({ msg: "Email already exists" });
        }

        bcrypt.hash(pass,3,async(err,hash)=>{
            if(err){
                res.status(200).json({err});
            }else{
               const user=new UserModel({name,email,pass:hash})
               await user.save();
               res.status(200).json({msg:"new user has been register",user})
            }
        })
    }
    catch(err){
       res.status(400).json({err});
    }
})


userRouter.post('/login',async(req,res)=>{
    const {email,pass}=req.body;
    try{
          const user=await UserModel.findOne({email});
           if(user){
            bcrypt.compare(pass,user.pass,(err,result)=>{
                if(result){
                    const access_token=jwt.sign({userID:user._id,user:user.name},"masai");
                    res.status(200).json({msg:"Login successfull",access_token,user})
                }else{
                    res.status(200).json({msg:"Please Register,Wrong Credentials"})
                }
            })
           }else{
            res.status(200).json({msg:"Please Register,Wrong Credentials"})
            // res.status(200).json({error:err});
           }
    }
    catch(err){
        res.status(400).send(err);
    }
})



//now apply  multer
const storage = multer.memoryStorage();
const upload = multer({storage:storage})

userRouter.patch('/profile/:userID', upload.single('image'), async (req, res) => {
    try {
        const bucket = firebase.storage().bucket();
        const file = bucket.file(`${req.params.userID}.jpg`);

        const metadata = {
            contentType: req.file.mimetype,
        };

        await file.save(req.file.buffer, { metadata });
        const [url] = await file.getSignedUrl({
            action: 'read',
            expires: '01-01-2030', // Set an expiration date or period as needed
        }); // url for the uploaded image
        
        await UserModel.findByIdAndUpdate({_id:`${req.params.userID}`},{image:url});
        res.status(200).json({ message: 'File uploaded successfully',updated:url});
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to upload file' });
    }
});

//get
userRouter.get("/profile/:userID",async(req,res)=>{
    try {
        let {userID} = req.params
        let user = await UserModel.findOne({_id:userID});
        if(user){
            res.status(200).json({image:user.image|| "https://firebasestorage.googleapis.com/v0/b/coinsquare-8dc2e.appspot.com/o/default.jpg?alt=media&token=fa163076-3ed8-48b2-875b-3b370c66f251"})
        } // If no profile picture then default would be sent 
        else{
            res.status(404).json({Error:"User Not Found"})
        }
    } catch (error) {
        res.status(500).json({Error:error})
    }
})

//logout
//fucntionality
userRouter.get('/logout',async(req,res)=>{
    const access_token=req.headers.authorization?.split(" ")[1];
    try{
        const blacklist=new BlackListModel({access_token:access_token});
        await blacklist.save();
        res.status(200).json({msg:"Hey! user you are logout"});
    }
    catch(err){
        res.status(400).json({err:err});
    }
})



module.exports={
    userRouter,
}