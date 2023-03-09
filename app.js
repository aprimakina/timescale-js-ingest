const {
  insertData,
  setupDbSchema,
  copyData,
  countAverage,
} = require("./src/buildQueries");

const setupFilePath = "./src/data/nyc_data.sql";
const dataFilePath = "./src/data/nyc_data_rides.csv";

module.exports = {
  runInit () {
    try {
      console.log("Setting up DB schema...");
      setupDbSchema(setupFilePath);
    } catch (err) {
      console.log(err);
    }
  },
  runCopy() {
    try {
      console.log("Copying data...");
      // Copy data via single connection
      copyData(dataFilePath);
    } catch (err) {
      console.log(err);
    }
  },
  runInsert() {
    try {
      console.log("Inserting data...");
      // Insert data in bulks via N connections. Number of connections is configurable in ./src/db.js
      insertData(dataFilePath);
    } catch (err) {
      console.log(err);
    }
  },
  runAverageCount() {
    try {
      countAverage("trip_distance");
    } catch (err) {
      console.log(err);
    }
  },
};
