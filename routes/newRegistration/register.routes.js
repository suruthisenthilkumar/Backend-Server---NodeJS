const register = require("../../controllers/register.controller");
var router = require("express").Router();
const multer = require('multer');
const fs = require('fs');

  
var dir = '../rfi_fileUploads/';

if (!fs.existsSync(dir)){
  fs.mkdirSync(dir);
  console.log('Created Directory if it does not exist');
}


var storage = multer.diskStorage({
    destination:function(req,file,cb){
      var dir_report = dir+req.body.reqid ;
      if (!fs.existsSync(dir_report)){
        fs.mkdirSync(dir_report);
        console.log('Created Directory if it does not exist');
    }
      cb(null,dir_report)
    },
    filename: function(req,file,cb){
      cb(null,file.originalname)
    }
  })

var upload = multer({storage: storage});


router.post("/check",register.check);

router.post("/newManager",register.create);
  
router.post("/file",upload.any(),register.fileUpload);

module.exports=router;