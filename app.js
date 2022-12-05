// express
const express = require('express');
const app = express();

const path = require('path');

// dotenv config
require('dotenv').config()

// db connection
require('./src/config/dbConnection')

// static dosyalar
app.use(express.static('public'))
app.use('/uploads',express.static(path.join(__dirname,'/src/uploads')))
// body parse
app.use(express.json());
app.use(express.urlencoded({extended:true}));

// ejs ayarları
const ejs = require('ejs');
var expressLayouts = require('express-ejs-layouts');
app.use(expressLayouts);
app.set('view engine', 'ejs');
app.set('views',path.join(__dirname,"./src/views"));

// session ayarları ve sessionları db ye kaydetme
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const store = new MongoDBStore({
    uri: process.env.DB_URI,
    collection: 'mySessions'
  });
app.use(session({
    //secret: process.env.SECRET,
    secret: process.env.SESSION_SECRET_KEY,
    resave: false,
    saveUninitialized: true,
    store: store,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 // Equals 1 day (1 day * 24 hr/1 day * 60 min/1 hr * 60 sec/1 min * 1000 ms / 1 sec)
    },
}));

// flash messages
const flash = require('connect-flash');
app.use(flash());
app.use((req,res,next)=>{
    res.locals.hatalar = req.flash('error'),
    res.locals.errorFlashMessage = req.flash('errorFlashMessage')
    res.locals.basarili = req.flash('success')
    next();
})
// passport gerekli middleware ler
const passport = require('passport');
app.use(passport.initialize());
app.use(passport.session());

// Routerların getirilmesi
const authRouter = require('./src/router/authRouter');
const adminRouter = require('./src/router/adminRouter')

app.use('/',authRouter);
app.use('/yonetim',adminRouter)

app.use('*',(req,res,next)=>{
    res.render('404sayfa',{layout:'./layout/404.ejs'})
})



app.listen(process.env.PORT,()=>{
    console.log('server dinliyor.');
})