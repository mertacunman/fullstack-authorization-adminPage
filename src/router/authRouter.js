const router = require('express').Router();
const authController = require('../controller/authController')
const validationMid = require('../middlewares/validationMid')
const passport = require('passport');
const authenticateMiddleWare = require('../middlewares/isAuthenticated')

router.get('/login',authenticateMiddleWare.oturumAcikDegilseDevamEt,authController.loginGET);
router.post('/login',authenticateMiddleWare.oturumAcikDegilseDevamEt,validationMid.validateLogin(),authController.loginPOST)

router.get('/register',authenticateMiddleWare.oturumAcikDegilseDevamEt,authController.registerGET);
router.post('/register',authenticateMiddleWare.oturumAcikDegilseDevamEt,validationMid.validateNewUser(),authController.registerPOST)

router.get('/forgot-password',authenticateMiddleWare.oturumAcikDegilseDevamEt,authController.forgotPassGET);
router.post('/forgot-password',authenticateMiddleWare.oturumAcikDegilseDevamEt,validationMid.validateForgotPassword(),authController.forgotPassPOST,)

router.get('/verify',authenticateMiddleWare.oturumAcikDegilseDevamEt,authController.verifyEmail)

router.get('/reset-password/:token/:id',authenticateMiddleWare.oturumAcikDegilseDevamEt,authController.resetPasswordSayfasiniGoster)
router.post('/reset-password',authenticateMiddleWare.oturumAcikDegilseDevamEt,validationMid.validateNewPassword(),authController.resetPassword)

router.get('/logout',authenticateMiddleWare.oturumAcmissaDevamEt,authController.logout)

module.exports = router