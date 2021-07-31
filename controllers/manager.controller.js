const {sequelize} = require('../models/index');
const {GET_CLIENT_INFORMATION} = require('../../query');

const Mailer = require('../services/mailerClass')
const register =require ('./register.controller')

class Manager extends Mailer{
    
async updateRfiAns (request, response) {

  console.log('Update RFI Answers');
  console.log(request.body.email);
  var request_id=request.body.request_id;
  var email = request.body.email;
  var param=[request_id];
  await sequelize
    .query(GET_CLIENT_INFORMATION,{bind:param})
    .then(async (res)=>{
      console.log('the result of my query');
      console.log(res[0])
      const client_name = res[0][0].client_name;
      const request_id = res[0][0].request_id;
      const project_name =res[0][0].project_name;
      const requester_name = res[0][0].requester_name;
      const directSubmission='false';
      const RFIUpdate='true';
      const param=[request_id];
      await sequelize.query("update client_details set rfi_type='false' where request_id=$1;",{bind:param}).then(ress=>console.log(ress)).catch(err=>console.log(err))
      register.rfi_update(request,response,request_id,email,requester_name,project_name,client_name,directSubmission,RFIUpdate)
      
     })
     .catch(e => {
        console.log(e.stack)
         response.status(500).send({error:"Error In getting Client info and updating RFI"});
      
      })

 

}

async downloadRFIImage (request, response) {

  console.log('Download Round 1 Report');
  console.log(request.body);
  try{
    console.log(request.body);
  var file_path = '..\\rfi_fileUploads\\'+request.body.request_id+'\\';
  var file_name = request.body.fileName;
  var file = file_path+file_name;
  console.log('file');
  console.log(file);
  response.download(file);
  }
  catch(e){
      console.log(e);
  response.status(500).send(e);
  }

}

async fileUpload(req, response){
  console.log("hererererere")
  response.status(200).send({Message:"File has been successfully uploaded"})
}

}
module.exports=Manager ;