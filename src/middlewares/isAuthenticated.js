const oturumAcmissaDevamEt = (req,res,next)=>{

    if(req.isAuthenticated()){
        next()
    }else{
        req.flash('error',[{msg:'Lütfen oturum aciniz'}]);
        res.redirect('/login')
    }

}

const oturumAcikDegilseDevamEt = (req,res,next)=>{
   if(req.isAuthenticated()){
    res.redirect('/yonetim')
   }else{
    next();
   }
}

module.exports = {
    oturumAcmissaDevamEt,
    oturumAcikDegilseDevamEt,
}