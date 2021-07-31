const { sequelize } = require('../models/index');
const db = require("../models");
const Op = db.Sequelize.Op;
const User = db.users;
const {
  DISPLAY_CONFIG_DETAILS,
  GET_GPAC_EMAIL,
  UPDATE_CONFIG_DETAILS
} = require('../../query');

const Mailer = require('../services/mailerClass')
const ldap = require('../services/ldapConnection');

class Admin extends Mailer {


  async config_display(request, response) {

    console.log('config display');
    await sequelize
      .query(DISPLAY_CONFIG_DETAILS)
      .then(async res => {
        console.log(res[0][0]);
        response.status(200).send(res[0][0]);
      })
      .catch(e => {
        console.log(e);
        response.status(500).send({ Error: e });
      })

  }


  async config_update_check(request, response) {

    console.log('config check');
    console.log(request.body);
    const email = request.body.email;
    const password = request.body.adminPassword;

    try {
      console.log('first one')
      await User.findOne({ where: { email: email, portal: 'gpac', role: 'admin' } })
        .then(async function (user) {
          if (!user) {
            response.status(400).send({ error: "This Email ID is not registered!" });
          }
          else if (user && !user.validPassword(password)) {
            console.log('Your password is incorrect');
            response.status(401).send({ error: INCORRECT_PASSWORD });
          }
          else {
            console.log('here')
            response.status(200).send({ Message: "Valid" });
          }
        })

        .catch(e => {
          console.log('finally');
          console.log(e);
        })

    }
    catch (ex) {
      response.status(500).send({ error: "Invalid request" });
    }
  }

  encrypt(text) {
    console.log('in encrypt');
    var cipher = crypto.createCipher(algorithm, key);
    var encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex')
    return encrypted;
  }

  decrypt(text) {
    console.log(text)
    let decipher = crypto.createDecipher(algorithm, key);
    let decrypted = decipher.update(text, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }

  async config_update(request, response) {

    console.log('config update');
    console.log(request.body);
    const manager_email = request.body.configDetails.managermail;
    var gpac_password = request.body.configDetails.oldpass;
    var gpac_new_password = request.body.configDetails.gpacmailpass;
    var gpac_confirm_password = request.body.configDetails.gpac_confirm_password;
    const gpac_email = request.body.configDetails.gpacmail;

    try {
      console.log('first one')

      var obj_enc = new Admin();
      await sequelize
        .query(GET_GPAC_EMAIL)
        .then(async (res) => {
          const admin_mail = res[0][0].admin_email;
          console.log("admin_mail");
          console.log(admin_mail);
          config_table.findOne({ where: { admin_email: admin_mail, portal: 'gpac' } })
            .then(async (config) => {
              if (config && !(obj_enc.encrypt(gpac_password) === config.admin_password)) {
                //   logger.warn({Message:'The old password you have entered is incorrect.'});
                response.status(401).send({ error: CONFIG_OLD_PASSWORD_CHANGE });
              }
              else if (gpac_confirm_password != gpac_new_password) {
                //   logger.warn({Message:'Password mismatch! Please re-type your password again'});
                response.status(401).send({ error: "Password mismatch! Please re-type your password again" });
              }
              else {
                const salt = bcrypt.genSaltSync();
                gpac_new_password = obj_enc.encrypt(gpac_new_password);
                var config_param = [manager_email, gpac_email, gpac_new_password];
                await sequelize
                  .query(UPDATE_CONFIG_DETAILS, { bind: config_param })
                  .then(async res => {
                    console.log(res);
                    //   logger.info({Message:`Password changed successfully ${manager_email}`});
                    response.status(200).send({ Message: CONGIF_DETAILS_UPDATED });
                  })
                  .catch(e => {
                    console.log('error in this catch');
                    console.log(e);
                  })
              }

            })
            .catch(e => {
              console.log('err here ');
              console.log(e);
            })
        })
        .catch(e => {
          console.log(e);
        })

      //first check if the admin is trying to change by getting the password.
      //if password incorrect then do not allow to upload.
      //old password must be valid to change password for the same gsac email id.
    }

    catch (ex) {
      console.log(ex);
      response.status(500).send({ error: "Error while updating config details" });
    }
  }

  async getPHandPL(request, response) {
    let roles=['performancehead','performancelead']
    try {
      await User.findAll({ where: { role: { [Op.or]: roles } } })
        .then(data => {
          response.status(200).send(data);
        })
        .catch(err => {
          console.log(err);response.status(500).send({ error: "Error while get " +role+"details" });
        })
    } catch (e) {
      console.log(ex);
      response.status(500).send({ error: "Error while get " +role+"details" });
    }
  }


  async deleteUser(request, response) {
    let id = request.body.userID;
      try {
      let params = [id];
      await sequelize.query("delete from users where id=$1;", { bind: params })
        .then(res => {
          console.log(res);
          response.status(200).send({ Message: "User deleted Successfully" });
        }).catch(err=>{
          console.log(err);
          response.status(500).send({ error: "Error while deleting Performance Lead details" });    
        })
    } catch (ex) {
      console.log(ex);
      response.status(500).send({ error: "Error while deleting Performance Lead details" });
    }
  }

  async createUser(request, response) {
    try {
      console.log('Create Tester');
      console.log(request.body);
      const mailer_obj = new Mailer();
      const ldap_obj = new ldap();
      var user_email = request.body.user.email;
      var email = user_email.toLowerCase().trim();
      var location = request.body.user.location;
      var role = request.body.user.role;
      var admin_status=request.body.user.admin_status;

      await ldap_obj.ldap_search(request, response, email, location)
        .then(async res => {
          console.log('in response of search');
          console.log(res);
          var name = res.name;
          var designation = res.designation;
          await User.findOne({ where: { email: email, role: role } })
            .then(async (user) => {
              console.log("user" + user)
              if (user) {
                var err = 'Looks like this User is already registered!';
                // logger.warn({ Message: `QA ${email} is already registered!` })
                response.status(400).send(err);
              }
              else {
                User.create({
                  username: name,
                  email: email,
                  password: 'ldap',
                  role: role,
                  designation: designation,
                  admin_status:admin_status,
                  portal: 'gpac'
                }).then(async (res) => {
                  console.log('result'); console.log(res);
                  // logger.info({ Message: `Tester ${email} successfully registered` })
                  role = role==="performancehead"?'Performance Head':'Performance Lead';
                  console.log(role)
                  const subject = role +' Invite';
                  const content = `<p>Hi ${name}, </p><p> You have been registered as a ${role} on the <a href = 'http://gpac.valuelabs.com'>GPAC Portal</a>. Please login using your windows credentials</p><p>Regards,<br>GPAC Team</p>`;
                  const res_to_send = { Message: `Created successfully` }
                  console.log(subject);
                  console.log(content);
                  console.log(res_to_send);
                  response.status(200).send({ response: role + " Created Successfully!" });
                  mailer_obj.sendMail(response, email, subject, content, res_to_send);
                })
                  .catch((err) => {
                    console.log(err)
                    if (err.errors[0].message == 'username must be unique') {
                      response.status(400).send('Username already exists');
                    }
                    if (err.errors[0].message === 'email must be unique') {
                      response.status(400).send('This user already exists with a different role');
                    }
                    else {
                      response.status(400).send(err);
                    }
                  });
              }
            })
        })
        .catch(err => {
          console.log('in ldappp errr');
          console.log(err);
          // logger.warn({ Message: `Ldapp search failed` })
          response.status(400).send(err.error);
        })
    }
    catch (e) {
      console.log('in catchhh');
      console.log(e);
      // logger.warn({ Message: `Tester ${email} registration failed` })
      response.status(500).send(e);
    }
  }

  async editUser(request,response){
    let username=request.body.user.username;
    let designation=request.body.user.designation;
    let admin_status=request.body.user.admin_status;
    let uid=request.body.user.uid;
    console.log(request.body.user)
    try{
      let param=[uid];
      await sequelize.query("Select * from users where id=$1",{bind:param})
      .then(async res=>{
        console.log(res)
        if(username===''||username==null){ username=res[0][0].username;}
        if(designation===""||designation==null){designation=res[0][0].designation;}
        if(admin_status==''||admin_status===null){admin_status=res[0][0].admin_status;}
        let params=[username,designation,admin_status,uid];
        await sequelize.query("update users set username=$1,designation=$2,admin_status=$3 where id=$4",{bind:params})
        .then(res=>{
          console.log(res);
          response.status(200).send({message:"User Details were updated Successfully!!"});
        }).catch(err=>{ 
          console.log(err);
          response.status(500).send({ error: "Error while updaing user details" });
        })
      })
      .catch(err=>{
        console.log(err);
        response.status(500).send({ error: "Error while getting user details for the given id" });
      })

    }catch(ex){
      console.log(ex);
      response.status(500).send({ error: "Error while updating user details" });
    }

  }
  async getRFIqns(request,response){
    let email=request.body.email;
    let finalRes=[];
    try{
      await sequelize.query('Select id,quest_type_id,questions,details from performance_ques order by id').then(async res=>{
        console.log(res[0]);
        let result=res[0];
        await sequelize.query("select array_agg(distinct quest_type_id) as types from performance_ques; ").then(res => {
          let typeArr = res[0][0].types;

          typeArr.forEach(type => {
              let distinct = [];
              for (let i = 0; i < result.length; i++) {
                  if (result[i].quest_type_id === type) {
                          distinct.push(result[i]);
                  }
              }
              if(type==="Database Server Configuration") type="Database Server";
              if(type==="Load Balancer Details")type="Load Balancer";
              if(type==="Miscellaneous Technology  Server Configuration") type="Miscellaneous Tech";
              if(type==="web Server Details") type="Web Server";
              if(type==="Application Server Details") type="Application Server";
              finalRes.push({ name: type, questions: distinct });
          });
          response.send(finalRes)
      })

      })
      .catch(err=>{
        console.log(err);
      })

    }catch(ex){
      console.log('in catchhh');
      console.log(ex);
      // logger.warn({ Message: `Tester ${email} registration failed` })
      response.status(500).send(ex);
    }
  }
  async updateQns(request,response){
    var question=request.body.question;
    var details=request.body.details;
    var qid=request.body.qid;
    try{
      let params=[question,details,qid];
      await sequelize.query("update performance_ques set questions=$1 ,details=$2 where id=$3",{bind:params}).then(
        res=>{
          console.log(res);
          response.status(200).send({message:"RFI questions updated successfully!!"})
        }).catch(err=>{
          console.log(err);
          response.status(400).send({error:"Error while updating details!"})
        })
    }catch(ex){
      console.log(ex);
      response.status(400).send(ex);
    }
  }
  async addQNS(request,response){
    var question=request.body.question;
    var details=request.body.details;
    var qtype=request.body.question_type;
    try{
      let params=[qtype,question,details];
      await sequelize.query("insert into performance_ques (quest_type_id,questions,details) values ($1 ,$2 ,$3) returning *",{bind:params}).then(
        res=>{
          console.log(res);
          response.status(200).send({message:"RFI questions added successfully!!"})
        }).catch(err=>{
          console.log(err);
          response.status(400).send({error:"Error while adding details!"})
        })
    }catch(ex){
      console.log(ex);
      response.status(400).send(ex);
    }
  }
  async deleteQNS(request,response){
    var qid=request.body.qid;
    try{
      let params=[qid];
      await sequelize.query("delete from performance_ques where id=$1",{bind:params}).then(
        res=>{
          console.log(res);
          response.status(200).send({message:"RFI question removed successfully!!"})
        }).catch(err=>{
          console.log(err);
          response.status(400).send({error:"Error while removing details!"})
        })
    }catch(ex){
      console.log(ex);
      response.status(400).send(ex);
    }
  }
}

module.exports = Admin;