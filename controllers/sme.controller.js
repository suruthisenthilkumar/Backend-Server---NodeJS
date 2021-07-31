const db = require("../models");
const {sequelize} = require('../models/index');
const {
    GET_PROJECT_DETAILS_SME,
    GET_CLIENT_INFORMATION_SME
    } = require('../../query');

const Mailer = require('../services/mailerClass')

class SME extends Mailer{



}
module.exports=SME ;