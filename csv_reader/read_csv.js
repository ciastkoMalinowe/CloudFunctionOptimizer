const Promise = require('bluebird');
const fs = require('fs');
const parse = require('csv-parse');

const executionData = 'grafana_data_export.csv';
const pricingData = 'gcf_pricing.csv';
const executionTime = '0.25.csv';

let parseFile = function (file, delimiter) {
  return new Promise(function (resolve, reject) {
    let parser = parse({delimiter: delimiter, from: 2},
      function (err, data) {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
        parser.end();
      });
    fs.createReadStream(file).pipe(parser);
  })
};

let parsedTimes = parseFile(executionData, ';')
  .then(data => {
    let times = {"1024": 0, "128": 0, "2048": 0, "256": 0, "512": 0};
    let count = 0;

    data.forEach(function (line) {
      if (!(line.indexOf("undefined") > -1)) {
        times["1024"] += parseFloat(line[1]);
        times["128"] += parseFloat(line[2]);
        times["2048"] += parseFloat(line[3]);
        times["256"] += parseFloat(line[4]);
        times["512"] += parseFloat(line[5]);
        count++;
      }
    });

    return {
      "128": times["128"] / count,
      "256": times["256"] / count,
      "512": times["512"] / count,
      "1024": times["1024"] / count,
      "2048": times["2048"] / count
    };
  });

let parsePrices = parseFile(pricingData, ';')
  .then(data => {
    let price = {};
    data.forEach(line => price[line[0]] = line[1]);
    return price;
  });

let total_cost = parsedTimes.then(mean_times => {
  return parsePrices.then(prices => {
    return {
        "128": prices["128"] * (mean_times["128"] * 10),
        "256": prices["256"] * (mean_times["256"] * 10),
        "512": prices["512"] * (mean_times["512"] * 10),
        "1024": prices["1024"] * (mean_times["1024"] * 10),
        "2048": prices["2048"] * (mean_times["2048"] * 10)
      };
  })
});


let execution_times = parseFile(executionTime, ' ')
  .then(data => {
    let functionTime = {
      mProjectPP: 0,
      mDiffFit: 0,
      mConcatFit: 0,
      mBgModel: 0,
      mBackground: 0,
      mImgtbl: 0,
      mAdd: 0,
      mShrink: 0,
      mJPEG: 0 };

    let count = {
      mProjectPP: 0,
      mDiffFit: 0,
      mConcatFit: 0,
      mBgModel: 0,
      mBackground: 0,
      mImgtbl: 0,
      mAdd: 0,
      mShrink: 0,
      mJPEG: 0 };

    data.forEach(function (line) {
      functionTime[line[0]] += parseFloat(line[3]);
      count[line[0]] = count[line[0]] + 1;
    });

    return {
      mProjectPP: functionTime.mProjectPP/count.mProjectPP,
      mDiffFit: functionTime.mDiffFit/count.mDiffFit,
      mConcatFit: functionTime.mConcatFit/count.mConcatFit,
      mBgModel: functionTime.mBgModel/count.mBgModel,
      mBackground: functionTime.mBackground/count.mBackground,
      mImgtbl: functionTime.mImgtbl/count.mImgtbl,
      mAdd: functionTime.mAdd/count.mAdd,
      mShrink: functionTime.mShrink/count.mShrink,
      mJPEG: functionTime.mJPEG/count.mJPEG
    };

  });

exports.total_cost = total_cost;
exports.mean_times = parsedTimes;
exports.execution_times = execution_times;
