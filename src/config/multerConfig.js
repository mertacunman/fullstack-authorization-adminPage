const multer = require('multer');
const path = require('path')
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, path.join(__dirname,'../uploads'))
    },
    filename: function (req, file, cb) {
      const userEmail = req.user.email
      cb(null, userEmail+path.extname(file.originalname));
    }
  })

  const FileFilter = function (req, file, cb){
    const ext = path.extname(file.originalname);
    if(ext !== '.png' && ext !== '.jpg' &&  ext !== '.jpeg') {
        return cb(null,false)
    }
    cb(null, true);
  }

const multerConfig = multer({storage:storage,fileFilter:FileFilter});

module.exports = multerConfig
