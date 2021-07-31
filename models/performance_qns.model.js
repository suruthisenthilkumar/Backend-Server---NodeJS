module.exports = (sequelize, Sequelize) => {
    // const performance_questn = sequelize.define("performance_questn", {
        const performance_questn ={
        quest_type_id: {
            type: Sequelize.STRING,
            allowNull: false
    
        },
        questions: {
            type: Sequelize.STRING,
            allowNull: false
        },
        details:{
            type: Sequelize.JSON,
            allowNull: false
        }}
    // });
  
    return performance_questn;
  };
