module.exports = {
    HOST: "localhost",
    USER: "postgres",
    PASSWORD: "root",
    DB: "portal_db",
    dialect: "postgres",
    port:5433,
    dialectOptions: {
      multipleStatements: true
    },
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    
  };