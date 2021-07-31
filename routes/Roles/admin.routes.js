const express= require('express');
const router = express.Router();
const admin = require("../../controllers/admin.controller");
const adminAuth = require('../../middlewares/roleAuth/adminAuth');

const admin_Obj = new admin();

router.post("/getQNS",admin_Obj.getRFIqns)
router.post("/updateQNS",admin_Obj.updateQns)
router.post("/addQNS",admin_Obj.addQNS);
router.post("/deleteQNS",admin_Obj.deleteQNS);
router.post("/configDetails",adminAuth(),admin_Obj.config_display);
router.post("/configCheck",adminAuth(),admin_Obj.config_display);
router.post("/configUpdate",adminAuth(),admin_Obj.config_display);
router.post("/getPHandPL",admin_Obj.getPHandPL);
router.post("/deleteUser",admin_Obj.deleteUser);
router.post("/createUser",admin_Obj.createUser);
router.post("/editUser",admin_Obj.editUser)

module.exports = router;