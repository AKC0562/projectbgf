import mongoose from "mongoose";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';


const {Schema} = mongoose;

const userSchema = new Schema({

fullName: {
    type: String,
    required: [true,"Full name is required"],
    trim: true,
    minlength: 4,
    maxlength: 100
},
email:{
type: String,
required:[true,"Email is required"],
unique:true,
lowercase: true,
trim: true,
match:[/^S+@\S+\.\S+$/,"Invalid email address"]
},
phone:{
    type:String,
    required:true,
    unique:true,
    trim:true,
    match:[/^[6-9]\d{9}$/, "Invalid Phone Number"]
},
password:{
    type:String,
    required:[true,"Password is required"],
    minlength: 8,
    select: false
},
profileImage:{
    type:String,
    default:""
},
dob:{
    type: Date
},
gender:{
    type:String,
    enum:["male","female","others","prefer_not_to_say"],
    default: "prefer_not_to_say"
}

});