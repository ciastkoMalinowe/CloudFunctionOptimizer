var fs = require('fs');

function summary() {

    var sumFilePath = "summary.csv";

    var columnNames = "ifCoord,numberOfParticles,numberOfSpecies,forceScalingFactor,"
        + "rotationScalingFactor,diameterIncreasingFactor,"
        + "cellsX,cellsY,cellsZ,constractionRate,initialPackingDensity,"
        + "maximalNumberOfSteps,isConstantVolume,numberOfParts,"
        + "diameterOfParts1,diameterOfParts2,diameterOfParts3,"
        + "numberOfLinesPerPage,numberOfStepsBetweenPrintouts,numberOfStepsBetweenCoord,"
        + "numberOfStepsBetweenRotations,averaged" + "\n";

    fs.writeFile(sumFilePath, columnNames, function (err) {
        if (err) {
            console.log("Couldn't create " + columnNames + " file");
        } else {
        }
    });

    var file = fs.readFileSync('data.json');
    var json = JSON.parse(file);
    var iteration = json.length;

    for (let i = 0; i < iteration; i++) {
        var columnValues = json[i].ifCoord + "," + json[i].numberOfParticles
            + "," + json[i].numberOfSpecies + ","
            + json[i].forceScalingFactor + ","
            + json[i].rotationScalingFactor + ","
            + json[i].diameterIncreasingFactor + "," + json[i].cellsX + ","
            + json[i].cellsY + "," + json[i].cellsZ + ","
            + json[i].constractionRate + "," + json[i].initialPackingDensity
            + "," + json[i].maximalNumberOfSteps + ","
            + json[i].isConstantVolume + "," + json[i].numberOfParts + ","
            + json[i].diameterOfParts1 + "," + json[i].diameterOfParts2 + ","
            + json[i].diameterOfParts3 + "," + json[i].numberOfLinesPerPage
            + "," + json[i].numberOfStepsBetweenPrintouts + ","
            + json[i].numberOfStepsBetweenCoord + ","
            + json[i].numberOfStepsBetweenRotations + ","
            + fs.readFileSync('average_' + i + '.txt') + "\n";

        fs.appendFile(sumFilePath, columnValues, function (err) {
        });
    }
}

summary();
