const db = require("../models");
const {sequelize} = require('../models/index');

const {GET_GPAC_MAIL_AUTH_DETAILS} = require('../../query');
const nodemailer = require('nodemailer');
const smtpTransport = require('nodemailer-smtp-transport');

const General = require('../services/generalServicesClass');

class Mailer extends General{

    async sendMail(response,email,subject,content,res_to_send,subject_2,content_2){

        console.log('send mail');
        console.log(arguments.length);
        for(var i=1;i<arguments.length;i++){
            console.log(i);
            console.log(arguments[i]);
        }
        await sequelize
        .query(GET_GPAC_MAIL_AUTH_DETAILS)
        .then(async (details)=>{
            console.log('details');
            console.log(details[0][0]);
            const gpac_mail = details[0][0].admin_email;
            const manager_mail = details[0][0].manager_email;
            const gpac_pass = details[0][0].admin_password;
    
            console.log('DETAILSSSS');
            console.log(details[0][0]);
          
            const obj = new General();
            const dec_pass = obj.decrypt(gpac_pass);
            console.log('PASSSSSSSSSSSSSSS');
            console.log(dec_pass);
    
            var transporter = nodemailer.createTransport(
                smtpTransport(
                    {
            service: 'zimbra',
            host: 'smtp.valuelabs.com',
            secureConnection: false,
            port: 587,
            // logger:true,
            debug:true,
            auth: {
                user: gpac_mail,
                pass: dec_pass
            },
            tls: {
                // do not fail on invalid certs
                secureProtocol: "TLSv1_method",
                rejectUnauthorized: false
                }
            })
            );
    
            if(arguments.length===7){
                console.log('2 mails to send');
    
                var mailOptions = {
                    from: gpac_mail,
                    to: email,
                    subject: subject ,
                    html: content
                    };
                    transporter.sendMail(mailOptions, function(error, info){
                    if (error) {
                        response.status(500).send({error: "There was an error while sending the email! Please try again."})
                    } else {
                        // logger.info({Message:`Manager email validated ${email}`});
                        console.log('Email sent: ' + info.res);
                        if(res_to_send!='')
                        response.status(200).send(res_to_send);
                    }
                    });
                    var mailmanagOptions = {
                               from: gpac_mail,
                               to: manager_mail,
                               subject: subject_2,
                               html: content_2
                             };
                       transporter.sendMail(mailmanagOptions, function(error, info){
                     if (error) {
                    //   logger.error({Message: `Create Manager - Error while sending mail to Security Head: ${error}`});
                       console.log(error);
                     } else {
                    //    logger.info({Message: 'Create Manager - Mail sent to Security Head'});
                       console.log('Email sent: ' + info.response);
                      //  response.status(200).send({Message: "You have been successfully registered! Please check your mail for further details."});
    
                     }
                   });
    
                
            }
            else{
                var mailOptions = {
                    from: gpac_mail,
                    to: email,
                    subject: subject ,
                    html: content
                    };
                    transporter.sendMail(mailOptions, function(error, info){
                    if (error) {
                        // response.status(500).send({error: "There was an error while sending the email! Please try again."})
                        console.log(error);
                    } else {
                        // logger.info({Message:`Manager email validated ${email}`});
                        console.log('Email sent: ' + info);
                        console.log('loooooooooo');
                        console.log(res_to_send);
                        if(res_to_send==='' || res_to_send ===undefined) return 'Successfully sent mail';
                        if(res_to_send!='' || res_to_send !=undefined){
                          response.status(200).send(res_to_send);
                        }
                    }
                    });
            }
        })
        .catch(err=>{
            console.log('error in getting details');
            console.log(err);
            // response.status(500).send({error: 'Error in sending mail. Please contact support team.'});
        })
      }

}
module.exports= Mailer;