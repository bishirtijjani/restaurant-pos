const mongoose = require("mongoose");

module.exports = connectToDB = () => {
  mongoose
    .connect(process.env.MONGODB_CONNECTION_STRING, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => {
      console.log("Database connected successfully");
    })
    .catch((err) => console.error("Databse connection error:", err));
};
