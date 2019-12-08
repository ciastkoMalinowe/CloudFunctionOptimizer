const csvParser = require('fast-csv');
const lineReader = require('line-reader');
const fs = require('fs');


const inputFile = process.argv[2];
const outputFile = process.argv[3];

normalize(inputFile);

function normalize(file) {

    let allJsons = [];
    let minTimestamp = Number.MAX_SAFE_INTEGER;

    function saveToFile() {
        console.log("Saving to: " + outputFile);
        for (const elementJson of allJsons) {
            fs.appendFileSync(outputFile, `${elementJson.executable} ${elementJson.id} ${elementJson.resource} ${elementJson.request_start}`
                + ` ${elementJson.request_end} ${elementJson.request_duration} ${elementJson.start} ${elementJson.end}`
                + ` ${elementJson.end - elementJson.start} ${elementJson.downloading_duration} ${elementJson.execution_duration} ${elementJson.uploading_duration} ${elementJson.resource}\n`, console.err);
        }
    }

    lineReader.eachLine(inputFile, function (line, last) {
        console.log(line);
        allJsons.push(JSON.parse(line));
    }, saveToFile);

    // csvParser
    //   .fromPath(file, {delimiter: ' '})
    //   .on("data", data => {
    //     let request_start = data[3];
    //     if (request_start < minTimestamp) minTimestamp = request_start;
    //     dataArr.push(data);
    //   })
    //   .on("end", function () {
    //     dataArr.forEach(data => {
    //       let task = data[0];
    //       let id = data[1];
    //       let resource = data[2];
    //       let request_start = data[3];
    //       let request_end = data[4];
    //       let request_duration = data[5];
    //       let start = data[6];
    //       let end = data[7];
    //       let time = data[8];
    //       let downloaded = data[9];
    //       let executed = data[10];
    //       let uploaded = data[11];
    //       let type = data[12];
    //
    //       let normalized_start = start - minTimestamp;
    //       let normalized_end = end - minTimestamp;
    //
    //       let normalized_request_start = request_start - minTimestamp;
    //       let normalized_request_end = request_end - minTimestamp;
    //       fs.appendFileSync(outputFile,`${task} ${id} ${resource} ${normalized_request_start}`
    //         + ` ${normalized_request_end} ${request_duration} ${normalized_start} ${normalized_end}`
    //         + ` ${time} ${downloaded} ${executed} ${uploaded} ${type}\n`, console.err);
    //     })
    //   });
}
