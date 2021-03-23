const csvParser = require('fast-csv');
const lineReader = require('line-reader');
const fs = require('fs');


const inputFile = process.argv[2];
const outputFile = process.argv[3];
const algorithm = process.argv[4];

normalize(inputFile);

function normalize(file) {

    let allJsons = [];
    let minTimestamp = Number.MAX_SAFE_INTEGER;

    function saveToFile() {
        for (const elementJson of allJsons) {
            if (elementJson.request_start < minTimestamp) minTimestamp = elementJson.request_start;
        }
        console.log("Saving to: " + outputFile);
        for (const elementJson of allJsons) {
            fs.appendFileSync(outputFile, `${elementJson.executable} ${elementJson.id} ${elementJson.resource} ${elementJson.request_start - minTimestamp}`
                + ` ${elementJson.request_end - minTimestamp} ${elementJson.request_duration} ${elementJson.start} ${elementJson.end}`
                + ` ${elementJson.end - elementJson.start} ${elementJson.downloading_duration} ${elementJson.execution_duration} ${elementJson.uploading_duration} ${algorithm}\n`, console.err);
        }
    }

    lineReader.eachLine(inputFile, function (line, last) {
        console.log(line);
        allJsons.push(JSON.parse(line));
    }, saveToFile);
}
