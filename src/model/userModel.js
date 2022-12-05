const mongoose = require('mongoose');

const userScheama = mongoose.Schema({
    ad:{
        type:String,
        required:true,
        trim:true,
        maxLength:20,
        minLength:3,
    },
    soyad:{
        type:String,
        required:true,
        trim:true,
        maxLength:20,
        minLength:3,
    },
    email:{
        type:String,
        trim:true,
        required:true,
        unique:true
    },
    emailOnay:{
        type:Boolean,
        default:false,
    },
    profilePic:{
        type:String,
        default:'indir.png'
    },
    sifre:{
        type:String,
        required:true,
        trim:true,
    }
},{collection:'User',timestamps:true});


const UserModel = mongoose.model('user',userScheama);

module.exports = UserModel