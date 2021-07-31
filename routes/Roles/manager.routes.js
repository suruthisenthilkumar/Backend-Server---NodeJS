const express= require('express');
const router = express.Router();
const manager = require("../../controllers/manager.controller");
const multer = require('multer');
const fs = require('fs');
const roleAuth = require('../../middlewares/roleAuth/RoleAuth');

const obj_manager = new manager();
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

router.post('/updaterfians',roleAuth(),obj_manager.updateRfiAns)
router.post('/changeRFIFile',roleAuth(),upload.any(),obj_manager.fileUpload)
router.post('/downloadRFIImage',roleAuth(),obj_manager.downloadRFIImage);



module.exports = router;