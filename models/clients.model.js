module.exports = (sequelize, Sequelize) => {
    const clients = sequelize.define("clients", {
        email:{
            type: Sequelize.STRING,
            allowNull: false
        },
        client_name: {
            type: Sequelize.STRING,
            allowNull: false
        },
        cluster_head_dlt:{
            type: Sequelize.STRING,
            allowNull: false
        },
        geography:{
            type: Sequelize.STRING,
            allowNull: false
        },
        dlt2: {
            type: Sequelize.STRING,
            allowNull: true
        },
        token:{
            type: Sequelize.STRING,
            allowNull: true
        },
        secret_key: {
            type: Sequelize.STRING
        },
        portal:{
            type: Sequelize.STRING
        },
        token_gpac:{
            type: Sequelize.STRING,
            allowNull: true
        },
        secret_key_gpac: {
            type: Sequelize.STRING
        },
    });
  
    return clients;
  };


