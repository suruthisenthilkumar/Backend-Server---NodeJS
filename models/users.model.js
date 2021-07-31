const bcrypt = require('bcryptjs');
 module.exports = (sequelize, Sequelize) => {
    const User = sequelize.define("users", {
        username: {
            type: Sequelize.STRING,
            unique: true,
            allowNull: false
        },
        email: {
            type: Sequelize.STRING,
            unique: true,
            allowNull: false
        },
        password: {
            type: Sequelize.STRING,
            allowNull: false
        },
        role: {
            type:Sequelize.STRING,
            allowNull: false
        },
        designation: {
            type: Sequelize.STRING,
            
        },
        admin_status: {
            type: Sequelize.BOOLEAN,
            
        },
        jwt_token: {
            type: Sequelize.STRING,
            allowNull: true
        },
      portal:{
          type: Sequelize.STRING,
          allowNull: false
      }
    } , 
    {   hooks: {
        beforeCreate: (user) => {
          const salt = bcrypt.genSaltSync();
          user.password = bcrypt.hashSync(user.password, salt);
        }}
    });
   
  
    User.prototype.validPassword = function (password) {
        console.log("validate pwd");
        console.log(password)
      return bcrypt.compareSync(password, this.password);
      };    
  
    return User;
  };




// export User model for use in other files.