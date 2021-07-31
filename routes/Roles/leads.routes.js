const express= require('express');
const router = express.Router();
const leads = require("../../controllers/leads.controller");
const roleAuth = require('../../middlewares/roleAuth/RoleAuth');

const obj_lead = new leads();

router.post("/displaySMEinfo",roleAuth(),obj_lead.getAllSMEInfo);
router.post("/updateprojectstatus",roleAuth(),obj_lead.updateProjectStatus);
router.post("/allSME",roleAuth(),obj_lead.getAllSME);
router.post("/assignSME",roleAuth(),obj_lead.assignSME);
router.post('/signoff',roleAuth(),obj_lead.signoff);
router.post("/createTester",roleAuth(),obj_lead.createTester);
router.post("/deleteTester",roleAuth(),obj_lead.deleteTester)
module.exports = router;