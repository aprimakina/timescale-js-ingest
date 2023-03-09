## timescale-js-ingest

**Quickstart**

Install [NodeJS](https://nodejs.org/en/download/)
```
git clone https://github.com/aprimakina/timescale-js-ingest
cd timescale-js-ingest
npm install
node cmd.js run [init | insert | copy | avg]
```

The dataset in `./data/nyc_data_rides.csv` is just a 10 lines sample, a 1.68 GB dataset can be downloaded from [nyc_data.tar.gz](https://timescaledata.blob.core.windows.net/datasets/nyc_data.tar.gz)  provided by [NY TLC](https://www1.nyc.gov/site/tlc/about/tlc-trip-record-data.page). 