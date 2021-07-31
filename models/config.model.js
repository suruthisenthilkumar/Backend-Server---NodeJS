
module.exports = (sequelize, Sequelize) => {
    const configs = sequelize.define("configs", {
        gsac_email: {
            type: Sequelize.STRING,
            allowNull: false
        },
        gsac_password: {
            type: Sequelize.STRING,
            allowNull: false
        },
        manager_email: {
            type:Sequelize.STRING,
            allowNull: false
        }
    });
  
    return configs;
  };


