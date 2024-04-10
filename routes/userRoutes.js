const express = require('express')
const router = express.Router()
const User = require('../models/User')

const {jwtAuthMiddleware, generateToken} = require('../jwt')

//creating post method to save the data of new voter or user , 
//to database comming from frontend 
//signup root
router.post('/signup', async (req, res)=>{
     try {

          const data = req.body // assuming the request body contains the person data
     
          //create a new user document using the mongoose model
          const newUser = new User(data);

          //save the newUser data to database
          const response = await newUser.save() // if it return error then it will be thrown to catch block
          console.log('data saved successfully.....');

          const payload = {
               id: response.id
          }

          console.log(JSON.stringify(payload))

          const token = generateToken(payload);
          console.log("token is : ", token);

          res.status(200).json({response: response, token: token });
     }
     catch (error) {
          console.log(error);
          res.status(500).json({error: 'Internal Server Error'})
     }
})

//loging Route....
router.post('/login', async(req, res) => {
     try {
          //extract adharCardNumber and password from request body
          const {adharCardNumber, password} = req.body;
          const user = await User.findOne({adharCardNumber: adharCardNumber})

          //if user does not exist or passwrod does not match, return error
          if(!user || !(await user.comparePassword(password))){
               return res.status(401).json({error: 'Invalid username or password'})
          }
  
          //generate token
          const payload = {
               id: user.id,
          }
          const token = generateToken(payload);

          //return token as response
          res.json({token})

     } catch (error) {
          console.log(error);
          res.status(500).json({error: 'Internal Server Error'})
     }
})


//function to get the profile of registerd user/voter
router.get('/profile', jwtAuthMiddleware, async(req, res, next) => {
     try {
          const userData = req.user;
          //console.log("user data: ", userData)
          const userId = userData.id;
          const userprofile = await Person.findById(userId)
          
          res.status(200).json({userprofile})
//
     } catch (error) {
          console.error(error);
          res.status(500).json({error: 'Internal Server Error'});
     }
})


// in case user want to change the password
//to update the password user in database
router.put('/profile/password',jwtAuthMiddleware, async (req, res) => {
     try {
          const userId = req.user.id; //extract the id from token
          const {currentPassword, newPassword} = req.body // to get the current and new password entered by user

          //now check this user exist in our database or not
          const user = await User.findById(userId)
          
          //if user does not exist or passwrod does not match, return error
          if(!(await user.comparePassword(currentPassword))){
               return res.status(401).json({error: 'Invalid username or password'})
          }
       
          //Update the user's password
          user.password = newPassword;
          await user.save();

          console.log("password updated successfully.......")
          res.status(200).json({message: "Password updated...."})
          
     } catch (error) {
          console.log(error);
          res.status(500).json({error: "Internal server error"})
     }
})
//
module.exports = router

