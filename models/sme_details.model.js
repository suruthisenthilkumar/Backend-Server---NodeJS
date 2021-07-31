
// export Task model for use in other files.



module.exports = (sequelize, Sequelize) => {
    const sme_details = sequelize.define("sme_details", {
        id:{
            type:Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey:true
        },
        qa_id:{
            type: Sequelize.INTEGER,
            allowNull: false
        },
        req_id: {
            type: Sequelize.STRING,
            allowNull: false
        }
    });
  
    return sme_details;
  };





