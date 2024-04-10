const mongoose = require('mongoose')
const bcrypt = require('bcrypt')



//define the user schema
const userSchema = new mongoose.Schema({
     name:{
          type: String,
          required: true
     },
     age:{
          type: Number,
          required: true
     },
     email:{
          type: String
     },
     mobile:{
        type: String,
     },
     address: {
          type: String,
          required: true
     },
     adharCardNumber: {
          type: Number,
          required: true,
          unique: true
     },
     password: {
          type: String,
          required: true
     },
     role:{
          type: String,
          enum:['voter', 'admin'],
          default: 'voter'
     },
     isVoted: {
          type: Boolean,
          default: false
     }
});


userSchema.pre('save', async function(next){
     const person = this;

     //Hash the password only if it has been modified(or is new)
     if(!person.isModified('password')){
          return next();
     }

     //we will enter try catch block only if password is modified
     try {
          //salt ko generate krten hain phle
          const salt = await bcrypt.genSalt(10)

          //hash password ko generate krten hai abb
          const hashedPassword = await bcrypt.hash(person.password, salt)

          //now override the plain password with the hashed one
          person.password = hashedPassword

          next();
     } catch (error) {
          return next(error)
     }
})

userSchema.methods.comparePassword = async function(candidatePassword){
     try {
          //we will use bcrypt to compare the provided password with the hash password
          const isMatch = await bcrypt.compare(candidatePassword, this.password)
          return isMatch;

     } catch (error) {
          throw error;
     }
}


const User = mongoose.model('User', userSchema)
module.exports = User;