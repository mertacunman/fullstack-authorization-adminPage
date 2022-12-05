const { body } = require('express-validator');

const validateNewUser = function(){
    return [
        body('email').trim().isEmail().withMessage('geçerli bir email olmalı.'),
        body('ad').isString().trim().isLength({min:3}).withMessage('Ad en az 3 karakter olabilir'),
        body('soyad').isString().trim().isLength({min:3}).withMessage('Ad en az 3 karakter olabilir'),
        body('sifre').trim().isLength({min:8}).withMessage('sifre en az 8 karakter olabilir.'),
        body('resifre').custom((value, { req })=>{
            if(value != req.body.sifre){
                throw new Error('Şifreler birbiriyle uyuşmuyor')
            }
            return true;
        })
    ]
}

const validateLogin = function(){
    return [
        body('email').trim().isEmail().withMessage('geçerli bir email olmalı.'),
        body('sifre').trim().isLength({min:8}).withMessage('sifre en az 8 karakter olabilir.'),
    ]
}

const validateForgotPassword = function(){
    return[
        body('email').trim().isEmail().withMessage('geçerli bir email olmalı.'),
    ]
  
}

const validateNewPassword = function(){
return [
    body('sifre').trim().isLength({min:8}).withMessage('sifre en az 8 karakter olabilir.'),
    body('resifre').custom((value, { req })=>{
        if(value != req.body.sifre){
            throw new Error('Şifreler birbiriyle uyuşmuyor')
        }
        return true;
    })
]
}


module.exports = {
    validateNewUser,
    validateLogin,
    validateForgotPassword,
    validateNewPassword,
}