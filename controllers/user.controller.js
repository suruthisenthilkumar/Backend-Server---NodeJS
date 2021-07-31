const { sequelize } = require('../models/index');
const db = require("../models");

const client_details = db.client_details;
const jwt = require('jsonwebtoken')
const {
    GET_JO_STATUS,
    DELETE_USER_SECRET_KEY,
    DELETE_MANAGER_SECRET_KEY,
    UPDATE_CLIENT_DETAILS_PH,
    UPDATE_CLIENT_DETAILS,
    UPDATE_CLIENTS_TABLE, GET_USER, GET_MANAGER,
    GET_RFI_ANS,
    GET_PROJECT_DETAILS_PH,
    GET_CLIENT_INFORMATION_SME,
    GET_CLIENT_INFORMATION,
    GET_PROJECT_DETAILS_SME,
} = require('../../query');

var requester = require('request');
const { types } = require('babel-core');

class User {

    async user_check(request, response) {
        try {

            const token = request.header('Authorization', 'bearer');
            console.log('token' + token);
            var token_param = [token];

            if (token != null) {

                await sequelize
                    .query(GET_USER, { bind: token_param })
                    .then(async (res) => {
                        console.log(res);
                        if (res[0][0] != null) {
                            const decoded = jwt.verify(token, res[0][0].secret_key_gpac);
                            console.log(decoded);
                            response.send({ id: res[0][0].id, name: res[0][0].username, role: res[0][0].role, email: res[0][0].email, admin_status: res[0][0].admin_status });
                        }
                        else {
                            await sequelize
                                .query(GET_MANAGER, { bind: token_param })
                                .then((respo) => {
                                    if (respo[0][0] != null) {
                                        const result = respo[0][0];
                                        const decoded = jwt.verify(token, result.secret_key_gpac);
                                        response.send({ id: result.id, name: result.client_name, role: 'manager', email: result.email });
                                    }
                                    else {
                                        console.log('modified token');
                                        response.status(401).send({ "Message": "Invalid User" });
                                    }
                                })

                        }
                    })
            }
            else {
                console.log('no token');
                response.status(200).send({ "Message": "You are not logged in!" });
            }
        }
        catch (err) {
            console.log('inn errr')
            console.log(err)
            console.log(err.name === 'TokenExpiredError');

            if (err.name === 'TokenExpiredError') {
                await sequelize
                    .query(GET_USER, { bind: token_param })
                    .then(async (res) => {
                        console.log(res);
                        if (res[0][0] != null) {
                            response.send({ "Message": "Your session has expired", id: res[0][0].id, name: res[0][0].username, role: res[0][0].role, email: res[0][0].email, admin_status: res[0][0].admin_status });
                        }
                        else {
                            await sequelize
                                .query(GET_MANAGER, { bind: token_param })
                                .then((respo) => {
                                    if (respo[0][0] != null) {
                                        const result = respo[0][0];
                                        response.send({ "Message": "Your session has expired", id: result.id, name: result.client_name, role: 'manager', email: result.email });
                                    }
                                    else {
                                        console.log('modified token');
                                        response.status(401).send({ "Message": "Invalid User" });
                                    }
                                })

                        }
                    })

            }
            else {
                response.status(500).send({ error: "Invalid request" });
            }
        }
    }

    async getProjects(request, response) {

        console.log('Get Project Details');
        console.log(response.locals.role);
        let role = response.locals.role;
        console.log(request.body);

        if (role === 'performancehead' || role === 'performancelead' || role === 'admin') {
            await sequelize
                .query(GET_PROJECT_DETAILS_PH)
                .then(res => {
                    // console.log(res[0])
                    // logger.info({Message: 'Query successfully executed - Get Manager details '});
                    response.status(200).send(res[0]);
                })
                .catch(e => {
                    console.log(e.stack)
                    // logger.error({Message: e.stack});
                    response.status(500).send({ error: e.stack });
                });
        }
        if (role === 'manager') {
            let clientId = request.body.id;
            await sequelize
            client_details.findAll({ where: { client_id: clientId } })
                .then(data => {
                    response.send(data);
                })
                .catch(err => {
                    response.status(500).send({
                        message:
                            err.message || "Some error occurred while retrieving client data."
                    });
                });
        }
        if (role === 'sme') {
            let testerId = [request.body.id];
            await sequelize
                .query(GET_PROJECT_DETAILS_SME, { bind: testerId })
                .then(res => {
                    // console.log(res[1].rows);
                    // logger.info({Message:'Client Details obtained for sme - Query executed successfully'});
                    response.status(200).send(res[1].rows)
                })
                .catch(e => {
                    console.log(e.stack);
                });
        }
    }

    async getClientInfo(request, response) {

        console.log('Get All Client Info');
        var role = response.locals.role;
        var request_id = request.body.request_id;
        if (role === 'sme') {
            var testerID = request.body.id;
            var params = [testerID, request_id]
            await sequelize
                .query(GET_CLIENT_INFORMATION_SME, { bind: params })
                .then(res => {
                    console.log(res[0]);
                    response.send(res[0])
                })
                .catch(e => {
                    console.log(e.stack)
                    response.status(500).send({ error: e.stack });
                })
        } else {
            var param = [request_id];
            await sequelize
                .query(GET_CLIENT_INFORMATION, { bind: param })
                .then(res => {
                    console.log(res[0]);
                    response.status(200).send(res[0]);
                })
                .catch(e => {
                    console.log(e.stack);
                    response.status(500).send({ error: e.stack });
                })
        }
    }

    async update_clientinfo(request, response) {

        console.log('Update Basic Client Info');
        console.log(request.body);
        var role = request.body.role;
        var requester_name = request.body.clientinfo.Rqstername;
        var project_name = request.body.clientinfo.Prjname;
        var cluster_head_dlt = request.body.clientinfo.Clusterhead;
        var geography = request.body.clientinfo.Geo;
        var dlt2 = request.body.clientinfo.Dlt2;
        var jo_value = request.body.clientinfo.JOvalue;
        var jo_status = request.body.clientinfo.JOstatus;
        var currency_symbol = request.body.clientinfo.symbol;
        var request_id = request.body.request_id;
        var commercial_status = request.body.clientinfo.commstatus;
        var project_billing = request.body.clientinfo.project_billing;


        var currencyFormat = `base=${currency_symbol}`;
        const currencyConversionUrl = `https://api.exchangeratesapi.io/api/latest?${currencyFormat}&symbols=USD`
        // const currencyConversionUrl=`https://api.exchangeratesapi.io/latest?base=USD`
        console.log(currencyConversionUrl);
        requester(currencyConversionUrl, async function (error, respon, body) {
            if (!error && response.statusCode == 200) {
                console.log('in body')
                console.log(JSON.parse(body).rates.USD);
                const currency_rates = JSON.parse(body).rates.USD;
                var jo_value_usd = (currency_rates * jo_value).toFixed(2);

                var request_idParam = [request_id]
                // promise handling
                await sequelize
                    .query(GET_JO_STATUS, { bind: request_idParam })
                    .then(async (res) => {
                        if (res[0][0].jo_status == 'Signed' && role === 'manager') {

                            console.log('role in else');
                            console.log(role);
                            const params = [requester_name, project_name, commercial_status, request_id];
                            const param2 = [cluster_head_dlt, geography, dlt2, request_id];

                            await sequelize
                                .query(UPDATE_CLIENT_DETAILS, { bind: params })
                                .then(async function () {
                                    await sequelize
                                        .query(UPDATE_CLIENTS_TABLE, { bind: param2 })
                                        .then(qres => {
                                            console.log(qres)
                                            response.send(qres);
                                        }).catch(e => {
                                            console.log(e.stack);
                                            response.status(500).send({ error: "unable to update client information" });
                                        })
                                })
                                .catch(e => {
                                    console.log(e.stack);
                                    response.status(500).send({ error: e.stack });
                                })

                        }
                        else {

                            console.log('role')
                            console.log(role)
                            const params = [requester_name, project_name, jo_status, jo_value, currency_symbol, jo_value_usd, commercial_status, project_billing, request_id];
                            const param2 = [cluster_head_dlt, geography, dlt2, request_id];
                            await sequelize
                                .query(UPDATE_CLIENT_DETAILS_PH, { bind: params })
                                .then(async function () {
                                    await sequelize
                                        .query(UPDATE_CLIENTS_TABLE, { bind: param2 })
                                        .then(qres => {
                                            console.log(qres)
                                            response.send(qres);
                                        }).catch(e => {
                                            console.log(e.stack);
                                            response.status(500).send({ error: "unable to update client information" });
                                        })
                                })
                                .catch(e => {
                                    console.log(e.stack);
                                    response.status(500).send({ error: e.stack });
                                })

                        }


                        // response.send(res[0][0].jo_status)
                    })
                    .catch(e => {
                        console.log(e.stack);
                        response.status(500).send({ error: e.stack });
                    })


            }

            else if (error) {
                console.log('currency api error');
                console.log(error);
                response.status(500).send({ error: error });

            }

        })

    }

    async getRFIQns(request, response) {
        try {
            await sequelize
                .query("Select * from performance_questn order by id;")
                .then(
                    qns => {
                        console.log(qns[0]);
                        response.send(qns[0]);
                    }
                ).catch(err => {
                    console.log(err);
                    response.send(err)
                })

        } catch (ex) {
            console.log(ex);
            response.send(ex);
        }
    }
    async getRfiAns(request, response) {

        console.log('Get RFI Answers');
        const request_id = request.body.request_id;
        const querytype = request.body.type;
        console.log(request_id)
        var req_id = [request_id];
        var finalRes = []; let typeArr;
        await sequelize
            .query('SELECT q.id, q.quest_type_id, q.questions, a.answers, q.details FROM performance_questn AS q LEFT JOIN performance_ans AS a ON q.id = a.question_id AND a.request_id = $1 ORDER BY q.id', { bind: req_id })
            .then(async res => {
                console.log('initial result')
                var result = res[0];
                await sequelize.query("select array_agg(distinct quest_type_id) as types from performance_questn; ").then(res => {
                    typeArr = res[0][0].types;

                    typeArr.forEach(type => {
                        let distinct = [];
                        console.log(type)
                        for (let i = 0; i < result.length; i++) {
                            if (result[i].quest_type_id === type) {
                                if (querytype === "view") {
                                    if(result[i].answers!=null&&result[i].answers!=""){
                                    if (result[i].answers.includes("entryValue")) {
                                        let ans = JSON.parse(result[i].answers);
                                        if (ans.entryValue != ''&&ans.entryValue != null)
                                            ans = ans.radioValue + ',' + ans.entryValue;
                                        else{
                                            if(ans.radioValue != ''&&ans.radioValue != null)
                                            ans = ans.radioValue;
                                            else
                                            ans=null;
                                        }
                                        result[i].answers = ans;
                                    }
                                    if(result[i].answers!=null)
                                    distinct.push(result[i]);

                                }
                                }
                                 if (querytype==="edit"){
                                     
                                    distinct.push(result[i]);
                                }
                            }
                        }
                        console.log(distinct.length);
                        // console.log(distinct)

                        finalRes.push({ name: type, answers: distinct });

                    });
                }).catch(err => {
                    console.log(err)
                })

                response.send({ result: finalRes });
            })
            .catch(e => {
                console.log(e.stack);
                response.send({ error: e.stack });
            })

    }

    async logout(request, response) {

        console.log('Logout');
        console.log(request.body);
        var user_email = request.body.email;
        var email = user_email.toLowerCase().trim();
        var user_role = request.body.role;
        var role = user_role.toLowerCase().trim();

        try {
            if (role === 'manager') {
                var param = [email];
                await sequelize
                    .query(DELETE_MANAGER_SECRET_KEY, { bind: param })
                    .then(res => {
                        console.log(res);
                        //  logger.info({Message:`Manager ${email} logged out successfully`});
                        response.status(200).send({ Message: "Logged Out Successfully!!" });
                    })
                    .catch(e => {
                        console.log(e.stack)
                        response.status(500).send({ error: "Error in Deleting Secret Key!!" });
                    })

            }
            else {
                var param = [email]
                await sequelize
                    .query(DELETE_USER_SECRET_KEY, { bind: param })
                    .then(res => {
                        console.log(res);
                        //  logger.info({Message:`User ${email} logged out successfully`});
                        response.status(200).send({ Message: "Key Deleted" });
                    })
                    .catch(e => {
                        console.log(e.stack)
                        response.status(500).send({ error: e.stack });
                    })


            }

        }
        catch (error) {
            console.log('errr in catch');
            console.log(error);
            // logger.error({Message:error});
            response.status(500).send(error);
        }
    }

}


module.exports = User;
