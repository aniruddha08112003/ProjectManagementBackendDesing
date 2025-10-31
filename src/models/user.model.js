import { Schema } from "mongoose";
import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new Schema({
  avatar: {
    type: {
      url: String,
      localPath: String,
    },
    default: {
      url: `https://placehold.co/200x200`,
      localPath:""
    },
  },
  username:{
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    index: true

  },
  email:{
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  fullName:{
    type: String,
    trim: true
  },
  password:{
    type: String,
    required: true,
    
  },
  isEmailVerified:{
    type: Boolean,
    default: false
  },
  refreshToken:{
    type: String,
  },
  forgotPasswordToken:{
    type: String,
  },
  forgotPasswordExpiry:{
    type: Date,
  },
  emailVerificationToken:{
    type: String,
  },
  emailVerificationExpiry:{
    type: Date,
  }
},{
    timestamps: true
});

userSchema.pre("save", async function(){
  if(this.isModified("password")){
    this.password = await bcrypt.hash(this.password, 10);
    next();
  }else{
    return next();
  }

})

userSchema.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password, this.password);
}


const User = mongoose.model("User", userSchema);

export default User;