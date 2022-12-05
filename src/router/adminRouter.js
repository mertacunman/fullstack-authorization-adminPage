const router = require('express').Router();
const adminController = require('../controller/adminController')
const authOlmusMu = require('../middlewares/isAuthenticated');
const upload = require('../config/multerConfig');


router.get('/',authOlmusMu.oturumAcmissaDevamEt,adminController.yonetimBlankPage)
router.get('/profil',authOlmusMu.oturumAcmissaDevamEt,adminController.profilSayfasi)
router.post('/profil',upload.single('avatar'),authOlmusMu.oturumAcmissaDevamEt,adminController.profilSayfasiGuncelle)


module.exports = router