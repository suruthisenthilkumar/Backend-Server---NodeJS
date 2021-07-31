
module.exports = (sequelize, Sequelize) => {
    const performance_ans = sequelize.define("performance_ans", {
        id:{
            type:Sequelize.INTEGER,
            autoIncrement: true,
            allowNull:false
        },
        request_id: {
            primaryKey:true,
            type: Sequelize.STRING,
            allowNull: false,
        },
        question_id: {
            primaryKey:true,
            type:Sequelize.INTEGER,
            allowNull: false,
        },
        answers: {
            type: Sequelize.TEXT,
            allowNull: true
        }
    }
    // ,
    // { indexes: [
    //     {
    //         unique: true,
    //         fields: ['request_id', 'question_id']
    //     }
    // ]}
    );
    return performance_ans;
  };


