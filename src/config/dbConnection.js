const mongoose = require('mongoose');
mongoose.connect(process.env.DB_URI).then(()=> console.log('db bağlanıldı')).catch(err => console.log(err))