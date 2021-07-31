module.exports = (sequelize, Sequelize) => {
    const client_details = sequelize.define("client_details", {
        request_id:{
            type: Sequelize.STRING,
            primaryKey: true,
            allowNull: false
        },
        requester_name: {
            type: Sequelize.STRING,
            allowNull: true
        },
        project_name: {
            type: Sequelize.STRING,
            allowNull: false
        },
        jo_status: {
            type: Sequelize.STRING,
            allowNull: true
        },
        jo_value: {
            type: Sequelize.STRING,
            allowNull: true
        },
        project_status: {
            type: Sequelize.STRING,
            allowNull: true
        },
        signed_off:{
            type: Sequelize.DATE
        },
        proposed_eta: {
            type: Sequelize.DATE
        },
        expected_eta: {
            type: Sequelize.DATE
        },
        project_type: {
            type: Sequelize.STRING
        },
        project_billing: {
            type: Sequelize.REAL
        },
        rfi_type:{
            type: Sequelize.STRING
        },
        client_id:{
            type:Sequelize.NUMBER
        },
        portal:{
            type: Sequelize.STRING
        },
    
    });
  
    return client_details;
  };


