const express= require('express');
const router = express.Router();
const sme = require("../../controllers/sme.controller");


const obj_sme = new sme();

// router.post("/clientinfo",obj_sme.getBasicClientInfo_forTester);



module.exports = router;