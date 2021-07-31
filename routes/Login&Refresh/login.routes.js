module.exports = app => {
    const login = require("../../controllers/login.controller");

    var router = require("express").Router();

    router.post("/emailValidation",login.validateUser);

    router.post('/passwordValidation', login.validatePasskey);

    router.post('/admin', login.admin_login);
    
    app.use('/login', router);
};