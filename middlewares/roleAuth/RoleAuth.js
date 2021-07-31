const jwt = require('jsonwebtoken');

const { GET_SECRET_MANAGER, GET_SECRET } = require('../../../query')
const { UNAUTHORIZED_ACCESS } = require('../../constants/constants');

const { sequelize } = require('../../models/index');


var rolzz = require('../roles&Routes');
module.exports = () => {
  return async function (req, res, next) {
    console.log('in basic auth')
    console.log('in body')
    console.log(req.url);
    console.log(rolzz);
    const token = req.header('Authorization', 'bearer');

    console.log('token');
    console.log(token);

    // check for token

    if (!token) {
      return res.status(401).send({ error: "Access Denied!" });
      // console.log('no token')
    }
    else {
      try {
        // Verify valid Token
        console.log('verify token')
        console.log(req.body)
        console.log(req.body.email);
        var user_email = req.body.email;
        var email = user_email.toLowerCase().trim();
        var email_param = [email];
        var response = await sequelize.query(GET_SECRET, { bind: email_param });


        if (response != '') {
          console.log(response);
          var secret = response[0][0].secret_key_gpac;
          console.log('secret keyyyyyyyyyyyyyyyy')
          console.log(response);
          console.log(secret);
          if (secret != null) {
            console.log('in if because it is not null');
            //checking for tester or security head

            const decoded = jwt.verify(token, secret);
            console.log(decoded)
            var decoded_role = decoded.role.toLowerCase().trim();
            console.log(decoded_role, req.url);

            console.log(rolzz[decoded_role].includes(req.url));
            if (rolzz[decoded_role].includes(req.url)) {
              res.locals.role = decoded_role;
              next();
            }

            else {
              res.status(403).send({ error: "Access Denied " + decoded.role });

            }
          }
          else {
            console.log('in elsefgdrtrthrt');

            var response = await sequelize.query(GET_SECRET_MANAGER, { bind: email_param });


            console.log('query executed');
            console.log(response)

            var secret = response[0][0].secret_key_gpac;
            console.log(secret);
            console.log('secret aboveeeee');
            console.log(token)
            if (secret != null) {
              const decoded = jwt.verify(token, secret);
              var decoded_role = decoded.role.toLowerCase();

              if (rolzz[decoded_role].includes(req.url)) {
                res.locals.role = decoded_role;
                next();
              }

              else {
                res.status(403).send({ "Message": UNAUTHORIZED_ACCESS + decoded.role });

              }
            }
            else {
              res.status(401).send({ "Message": "Invalid User" });
            }

          }

        }
        else {
          console.log('in here because response is null');
          var response = await sequelize.query(GET_SECRET_MANAGER, { bind: email_param });


          console.log('query executed');
          console.log(response)

          var secret = response[0][0].secret_key_gpac;
          console.log(secret);
          console.log('secret aboveeeee');
          console.log(token)
          if (secret != null) {
            const decoded = jwt.verify(token, secret);
            var decoded_role = decoded.role.toLowerCase();

            if (rolzz[decoded_role].includes(req.url)) {
              res.locals.role = decoded_role;
              next();
            }

            else {
              res.status(403).send({ "Message": "Your role does not allow you to access this page" + decoded.role });
            }
          }
          else {
            res.status(401).send({ "Message": "Invalid User" });
          }


        }

      }
      catch (ex) {
        console.log(ex);
        res.status(401).send(ex);
      }

    }
  }
}