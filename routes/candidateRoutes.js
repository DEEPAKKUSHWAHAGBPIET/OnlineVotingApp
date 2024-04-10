const express = require('express')
const router = express.Router()
const Candidate = require('../models/Candidate')
const User = require('../models/User')
const {jwtAuthMiddleware, generateToken} = require('../jwt')



const checkAdminRole = async (userId) => {
     try {
          const user = await User.findById(userId)
          return user.role === 'admin'
     } catch (error) {
          return false;
     }
}


//creating post method to save the candidate data, 
//to database comming from frontend 
//signup root for candidates
router.post('/', jwtAuthMiddleware, async (req, res)=>{
     try {
          
          if(! await checkAdminRole(req.user.id)){
               return res.status(403).json({message: 'User does not have admin role xxxxx'})
          }

          const data = req.body // assuming the request body contains the person data
     
          //create a new user document using the mongoose model
          const newCandidate = new Candidate(data);

          //save the newCandidate data to database
          const response = await newCandidate.save() // if it return error then it will be thrown to catch block
          console.log('data saved successfully.....');
          res.status(200).json({response: response});
     }
     catch (error) {
          console.log(error);
          res.status(500).json({error: 'Internal Server Error'})
     }
})


// in case candidate want to change or update the data
//to update the candidate data in database
router.put('/:candidateID',jwtAuthMiddleware, async (req, res) => {
     try {

          if(!checkAdminRole(req.user.id)){
               return res.status(403).json({message: 'User does not have admin role xxxxx'})
          }

          const candidateID = req.params.candidateID;
          const updatedCandidateData = req.body //update the data for candidate

          const response = await Candidate.findByIdAndUpdate(candidateID, updatedCandidateData, {
               new: true, // Return the updated document
               runValidators: true, // run Mongoose validatio
          })

          if(!response){
               return res.status(404).json({error: 'candidate not found'})
          }

          console.log('candidate data updated successfully');
          res.status(200).json(response)
          
     } catch (error) {
          console.log(error);
          res.status(500).json({error: "Internal server error"})
     }
})


//to delete the record from database
router.delete('/:id', jwtAuthMiddleware,async (req, res) => {
     try {
          
          //only admin can delete a candidate if not then return
          if(!checkAdminRole(req.user.id)){
               return res.status(403).json({message: 'User does not have admin role xxxxx'})
          }

          const candidateId = req.params.id;

          const response = await Candidate.findByIdAndDelete(candidateId)

          if(!response){
               return res.status(404).json({error: 'person not found'})
          }

          console.log('data successfully deleted....');
          res.status(200).json(response)
          
     } catch (error) {
          console.log(error);
          res.status(500).json({error: "Internal server error"})
     }
})

//lets start voting

router.post('/vote/:candidateID',jwtAuthMiddleware, async (req, res) => {
     //admin can not vote
     //only users can vote once

     const candidateID = req.params.candidateID;
     const userId = req.user.id;

     try {
          //find the candidate doucment with the specified candidateID
          const candidate = await Candidate.findById(candidateID)
          if(!candidate){
               return res.status(404).json({message: 'Candidate not found'});
          }

          //find the user
          const user = await User.findById(userId)
          if(!user){
               res.status(404).json({message: 'User does not exist'})
          }

          //if user already voted then reject the vote
          if(user.isVoted===true){
             res.status(400).json({message: 'You have already voted!!'})
          }

          if(user.role==='admin'){
               res.status(403).json({message: 'admin is not allowed to vote'})
          }
         
          //Update the candidate document to record the vote given to him by users
          candidate.votes.push({user: userId})
          candidate.voteCount++;
          await candidate.save()

          //update the user doucment so that he can't vote again
          user.isVoted = true;
          await user.save();

          res.status(200).json({message: 'vote is recorded successfully'})
     } catch (error) {
          console.log(error);
          res.status(500).json({error: "Internal server error"})
     }
})


//to get the vote count of candidates
router.get('/vote/count', async (req, res) => {
     try {

           //find all the candidate and sort them by votecount in descending order
           const candidates = await Candidate.find().sort({voteCount: 'desc'});

           //map the candidates to only return candidate name , party name, votecount
           
          const voteRecord = candidates.map((data) => {
               return {
                    party: data.party,
                    count: data.voteCount
               }
          })

          res.status(200).json(voteRecord)
     } catch (error) {
          console.log(error);
          res.status(500).json({error: "Internal server error"})
     }
})

//to get the list of candidates

router.get('/candidates', async (req, res) => {
     try {
          const candidate = await Candidate.find()
          if(!candidate){
               res.status(404).json({message: 'no candidate registered yet'})
          }
          res.status(202).json({candidate})
     } catch (error) {
          console.log(error);
          res.status(500).json({error: "Internal server error"})
     }
})
module.exports = router

