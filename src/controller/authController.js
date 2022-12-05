const User = require('../model/userModel');
const { validationResult } = require('express-validator');
const passport = require('passport');
require('../config/passport-local')(passport);
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');


const loginGET = (req,res,next)=>{
    res.render('login',{layout:'../views/layout/authLayout.ejs'})
}
const loginPOST = (req,res,next)=>{
    const errors = validationResult(req);
    console.log(errors);
    if(!errors.isEmpty()){
      req.flash('error',errors.array());
      res.redirect('/login')
    }else{
      passport.authenticate('local',{successRedirect:'/yonetim/profil',failureRedirect:'/login',failureFlash:true})(req,res,next);
    }
}


const registerGET = (req,res,next)=>{
    res.render('register',{layout:'../views/layout/authLayout.ejs'})
}
const registerPOST = async (req,res,next)=>{
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      req.flash('error',errors.array())
      res.redirect('/register')
    }
    try{

        const _user = await User.findOne({email:req.body.email});
        if(_user && _user.emailOnay == true){
            
            req.flash('error',[{msg:'Bu email daha önce kayıt olmuş'}])
            return res.redirect('/register')
        }

        if(_user && _user.emailOnay == false){
            await User.findOneAndRemove({email:_user.email});
        }
        const yeniUser = await new User({
            email:req.body.email,
            sifre: await bcrypt.hash(req.body.sifre,10),
            ad:req.body.ad,
            soyad:req.body.soyad
        })
        await yeniUser.save();
        req.flash('success',[{msg:'lütfen mailinizi kontrol ediniz.'}])

        // jwt işlemleri
        const jwtBilgiler = {
            id:yeniUser.id,
            email:yeniUser.email
        };

        const jsonwebtoken = jwt.sign(jwtBilgiler,process.env.JWT_SECRET_KEY_FOR_REGISTER);
        const emailOnaylatmaURL = `${process.env.HOSTNAME}/verify?jwt=${jsonwebtoken}`;
        
        //mail yollama işlemleri
        const sendmail = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
                user: process.env.GMAIL_USERNAME, // generated ethereal user
                pass: process.env.GMAIL_SIFRE_SENDMAILER // generated ethereal password
              },
        }).sendMail({
            from: ' Mert Acunman <mertacunman@gmail..com>', // sender address
            to: req.body.email,
            subject: 'Mail onaylama linki', // Subject line
            text: `Lütfen mailinizi onaylamak için linke tıklayiniz.${emailOnaylatmaURL}`
        })
        
        res.redirect('/login')


    }catch(err){
        console.log(err);
    }
}



const forgotPassGET = (req,res,next)=>{
    res.render('forgot-password',{layout:'../views/layout/authLayout.ejs'})
}
const forgotPassPOST = async (req,res,next)=>{
    try{
        // ilk olarak mail doğru formatta mı diye validationMid ile kontrol ettik 
        const errors = validationResult(req);
        console.log(errors);
        if(!errors.isEmpty()){
        req.flash('error',errors.array());
        return res.redirect('/login')
        }
     const _email = req.body.email;
     const arananUser = await User.findOne({email:_email});
     // Şifre yenilenmek istenen mail db de bulundu. örneğin 
     if(arananUser){
        const jwtBilgileri = {
            mail:arananUser.mail,
            id:arananUser.id
        }
        //sonra sadece şu anki şifreyle bağlantılı olucak şekilde bir secretKey oluşturuldu. Yani bu şifre değiştirme işlemleri bittiği zaman
        // bir daha bu linki geçerli olmıcak çünkü secretKeye şuan bu emailli userın şu anki şifresi konuldu.
        secretKey = process.env.JWT_SECRET_KEY_FOR_FORGOTPASSWORD+'-'+arananUser.sifre
        const token = jwt.sign(jwtBilgileri,secretKey);
        const url = process.env.HOSTNAME+'/reset-password/'+token+'/'+arananUser.id

        const sendmail = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
                user: process.env.GMAIL_USERNAME, // generated ethereal user
                pass: process.env.GMAIL_SIFRE_SENDMAILER // generated ethereal password
              },
        }).sendMail({
            from: ' Mert Acunman <mertacunman@gmail..com>', // sender address
            to: req.body.email,
            subject: 'Şifre yenileme linki', // Subject line
            text: `Lütfen şifrenizi yenilemek için tıklayın.${url}`
        })

        req.flash('success',[{msg:'Mail kutunuzu kontrol ediniz.'}])
        res.redirect('/login')
        
     }else{
        // fake mesaj
        req.flash('success',[{msg:'Mailinizi kontrol ediniz.'}])
        res.redirect('/login')
     }


    }catch(err){
        console.log(err);
    }
   
}
    
const resetPasswordSayfasiniGoster = async (req,res,next)=>{
    try{
        const token = req.params.token
        const id = req.params.id
        
        // yolladıgımız mailden gelen id değerine göre db de userı sorgulattık ve şifresine eriştik bu sayede tokeni verify edicez. Eğer
        // şifre değiştikten sonra tekrar bu linke tıklanıp şifre değiştirmek istenirse başarılı olamıcaktır çünkü artık secretKeyimizdeki 
        // bir önceki şifreyi koydugumuz alan bulunamıcaktır yanlış olucaktır.
        const _user = await User.findById(id);
        if(_user){
        secretKey = process.env.JWT_SECRET_KEY_FOR_FORGOTPASSWORD+'-'+_user.sifre;
        jwt.verify(token,secretKey,function(e,decoded){
            if(e){
                req.flash('error',[{msg:'Link bozulmuş veya süresi geçmiş lütfen yeniden mail gönderiniz'}]);
                res.redirect('/login')
            }else{
                // bir sonraki adımda bir hata çıkarsa diye id ve token değerlerine de forma gönderiyoruz ki body den erişilebilsin.
                res.render('sifre-yenileme',{id,token,layout:'../views/layout/authLayout.ejs'})
            }
        })
        }else{
            req.flash('error',[{msg:'Link bozulmuş veya süresi geçmiş lütfen yeniden mail gönderiniz'}]);
            res.redirect('/login')
        }
    }catch(err){
        console.log(err);
    }
    
}

const resetPassword = async (req,res,next)=>{
    try{
        const id = req.body.id;
        const token = req.body.token;

        
        const errors = validationResult(req);
        if(!errors.isEmpty()){
            // öncelikle yeni şifre de validation kuralları uygulanmış mı diye kontrol ettik eğer bir hata varsa bu sayfayı post etmek
            // istediğimizde /reset-password rotasına gideceği için ve id ve token değerlerimiz kaybolacağı için bir önceki adımda bu sayfanın
            // body kısmına token ve id değerlerini sakladık
        req.flash('error',errors.array());
        return res.redirect(`/reset-password/${token}/${id}`)
        }
        // formda gizlediğimiz id değeri elle değiştirilirse diye güvenlik açığı kapatmak için tekrar verify ediyoruz.
        // Yani body ye sakladıgımız id değeri değiştirilirse başka bi kullanıcının id değeri girilirse post ettiğimiz anda o kullanıcının şifresi değişicek.

        const _user = await User.findById(req.body.id);
        const secretKey = process.env.JWT_SECRET_KEY_FOR_FORGOTPASSWORD+'-'+_user.sifre;
        jwt.verify(token,secretKey,async function(e,decoded){
            if(e){
                req.flash('error',[{msg:'Lütfen yeni bir link gönderiniz.'}])
                res.redirect('/login')
            }else{
                const yeniSifre = req.body.sifre;
                const yeniSifreHash = await bcrypt.hash(yeniSifre,10);
                await User.findOneAndUpdate({id:id},{sifre:yeniSifreHash});

                req.flash('success',[{msg:'user kayıt başarılı'}]);
                res.redirect('/login')
            }
        })
    }catch(err){
        console.log(err);
    }
}
   



const verifyEmail = async (req,res,next)=>{
    try{
    const jsonwebtoken = req.query.jwt;
    if(jsonwebtoken){
       const _user = jwt.verify(jsonwebtoken,process.env.JWT_SECRET_KEY_FOR_REGISTER)
       await User.findByIdAndUpdate(_user.id,{emailOnay:true});
       req.flash('success',[{msg:'Kayit basarili. Giriş yapabilirsiniz'}])
       res.redirect('/login')
    }else{
        // verify rotasına query olarak jwt gelmediği her durumda login sayfasına geri yönlendirir
       res.redirect('/login')
    }
    }catch(err){
        console.log(err.toString());
        req.flash('error',[{msg:err.toString()}])
        res.redirect('/login')
    }
}

const logout = (req,res,next)=>{
    req.logout(function(err) {
        if (err) { return next(err); }
      });
      req.session.destroy((error)=>{
        res.clearCookie('connect-sid');
        res.render('login',{layout:'../views/layout/authLayout.ejs',basarili:[{msg:'Cikis Basariyla gerçekleşti.'}]})
      })
}


module.exports = {
    loginGET,
    registerGET,
    forgotPassGET,
    loginPOST,
    registerPOST,
    forgotPassPOST,
    verifyEmail,
    resetPasswordSayfasiniGoster,
    resetPassword,
    logout

}