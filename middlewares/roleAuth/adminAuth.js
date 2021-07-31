const jwt = require('jsonwebtoken');

const { GET_SECRET } = require('../../../query')
const { UNAUTHORIZED_ACCESS } = require('../../constants/constants');

const { sequelize } = require('../../models/index');


var rolzz = require('../roles&Routes');
module.exports = () => {
  return async function (req, res, next) {
    console.log('in admin auth')
    console.log('in body')
    console.log(rolzz);
    const token = req.header('Authorization', 'bearer');
    if (!token) {
      return res.status(401).send({ error: "Access Denied!" });
    }
    else {
      try {
        // Verify valid Token
        console.log('verify token')
        var user_email = req.body.email;
        var email = user_email.toLowerCase().trim();
        var email_param = [email];
        var response = await sequelize.query(GET_SECRET, { bind: email_param });
        if (response != '') {
          var secret = response[0][0].secret_key_gpac;
          console.log('secret keyyyyyyyyyyyyyyyy')
          console.log(secret);
          if (secret != null) {
            const decoded = jwt.verify(token, secret);
            console.log(decoded)
            var decoded_role = decoded.role.toLowerCase().trim();
            var decoded_admin_status = decoded.admin_status;
            console.log(decoded_role, req.url);
            console.log(rolzz[decoded_role].includes(req.url));
            if(decoded_role==='admin'|| decoded_role==='performancehead'||decoded_role==='performanacelead'){
                if(decoded_admin_status===true&&rolzz[decoded_role].includes(req.url)){
                    res.locals.role = decoded_role;
                    next();
                  }else {
                    res.status(403).send({ error: "Access Denied " + decoded.role });
                  }
            }else{
                res.status(403).send({ "Message": UNAUTHORIZED_ACCESS + decoded.role });
            }
          }else{
              res.status(403).send({ "Message": UNAUTHORIZED_ACCESS  });
            }
        }else{
            res.status(403).send({ "Message": UNAUTHORIZED_ACCESS });
        }
        
      }
      catch (ex) {
        console.log(ex);
        res.status(401).send(ex);
      }

    }
  }
}