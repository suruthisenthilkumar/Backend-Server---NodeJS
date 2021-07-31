const express= require('express');
const router = express.Router();
const user = require("../../controllers/user.controller");
const obj_user = new user();
const roleAuth = require('../../middlewares/roleAuth/RoleAuth');

router.get("/check",obj_user.user_check);
router.post("/clientinfo",roleAuth(),obj_user.getClientInfo);
router.post("/updateclientinfo",roleAuth(),obj_user.update_clientinfo);
router.post("/rfians",obj_user.getRfiAns);
router.post('/getProjects',roleAuth(),obj_user.getProjects);
router.post("/logout",obj_user.logout);
router.get("/getQns",obj_user.getRFIQns);


module.exports = router;
