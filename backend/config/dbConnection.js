const mongoose = require("mongoose");
const logger = require("../utils/logger");

module.exports = connectToDB = () => {
  mongoose
    .connect(process.env.MONGODB_CONNECTION_STRING)
    .then(() => {
      logger.info("Database connected successfully");
    })
    .catch((err) => logger.error("Database connection error", { error: err.message }));
};
