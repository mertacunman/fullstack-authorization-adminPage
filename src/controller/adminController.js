const User = require('../model/userModel')
const yonetimBlankPage = (req,res,next)=>{
    res.render('adminBlankPage',{layout:'../views/layout/adminLayout.ejs'});
}

const profilSayfasi = (req,res,next)=>{
    res.render('profil',{user:req.user,layout:'../views/layout/adminLayout.ejs'});
}

const profilSayfasiGuncelle = async (req,res,next)=>{
    try{
        const guncelBilgiler = {
            ad:req.body.ad,
            soyad:req.body.soyad
        }
    
        if(req.file){
            guncelBilgiler.profilePic = req.file.filename
        }
    
        console.log(guncelBilgiler);
        await User.findByIdAndUpdate(req.user.id,{ad:guncelBilgiler.ad,soyad:guncelBilgiler.soyad,profilePic:guncelBilgiler.profilePic})
    
    
        res.redirect('/yonetim/profil')
    }catch(err){
        console.log(err);
    }
    
}

module.exports={
    yonetimBlankPage,
    profilSayfasi,
    profilSayfasiGuncelle,
}