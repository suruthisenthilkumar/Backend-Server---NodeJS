const dbConfig = require("../DB/db.config.js");

const Sequelize = require("sequelize");
const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
  host: dbConfig.HOST,
  dialect: dbConfig.dialect,
  port:dbConfig.port,
  operatorsAliases: false,
  pool: {
    max: dbConfig.pool.max,
    min: dbConfig.pool.min,
    acquire: dbConfig.pool.acquire,
    idle: dbConfig.pool.idle
  }
});

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.performance_questn = require("./performance_qns.model")(sequelize, Sequelize);
db.performance_ans = require("./performance_ans.model")(sequelize, Sequelize);
db.users = require("./users.model")(sequelize, Sequelize);
db.client_details = require("./client_details.model")(sequelize, Sequelize);
db.clients = require("./clients.model")(sequelize, Sequelize);
db.config = require("./config.model")(sequelize, Sequelize);
db.sme_details = require("./sme_details.model")(sequelize, Sequelize);

module.exports = db;
