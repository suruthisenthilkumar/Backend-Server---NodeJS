const db = require("../models");
const { sequelize } = require('../models/index');

const performance_ans = db.performance_ans;

const { CREATE_CLIENT, CREATE_CLIENT_DETAILS, GET_ID_FROM_CLIENTS, CHECK_USER, UPDATE_RFI_ANS, GET_PORTAL_INFO, ADD_PORTAL_INFO, POPULATE_ANS_TABLE } = require('../../query');
const randomstring = require('randomstring');

const Mailer = require('../services/mailerClass')
var requester = require('request');

const ldapConnection = require("../services/ldapConnection");
var ldapConn = new ldapConnection();

var generate_request_id = function () {
  var request_id = randomstring.generate({
    length: 6,
    charset: 'numeric'
  })
  return request_id;
};

exports.check = async (req, response) => {
  if (!req.body) {
    response.status(400).send({
      message: "Content can not be empty!"
    });
    return;
  }
  try {
    console.log("Checking user");
    console.log(req.body)
    var user_email = req.body.email;
    const email = user_email.toLowerCase().trim();
    var location = req.body.location;
    await ldapConn.ldap_search(req, response, email, location)
      .then(async res => {
        console.log('in res');
        console.log(res);
        let resTosend = res;
        var params = [email];
        await sequelize.query(GET_PORTAL_INFO, { bind: params }).then(res => {
          console.log(res);
          if (res[0] != '') {
            if (res[0][0].portal.includes('gpac')) {
              response.status(200).send({ response: "User already exists with the portal." });
            }
          } else {
            response.status(200).send({ response: "New User", user: resTosend });
          }
        })
      })
      .catch(ex => {
        console.log(ex);
        response.status(400).send({ error: ex.error });
      })

  } catch (e) {
    console.log(e);
    //  logger.error({Message:e});
    response.status(500).send({ error: e });
  }
};

exports.create = async (req, response) => {
  if (!req.body) {
    response.status(400).send({
      message: "Content can not be empty!"
    });
    return;
  }
  try {
    console.log('Create Client');
    console.log(req.body.technical)
    var { user, Clientname, Rqstername, Prjname, Clusterhead, geography, Dlt2, JOstatus, projectType, JOvalue, symbol, newJOvalue, commstatus } = req.body.prsnl;
    const user_email = user;
    const email = user_email.toLowerCase().trim();
    const client_name = Clientname;
    const project_name = Prjname;
    const requester_name = Rqstername;
    const RFIUpdate = 'false';

    const directSubmission = req.body.directSubmission;

    var currencyFormat = `base=${symbol}`;
    const currencyConversionUrl = `https://api.exchangeratesapi.io/api/latest?${currencyFormat}&symbols=USD`
    console.log(currencyConversionUrl);

    await requester(currencyConversionUrl, async function (error, respon, body) {
      if (!error && response.statusCode == 200) {
        console.log('in body')
        console.log(JSON.parse(body).rates.USD);
        const currency_rates = JSON.parse(body).rates.USD;
        newJOvalue = (currency_rates * JOvalue).toFixed(2);
      }
      var param1 = [email];
      await sequelize
        .query(GET_PORTAL_INFO, { bind: param1 })
        .then(async res => {
          console.log("response of create client basic details")
          console.log(res[0][0])
          if (res[0][0] === undefined) {
            console.log("user does not exist")
            var params = [email, client_name, Clusterhead, geography, Dlt2, 'gpac']
            await sequelize
              .query(CREATE_CLIENT, { bind: params })
              .then(res => {
                console.log("created client basic details")
                console.log(res)
              })
              .catch(e => {
                console.log("error of create client basic details")
                console.log(e.stack)
              })
          }
          else if (res[0][0].portal === 'gsac') {
            var params = [email];
            await sequelize
              .query(ADD_PORTAL_INFO, { bind: params })
              .then(res => { console.log("success") })
          }
          else {
            console.log("User already exists with this portal")
          }
        })
        .catch(e => {
          console.log(e.stack)
          console.log("error while getting portal info from client basic details")
        })

      var req_prj = project_name.substr(0, 3).toUpperCase();
      var request_id = 'VL_' + req_prj + '_' + generate_request_id();
      console.log('request_id')
      console.log(request_id);
      var param2 = [email]
      await sequelize
        .query(GET_ID_FROM_CLIENTS, { bind: param2 })
        .then(
          async res => {
            console.log(res[0][0].id)
            var id = res[0][0].id;
            var params = [request_id, requester_name, project_name, JOstatus, JOvalue, newJOvalue, symbol, commstatus, projectType, id, 'gpac', directSubmission]
            await sequelize
              .query(CREATE_CLIENT_DETAILS, { bind: params })
              .then(result => {
                console.log(result)
                // response.status(200).send({RequestID:request_id})
              })
              .catch(e => {
                console.log("error of filing client details")
                console.log(e.stack)
              })
          })
        .catch(e => {
          console.log("error of id of client and fill client")
          console.log(e.stack)
        })
      rfi_update(req, response, request_id, email, requester_name, project_name, client_name, directSubmission, RFIUpdate);
    })
  } catch (e) {
    console.log(e);
    response.status(500).send({ error: e });
  }
};
rfi_update = async function (request, response, request_id, email, requester_name, project_name, client_name, directSubmission, RFIUpdate) {
  let answers = request.body.answers;
  let mainParam = [];
 
  console.log(mainParam)
  console.log(mainParam.length)
  if (RFIUpdate === 'false') {
    await answers.forEach(ans => {
        mainParam.push({ request_id: request_id, question_id: ans.id, answers: ans.value });
    });

    await performance_ans.bulkCreate(mainParam, { returning: false, individualHooks: true }).then(res => {
      console.log("Success");
      SendMailAfterUpdate(request, response, email, client_name, request_id, requester_name, project_name, directSubmission, RFIUpdate)
    }).catch(err => {
      console.log(err);
      response.status(400).send({ error: "Error in updating RFI details" })
    })
  } if (RFIUpdate === 'true') {
    await answers.forEach(ans => {
      let answerval = JSON.stringify(ans.value);
      if (answerval.includes("entryValue"))
        mainParam.push({ request_id: request_id, question_id: ans.id, answers: answerval });
      else
        mainParam.push({ request_id: request_id, question_id: ans.id, answers: ans.value });
    });

    await performance_ans.bulkCreate(mainParam, {
      updateOnDuplicate: ['answers']
    }).then(res => {
      console.log(res);
      SendMailAfterUpdate(request, response, email, client_name, request_id, requester_name, project_name, directSubmission, RFIUpdate)
      
    }).catch(err => {
      console.log("inherrr");
      response.status(400).send({ error: "Error in updating RFI answers" })
      console.log(err)
    })
  }

}

var SendMailAfterUpdate = function (request, response, email, client_name, request_id, requester_name, project_name, directSubmission, RFIUpdate) {
  var mailer_obj = new Mailer();

  if (RFIUpdate === 'false') {
    const subject = 'Welcome to GPAC';
    const content = `<h1>Hi ${client_name},</h1><p>Welcome to GPAC! </p><p>You can now login to GPAC using your email: ${email}. Please note your Request ID to view the status of your request on the portal. If you have not filled in the RFI details during registration you can update them after login, by clicking on the edit icon under the 'RFI Tab'</p><p> REQUEST ID:<b> ${request_id}</b></p><p>Regards,<br>GPAC Team</p>`;
    const res_to_send = { Message: "You have successfully registered! Please check your mail for further details.", RequestID: request_id };
    const subject_2 = 'GPAC User Alert!';
    var content_2 = '';
    if (directSubmission === 'true') {
      content_2 = `<h1>Hi,</h1> <p>Please note that you have a new user in the GPAC Portal with the following details:</p><p>User: ${client_name}<br> Requester Name: ${requester_name}<br> Request ID: ${request_id} <br> Project Name: ${project_name}.</p><p> Please note that the user has not uploaded any RFI information and you will be notified via mail when he/she does so.</p><p>Regards, <br>GPAC Team</p>`;
    }
    else {
      content_2 = `<h1>Hi,</h1> <p>Please note that you have a new user in the GPAC Portal with the following details:</p><p>User: ${client_name}<br> Requester Name: ${requester_name}<br> Request ID: ${request_id} <br> Project Name: ${project_name}.</p><p> Please note that the user has uploaded RFI information.</p><p>Please log in to view.</p><p>Regards, <br>GPAC Team</p>`;
    }
    mailer_obj.sendMail(response, email, subject, content, res_to_send, subject_2, content_2);
  }
  if (RFIUpdate === 'true') {
    const subject = `RFI Details Updated for ${project_name}`;
    const content = `<h1>Hi ${client_name},</h1><p> The RFI Details for your Request: <b> ${request_id}</b> has been updated and will be reviewed shortly.</p><p>Regards,<br>GPAC Team</p>`;
    const res_to_send = { Message: "Answers have been updated successfully!!" };
    const subject_2 = `GPAC RFI Details Updated for ${project_name}`;
    const content_2 = `<h1>Hi,</h1><p>The RFI details have been updated by the following user:</p><p>Manager Name:${client_name}<br> Requester Name: ${requester_name}<br> Request ID: ${request_id} <br> Project Name: ${project_name}.</p><p> Please log in to view.</p><p>Regards, <br>GPAC Team</p>`;
    mailer_obj.sendMail(response, email, subject, content, res_to_send, subject_2, content_2);
  }


}

exports.fileUpload = async (req, response) => {
  console.log("hererererere")
  response.status(200).send({ Message: "File has been successfully uploaded" })
}

module.exports.rfi_update = rfi_update;