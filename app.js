const { insertData, setupTable, copyData } = require("./db/ingest");

const setupFilePath = "./data/nyc_data.sql";
const dataFilePath = "./data/nyc_data_rides.csv";

(async () => {
  try {
    await setupTable(setupFilePath);

    // Copy data via single connection
    copyData(dataFilePath);

    // Insert data in bulks via N connections. Number of connections is configurable in ./db/db.js
    // insertData(dataFilePath);
  } catch (err) {
    console.log(err);
  }
})();
