const passport = require('passport');
const localStrategy = require('passport-local').Strategy;
const User = require('../model/userModel')
const bcrypt = require('bcrypt');

module.exports = function(passport){
    passport.use(new localStrategy(
        {usernameField:'email',passwordField:'sifre'},
        async function(email,sifre,done){
            try{
            const _user = await User.findOne({email:email});
            if(!_user){
                return done(null,false,{type:'errorFlashMessage',message:'user bulunamadı'})
            }

            const compareSifre = await bcrypt.compare(sifre,_user.sifre)
            if(_user && compareSifre == false){
                return done(null,false,{type:'errorFlashMessage',message:'sifre dogru degil'});
            }

            if(_user && _user.emailOnay == false){
                return done(null,false,{type:'errorFlashMessage',message:'Lütfen mailinizi onaylayınız'})
            }

            return done(null,_user)
        
            }catch(err){
                return done(err)
            }
        }
    ))

    passport.serializeUser(function(user, cb) {
        cb(null, user.id);
    });

    passport.deserializeUser(function(id, cb) {
        User.findById(id, function (err, user) {
            if (err) { return cb(err); }
            cb(null, user);
        });
    });
}