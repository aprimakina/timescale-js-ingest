#!/usr/bin/env node

const { runCopy, runInsert, runAverageCount, runInit} = require("./app");
require("yargs")
  .usage("$0 <cmd>")
  .command(
    "run [option]",
    "run data ingest",
    (yargs) => {
      yargs.positional("option", {
        type: "string",
        describe: "supported options: init | insert | copy | avg",
      });
    },
    function (argv) {
      switch (argv.option) {
        case "init":
          runInit();
          break;
        case "insert":
          runInsert();
          break;
        case "copy":
          runCopy();
          break;
        case "avg":
          runAverageCount();
          break;
        default:
          console.log("Please specify supported option: init | insert | copy | avg");
      }
    }
  )
  .option("insert", {
    alias: "i",
    type: "boolean",
    description: "Insert data",
  })
  .option("copy", {
    alias: "c",
    type: "boolean",
    description: "Copy data",
  })
  .option("avg", {
    alias: "a",
    type: "boolean",
    description: "Column average",
  })
  .help().argv;
