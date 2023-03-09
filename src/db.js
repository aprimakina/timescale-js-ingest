const { Pool } = require("pg");
const { pipeline } = require("node:stream/promises");
const { from: copyFrom } = require("pg-copy-streams");
const dotenv = require("dotenv");
const { delay } = require("./utils");

dotenv.config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  max: 7,
  idleTimeoutMillis: 1000,
  connectionTimeoutMillis: 10000,
});

let connectCount = 0;
let startTime;

pool.on("connect", () => {
  connectCount++;
  console.log("Connections count: " + connectCount);
});

pool.on("remove", () => {
  connectCount--;
  console.log("Connections count: " + connectCount);

  if (connectCount === 0 && startTime) {
    console.log(
      `duration: ${Date.now() - startTime - pool.options.idleTimeoutMillis} ms`
    );
    startTime = undefined;
  }
});

module.exports = {
  getPool() {
    return pool;
  },

  async query(text, shouldMeasureTime) {
    if (shouldMeasureTime && !startTime) {
      startTime = Date.now();
    }
    const client = await pool.connect();
    try {
      return await client.query(text);
    } catch (err) {
      console.log(err.stack);
    } finally {
      client.release();
    }
  },

  async copy(sourceStream, tableName, shouldMeasureTime) {
    if (shouldMeasureTime && !startTime) {
      startTime = Date.now();
    }
    const client = await pool.connect();
    const ingestStream = client.query(
      copyFrom(`COPY ${tableName} FROM STDIN DELIMITER ','`)
    );
    try {
      await pipeline(sourceStream, ingestStream);
    } catch (err) {
      console.log(err.stack);
    } finally {
      client.release();
    }
  },

  async waitForFreeConnections() {
    let { waitingCount } = pool;
    console.log(waitingCount);
    while (waitingCount > 1) {
      await delay(5);
      waitingCount = pool.waitingCount;
    }
  },
};
