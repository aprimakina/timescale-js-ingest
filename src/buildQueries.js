const { parse } = require("csv-parse");
const fs = require("node:fs");
const db = require("./db");

module.exports = {
  async setupDbSchema(filePath) {
    const sqlData = await fs.readFileSync(filePath, "utf8");
    return db.query(sqlData);
  },

  insertData(filePath) {
    let recordsInBatch = [];
    let recordsCounter = 0;
    const BATCH_SIZE = 1000;

    const stream = fs
      .createReadStream(filePath)
      .pipe(
        parse({
          delimiter: ",",
          //  from_line: 2, // skip header
        })
      )
      .on("error", (error) => console.error(error))
      .on("data", async (row) => {
        recordsInBatch.push(row);
        recordsCounter += 1;
        if (recordsCounter >= BATCH_SIZE) {
          stream.pause();

          await db.waitForFreeConnections();
          insertBatch(recordsInBatch);

          recordsCounter = 0;
          recordsInBatch = [];
          stream.resume();
        }
      })
      .on("end", async () => {
        insertBatch(recordsInBatch);
      });
  },

  copyData(filePath) {
    const sourceStream = fs.createReadStream(filePath);
    return db.copy(sourceStream, "rides", true);
  },

  async countAverage(column) {
    const sqlStatement = `SELECT AVG(${column})::numeric(10,2) FROM rides;`;
    const { rows } = await db.query(sqlStatement);
    console.log(rows[0]);
  },
};

const insertBatch = (recordsInBatch) => {
  db.query(
    `INSERT INTO rides VALUES ${recordsInBatch.map((record, i) => {
      return `('${record.join("','")}')${
        i === recordsInBatch.length - 1 ? ";" : ""
      }`;
    })}`,
    true
  );
};
