const db = require("../models");
const { sequelize } = require('../models/index');
const User = db.users;
const clients = db.clients;
const Op = db.Sequelize.Op;
const {
    NO_EMAIL_REGISTERED,
    INCORRECT_PASSWORD,
    ALREADY_LOGGED_IN,
    UNREGISTERED_MANAGER,
} = require('../constants/constants');
const { GET_SECRET_MANAGER, GET_SECRET, INSERT_SECRET_MANAGER, INSERT_SECRET, INSERT_TOKEN_MANAGER, INSERT_TOKEN } = require('../../query');

var Speakeasy = require('speakeasy');
const jwt = require('jsonwebtoken');

const ldapConnection = require("../services/ldapConnection");
var ldapConn = new ldapConnection();

const Mailer = require("../services/mailerClass")


exports.validateUser = async (req, response) => {
    console.log('Check email of User');
    var user_email = req.body.loginDetails.email;
    var email = user_email.toLowerCase().trim();
    var email_param = [email];
    var role = req.body.loginDetails.loginAs.toLowerCase();
    var location = req.body.loginDetails.location;

    try {
        if (role == 'sme' || role === 'performancehead' || role === 'performancelead' || role === 'manager') {
            await ldapConn.ldap_search(req, response, email, location)
                .then(res => {
                    console.log('in res');
                    // console.log(res);

                    if (role === 'performancehead' || role === 'sme' || role === 'performancelead') {

                        User.findOne({ where: { email: email, portal: { [Op.like]: '%' + 'gpac' + '%' }, role: role } })
                            .then(async function (user) {
                                console.log(User)
                                if (!user) {
                                    // logger.warn({ Message: `${email} not registered as SME or Performance Head - Failed email attempt` });
                                    response.status(500).send({ error: NO_EMAIL_REGISTERED });
                                }
                                else {
                                    // promise handling
                                    // logger.info({ Message: `User ${email} successful login` });
                                    response.status(200).send({ 'id': user.id, 'email': email, 'role': user.role, 'name': user.username, 'admin_status': user.admin_status, location: location });
                                }
                            })
                    }
                    else {
                        //manager role
                        console.log('in manager role');
                        clients
                            .findOne({ where: { email: email, portal: { [Op.like]: '%' + 'gpac' + '%' } } })
                            .then(async (client) => {

                                if (!client) {
                                    // logger.warn({ Message: `Manager not registered ${email}- Failed email validate` });
                                    response.status(400).send({ error: UNREGISTERED_MANAGER });
                                }
                                else {
                                    console.log('client is here');
                                    response.status(200).send({ "id": client.id, "name": client.client_name, "email": email, "role": role, "location": location })
                                }
                            })
                    }
                })
                .catch(err => {
                    console.log('err');
                    console.log(err);
                    response.status(400).send({ error: err.error });
                })
        }

        else if (role === 'guest') {

            clients
                .findOne({ where: { email: email, portal: { [Op.like]: '%' + 'gpac' + '%' } } })
                .then(async (client) => {
                    if (!client) {
                        // logger.warn({ Message: `Manager not registered ${email}- Failed email validate` });
                        response.status(400).send({ error: UNREGISTERED_MANAGER });
                    }
                    else {
                        //client
                        // promise handling
                        await sequelize
                            .query(GET_SECRET_MANAGER, { bind: email_param })
                            .then(async (resss) => {
                                console.log(resss[0][0].secret_key_gpac)
                                if (resss[0][0].secret_key_gpac === null) {
                                    console.log('client is here');
                                    var portal = client.portal;
                                    console.log(portal.includes('gpac'));
                                    if (portal.includes('gpac')) {

                                        var token = Speakeasy.totp({
                                            secret: "secret_key",
                                            encoding: "base32"
                                        })

                                        //sending mail code here
                                        const subject = 'GSAC Portal OTP';
                                        const content = `<p>Hi ${client.client_name},</p><p> Please use the OTP:<b> ${token}</b> to log in. This OTP is valid for 2 minutes.</p><p>Regards,<br>GPAC Team</p>`
                                        const res_to_send = {

                                            "name": client.client_name,
                                            "email": email,
                                            "role": role
                                        }
                                        console.log('here an');
                                        // console.log(this.obj);
                                        var obj = new Mailer();
                                        obj.sendMail(response, email, subject, content, res_to_send);

                                    }
                                    else {
                                        // logger.warn({ Message: `Manager not registered ${email}- Failed email validate` });
                                        response.status(400).send({ error: UNREGISTERED_MANAGER });
                                    }
                                }
                                else {
                                    // logger.warn({ Message: `Manager ${email} logged-in elsewhere` })
                                    response.status(500).send({ error: ALREADY_LOGGED_IN });
                                }
                            })
                            .catch((e) => {
                                console.log(e);
                                response.status(500).send(e);
                            })
                    }
                })
        }
    } catch (err) {
        console.log('err in catch');
        console.log(err);
        response.status(500).send({ error: err });
    }
}

exports.validatePasskey = async (req, res) => {
    console.log('Login');

    var user_email = req.body.email;
    var password = req.body.password;
    var role = req.body.role.toLowerCase();
    var email = user_email.toLowerCase().trim();
    var email_param = [email];
    var location = req.body.location;
    console.log(password, role, email, location)

    try {
        var ldap_credentials = ldapConn.ldap_cred(location);
        if (role === 'sme' || role === 'performancehead' || role === 'performancelead' || role === 'manager') {
            await ldapConn.ldap_search(req, res, email, location)
                .then(resp => {
                    console.log(resp);
                    console.log(resp.msg);
                    if (password === '' || password === undefined) {
                        console.log('hehe');
                        res.status(400).send({ error: INCORRECT_PASSWORD });
                        return;
                    }
                    else {
                        console.log('in elseee');
                        console.log(resp.data);
                        console.log(password);
                        var ldapclient = resp.ldap_connection;
                        ldapclient.bind(resp.data, password, async function (err) {
                            if (err) {
                                res.status(403).send({ error: "Invalid Password" });
                            }
                            else {
                                console.log('successful password');
                                if (role === 'performancehead' || role === 'sme' || role === 'performancelead') {
                                    await User.findOne({ where: { email: email, role: role, portal: { [Op.like]: '%' + 'gpac' + '%' } } })
                                        .then(async function (user) {
                                            if (!user) {
                                                // logger.warn({ Message: `User ${email} not registered - Failed Login Attempt` });
                                                res.status(400).send({ error: NO_EMAIL_REGISTERED });
                                            }
                                            else {
                                                await sequelize
                                                    .query(GET_SECRET, { bind: email_param })
                                                    .then(async (resss) => {
                                                        console.log('ressssssssss')
                                                        console.log(resss[0][0].secret_key_gpac)
                                                        if (resss[0][0].secret_key_gpac === null) {
                                                            // promise handling
                                                            var secret = Speakeasy.generateSecret({ length: 10 });
                                                            var secret_key = secret.base32;
                                                            var s_param = [secret_key, email];
                                                            await sequelize
                                                                .query(INSERT_SECRET, { bind: s_param })
                                                                .then(response => {
                                                                    console.log('response' + response)
                                                                })
                                                                .catch(e => {
                                                                    console.log("In here onlyyyyyyyyyyyyy")
                                                                    console.log(e.stack)
                                                                })
                                                            req.user = user.dataValues; //user data
                                                            console.log('USERRR');
                                                            console.log(user);
                                                            const token = jwt.sign({ email: user.email, role: user.role, admin_status: user.admin_status }, secret_key, { expiresIn: '10h' });
                                                            // logger.info({ Message: `User ${email} Successful Login` });
                                                            var tok_param = [token, email];
                                                            await sequelize
                                                                .query(INSERT_TOKEN, { bind: tok_param })
                                                                .then((qres) => {
                                                                    console.log(qres);
                                                                    res.header('Authorization', 'Bearer ' + token).send({ 'token': token, 'role': user.role, 'admin_status': user.admin_status });
                                                                    ldapclient.unbind(err => {
                                                                        if (err) {
                                                                            console.log(err);
                                                                        }
                                                                    });
                                                                    ldapclient.destroy(err => {
                                                                        if (err) {
                                                                            console.log(err);
                                                                        }
                                                                    });
                                                                });
                                                        }
                                                        else {
                                                            // logger.warn({ Message: `User ${email} logged in elsewhere` });
                                                            res.status(500).send({ error: ALREADY_LOGGED_IN });
                                                        }
                                                    })
                                                    .catch(e => {
                                                        console.log(e);
                                                        res.status(500).send({ error: e.stack });
                                                    })
                                            }
                                        });
                                }
                                else {
                                    clients
                                        .findOne({ where: { email: email, portal: { [Op.like]: '%' + 'gpac' + '%' } } })
                                        .then(async (client) => {
                                            if (!client) {
                                                response.status(400).send({ error: UNREGISTERED_MANAGER });
                                            }
                                            else {
                                                await sequelize
                                                    .query(GET_SECRET, { bind: email_param })
                                                    .then(async (resss) => {
                                                        if (resss[0][0].secret_key_gpac === null) {
                                                            var secret = Speakeasy.generateSecret({ length: 10 });
                                                            var secret_key = secret.base32;
                                                            var sec_param = [secret_key, email];
                                                            await sequelize
                                                                .query(INSERT_SECRET_MANAGER, { bind: sec_param })
                                                                .then(async queryres => {
                                                                    console.log(queryres);
                                                                })
                                                                .catch(e => {
                                                                    console.log(e.stack);
                                                                })
                                                            const jwt_token = jwt.sign({ email: email, role: role }, secret_key, { expiresIn: '10h' });
                                                            // logger.info({ Message: `Manager ${email} successful login` });
                                                            var token_prm = [jwt_token, email];

                                                            await sequelize
                                                                .query(INSERT_TOKEN_MANAGER, { bind: token_prm })
                                                                .then((qres) => {
                                                                    console.log(qres);
                                                                    res.header('Authorization', 'Bearer ' + jwt_token).send({ 'token': jwt_token, 'role': role });

                                                                    ldapclient.unbind(err => {
                                                                        if (err) {
                                                                            console.log(err);
                                                                        }
                                                                    });
                                                                    ldapclient.destroy(err => {
                                                                        if (err) {
                                                                            console.log(err);
                                                                        }
                                                                    });
                                                                });
                                                        }
                                                        else {
                                                            // logger.warn({ Message: `Manager ${email} logged-in elsewhere` })
                                                            res.status(500).send({ error: ALREADY_LOGGED_IN });
                                                        }
                                                    })
                                                    .catch((e) => {
                                                        console.log(e);
                                                        res.status(500).send(e);
                                                    })
                                            }
                                        });
                                }
                            }  // client.bind (real credential);
                        });
                    }
                });
        }
        else {
            //guest role external client for futureee
            res.status(500).send({ error: 'Invalid request' });
        }
    }
    catch (err) {
        console.log('err in catch');
        console.log(err);
        response.status(500).send({ error: err });
    }
}

exports.admin_login = async (request, response) => {
    console.log('admin login');
    console.log(request.body);
    const email = request.body.email.toLowerCase();
    const password = request.body.password;
    console.log(email, password)
    try {
        console.log("asasas")
        console.log(email, password)
        await User.findOne({ where: { email: email, portal: 'gpac', role: 'admin' } })
            .then(async function (user) {
                console.log(user)
                if (!user) {
                    console.log('no user')
                    // logger.warn({Message:'User does not exist - Admin failed login attempt'})
                    response.status(400).send({ error: NO_EMAIL_REGISTERED });
                }
                else if (user.admin_status != true) {
                    console.log('You are not admin')
                    // logger.warn({Message:'Incorrect role access - Admin failed login attempt'});
                    response.status(401).send({ error: UNAUTHORIZED_ADMIN });
                }
                else if (user && !user.validPassword(password)) {
                    console.log('incorect password')
                    // logger.warn({Message:'Incorrect password - Admin failed login attempt'});
                    response.status(400).send({ error: INCORRECT_PASSWORD });
                }
                else {
                    let secret = ""; secret = Speakeasy.generateSecret({ length: 10 });
                    let secret_key = secret.base32;
                    var admin_param = [secret_key, email];
                    await sequelize
                        .query(INSERT_SECRET, { bind: admin_param })
                        .then(async qresponse => {
                            console.log(qresponse)
                            const token = jwt.sign({ email: user.email, role: user.role, admin_status: user.admin_status }, secret_key, { expiresIn: '10h' });
                            //  logger.info({Message:`Successful Admin login ${user.email}`});
                            const admin_tkn = [token, email];
                            await sequelize
                                .query(INSERT_TOKEN, { bind: admin_tkn })
                                .then((qres) => {
                                    console.log(qres);
                                    response.header('Authorization', 'Bearer ' + token).send({ 'token': token, 'role': user.role, 'admin_status': user.admin_status, 'email': user.email, 'name': user.username });
                                }).catch(e => { response.status(500).send({ error: "Error while inserting JWT token" }) });
                        })
                        .catch(e => {
                            console.log("In here onlyyyyyyyyyyyyy")
                            console.log(e.stack); response.status(500).send({ error: "Error in inserting Secret Key" })
                        })
                }
            });
        // response.status(200).send({Message: "Valid User"});    
    }
    catch (e) {
        console.log('error');
        console.log(e);
        // logger.error({Message:e});
        response.status(500).send({ error: "Login error" });
    }

}
