const { parse } = require("csv-parse");
const fs = require("node:fs");
const db = require("./db");

module.exports = {
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
          insert(recordsInBatch);

          recordsCounter = 0;
          recordsInBatch = [];
          stream.resume();
        }
      })
      .on("end", async () => {
        insert(recordsInBatch);
      });
  },

  copyData(filePath) {
    const sourceStream = fs.createReadStream(filePath);
    return db.copy(sourceStream, "rides", true);
  },

  async setupTable(filePath) {
    const sqlData = await fs.readFileSync(filePath, "utf8");
    return db.query(sqlData);
  },
};

const insert = (recordsInBatch) => {
  db.query(
    `INSERT INTO rides VALUES ${recordsInBatch.map((record, i) => {
      return `('${record.join("','")}')${
        i === recordsInBatch.length - 1 ? ";" : ""
      }`;
    })}`,
    true
  );
};
