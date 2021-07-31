const { sequelize } = require('../models/index');
const db = require("../models");
const User = db.users;
const {
    GET_ALL_SME_DETAILS,
    UPDATE_PROJECT_STATUS,
    FETCH_CLIENT_USING_REQID,
    DELETE_FROM_SME_DETAILS,
    DELETE_SME_FROM_USERS,
    UPDATE_SIGNOFF_STATUS,
    FETCH_ALL_SME,
    GET_PROJECT_DETAILS,
    GET_SME_EMAILID
} = require('../../query');

const Mailer = require('../services/mailerClass')
const ldap = require('../services/ldapConnection')

class performanceHead {

    async getAllSMEInfo(request, response) {

        console.log('Display Tester Details');
        await sequelize
            .query(GET_ALL_SME_DETAILS)
            .then(res => {
                console.log(res[1].rows);
                response.send(res[1].rows);
            })
            .catch(e => {
                console.log(e.stack);
                response.status(500).send({ error: e.stack });
            })
    }

    async updateProjectStatus(request, response) {
        const mailer_obj = new Mailer();

        console.log('update Project status');
        var request_id = request.body.request_id;
        var project_status = request.body.project_status;
        var statusParam = [project_status, request_id]
        await sequelize
            .query(UPDATE_PROJECT_STATUS, { bind: statusParam })
            .then(async res => {
                //send mail to notify client of reports uploaded
                var param = [request_id]
                await sequelize
                    .query(FETCH_CLIENT_USING_REQID, { bind: param })
                    .then(qres => {
                        console.log(qres[0][0].email)
                        const clientData = qres[0][0];
                        const subject = 'GPAC: Project Status';
                        const content = `<h1>Hi ${clientData.client_name},</h1> <p> Project status for ${clientData.project_name} has been updated to ${project_status}. Please login for further details.</p><p><span>Requester Name: </span> ${clientData.requester_name}</p><p><span>Project Name: </span>${clientData.project_name} </p><p><span>Request ID: </span>${clientData.request_id}</p><p>Regards,<br>GSAC Team</p>`;
                        const res_to_send = res[1];

                        mailer_obj.sendMail(response, clientData.email, subject, content, res_to_send);
                    }
                    ).catch(e => {
                        console.log(e.stack);
                        response.status(500).send({ error: "Unable To Find the Client!! with this Request ID" });
                    })
            }


            )
            .catch(e => {
                console.log(e.stack)
                response.status(500).send({ error: e.stack });
            })
    }

    async getAllSME(request, response) {

        console.log('Display Tester');
        await sequelize
            .query(FETCH_ALL_SME)
            .then(res => {
                console.log(res[1].rows);
                response.send(res[1].rows);
            })
            .catch(e => {
                console.log(e.stack);
                response.status(500).send({ error: e.stack });
            })

    }

    async assignSME(request, response) {

        try {
            const mailer_obj = new Mailer();

            console.log('Assign sme');
            console.log(request.body);
            var reqid = request.body.request_id;
            var sme = request.body.sme;
            var new_sme = request.body.newList;
            var removed_sme = request.body.removedList;
            if (sme != null) { sme = sme.split(',') }
            if (new_sme != null) { new_sme = new_sme.split(',') }
            if (removed_sme != null) { removed_sme = removed_sme.split(',') }
            let params = [reqid]
            await sequelize
                .query('delete from sme_details where req_id=$1', { bind: params })
                .then(async res => {
                    console.log(res[1]);
                    await sequelize
                        .query("INSERT INTO sme_details(sme_id,req_id)(select id,:req_id from users where username=ANY(SELECT UNNEST(ARRAY[:sme])) and role = 'sme') RETURNING *", { replacements: { sme: sme, req_id: reqid } })
                        .then(async resp => {
                            console.log(resp);
                            response.status(200).send({ res: 'Successfully Assiged the SMEs' });
                            await sequelize
                                .query(GET_PROJECT_DETAILS, { bind: params })
                                .then(async resp => {
                                    console.log('this is project resp');
                                    var client_name = resp[0][0].client_name;
                                    var project_name = resp[0][0].project_name;
                                    if (removed_sme != null) {
                                        console.log('someone is removed')
                                        var sme_email = '';
                                        await sequelize
                                            .query(GET_SME_EMAILID, { replacements: { sme: removed_sme } })
                                            .then(res => {
                                                console.log('result of response')
                                                sme_email = res[0][0].email
                                                console.log(res); console.log(sme_email);
                                            }).catch((e) => { console.log(e) });
                                        const subject = 'GPAC: Relieved from Project';
                                        const content = `<h1>Hi,</h1> <p> Please note that you have been relieved from ${project_name} Project.</p><p><span>Client Name: </span> ${client_name}</p><p><span>Project Name: </span>${project_name} </p><p><span>Request ID: </span>${reqid}</p><p>Regards,<br>GPAC Team</p>`;

                                        mailer_obj.sendMail(response, sme_email, subject, content);
                                    }
                                    if (sme != null) {
                                        var sme_email = '';
                                        if (new_sme === null && removed_sme === null) {
                                            sme_email = '';
                                            console.log('testers are assigned for the first time')
                                                .query(GET_SME_EMAILID, { replacements: { sme: sme } })
                                                .then(res => {
                                                    console.log('result of response')
                                                    sme_email = res[0][0].email
                                                    console.log(res); console.log(sme_email);
                                                }).catch((e) => {
                                                    console.log(e); // response.status(500).send({error: e.stack})
                                                })
                                        } else if (new_sme != null) {
                                            console.log("someone new is assigned")
                                            sme_email = '';
                                            await sequelize
                                                .query(GET_SME_EMAILID, { replacements: { sme: new_sme } })
                                                .then(res => {
                                                    console.log('result of response')
                                                    sme_email = res[0][0].email
                                                    console.log(res); console.log(sme_email);
                                                }).catch((e) => {
                                                    console.log(e); // response.status(500).send({error: e.stack})
                                                })
                                        }
                                        const subject = 'GPAC: New Project Alert';
                                        const content = `<h1>Hi,</h1> <p> You have been assigned to a new project with the following details.</p><p><span>User: </span> ${client_name}</p><p><span>Project Name: </span>${project_name} </p><p><span>Request ID: </span>${reqid}</p><p>Please login to view.</p><p>Regards,<br>GPAC Team</p>`;
                                        mailer_obj.sendMail(response, sme_email, subject, content);
                                    }
                                })
                                .catch((e) => {
                                    console.log('innnnn catch')
                                    console.log(e);
                                    response.status(500).send({ error: e.stack })
                                })

                        })
                })


        }
        catch (ex) {
            console.log('in the try catch');
            console.log(ex)
            //   response.status(500).send({error: ex});
        }
    }

    async createTester(request, response) {
        try {
            console.log('Create Tester');
            console.log(request.body);
            const mailer_obj = new Mailer();
            const ldap_obj = new ldap();
            var user_email = request.body.createTester.email;
            var email = user_email.toLowerCase().trim();
            var location = request.body.createTester.location;

            await ldap_obj.ldap_search(request, response, email, location)
                .then(async res => {
                    console.log('in response of search');
                    console.log(res);
                    var name = res.name;
                    var designation = res.designation;
                    await User.findOne({ where: { email: email, role: 'sme' } })
                        .then(async (user) => {
                            console.log("user" + user)
                            if (user) {
                                var err = 'Looks like this SME is already registered!';
                                // logger.warn({ Message: `QA ${email} is already registered!` })
                                response.status(400).send(err);
                            }
                            else {
                                console.log('sdfsdf')
                                User.create({
                                    username: name,
                                    email: email,
                                    password: 'ldap',
                                    role: 'sme',
                                    designation: designation,
                                    portal: 'gpac'
                                }).then(async (res) => {
                                    console.log('result'); console.log(res);
                                    // logger.info({ Message: `Tester ${email} successfully registered` })
                                    const subject = 'SME Invite';
                                    const content = `<p>Hi ${name}, </p><p> You have been registered as a SME on the <a href = 'http://gpac.valuelabs.com'>GPAC Portal</a>. Please login using your windows credentials</p><p>Regards,<br>GPAC Team</p>`;
                                    const res_to_send = { Message: `Created successfully` }
                                    response.status(200).send({ response: "SME Created Successfully!" });
                                    mailer_obj.sendMail(response, email, subject, content, res_to_send);
                                })
                                    .catch((err) => {
                                        console.log('error in create')
                                        console.log(err)
                                        if (err.errors[0].message == 'username must be unique') {
                                            response.status(400).send('Username already exists');
                                        }
                                        if (err.errors[0].message === 'email must be unique') {
                                            response.status(400).send('This user already exists with a different role');
                                        }
                                        else {
                                            console.log('inerrrr');
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

    async deleteTester(request, response) {

        console.log('Delete Tester');
        console.log(request.body)
        var tester_email = request.body.testerEmail;
        const mailer_obj = new Mailer();
        //get name of tester from users table
        await User.findOne({ where: { email: tester_email, role: 'sme' } })
            .then(async (user) => {
                if (user) {
                    console.log(user.dataValues.id);
                    let id = user.dataValues.id;
                    let name=user.dataValues.username;
                    let params = [id]
                    console.log(id)
                    await sequelize
                        .query(DELETE_FROM_SME_DETAILS, { bind: params })
                        .then(async qres => {
                                await sequelize
                                    .query(DELETE_SME_FROM_USERS, { bind: params })
                                    .then(res => {
                                        console.log(res);
                                        response.status(200).send({ Success: user });
                                        // logger.info({ Message: `Tester ${email} successfully registered` })
                                        const subject = 'Alert ! Removed from SME Role';
                                        const content = `<p>Hi ${name}, </p><p> You have been removed from the role of SME from GPAC Portal. For more information contact GPAC Team.</p><p>Regards,<br>GPAC Team</p>`;
                                        const res_to_send = { Message: `Deleted successfully` }
                                         mailer_obj.sendMail(response, email, subject, content, res_to_send);
                                    })
                                    .catch(e => {
                                        console.log(e)
                                        response.status(500).send({ error: "Error in deleting the SME !" });
                                    })
                        })
                        .catch(e => {
                            console.log(e)
                            response.status(500).send({ error: "Error in deleting the SME !" });
                        })
                } else {
                    response.send({ Message: "There is no user registered with that email!" })
                }
            }).catch(e => {
                console.log(e)
                response.status(500).send({ error: "Error in executing the request !" });
            });
    }

    async signoff(request, response) {

        console.log('Sign Off Project');
        // console.log(request.body);
        const mailer_obj = new Mailer();
        var user_email = request.body.email;
        var email = user_email.toLowerCase().trim();
        var request_id = request.body.request_id;
        var signoff_date = request.body.signoff;

        var param = [signoff_date, request_id]
        await sequelize
            .query(UPDATE_SIGNOFF_STATUS, { bind: param })
            .then(res => {
                console.log(res);
                response.status(200).send({ Message: "Signoff Details Updated Successfully" });
                return;
            })
            .catch(e => {
                console.log(e.stack)
                logger.error({ Message: e.stack });
                response.status(500).send({ error: e.stack });
                return;
            });

    }
}


module.exports = performanceHead;