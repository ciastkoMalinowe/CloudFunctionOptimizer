var fs = require('fs');

function createSignalDat(wfOut, index, ifCoord, numberOfParticles,
                         numberOfSpecies, forceScalingFactor, rotationScalingFactor,
                         diameterIncreasingFactor, cellsX, cellsY, cellsZ, constractionRate,
                         initialPackingDensity, maximalNumberOfSteps, isConstantVolume,
                         numberOfParts, diameterOfParts1, diameterOfParts2, diameterOfParts3,
                         numberOfLinesPerPage, numberOfStepsBetweenPrintouts,
                         numberOfStepsBetweenCoord, numberOfStepsBetweenRotations) {

    return {
        "name": "",
        "ifCoord": ifCoord,
        "numberOfParticles": numberOfParticles,
        "numberOfSpecies": numberOfSpecies,
        "forceScalingFactor": forceScalingFactor,
        "rotationScalingFactor": rotationScalingFactor,
        "diameterIncreasingFactor": diameterIncreasingFactor,
        "cellsX": cellsX,
        "cellsY": cellsY,
        "cellsZ": cellsZ,
        "constractionRate": constractionRate,
        "initialPackingDensity": initialPackingDensity,
        "maximalNumberOfSteps": maximalNumberOfSteps,
        "isConstantVolume": isConstantVolume,
        "numberOfParts": numberOfParts,
        "diameterOfParts1": diameterOfParts1,
        "diameterOfParts2": diameterOfParts2,
        "diameterOfParts3": diameterOfParts3,
        "numberOfLinesPerPage": numberOfLinesPerPage,
        "numberOfStepsBetweenPrintouts": numberOfStepsBetweenPrintouts,
        "numberOfStepsBetweenCoord": numberOfStepsBetweenCoord,
        "numberOfStepsBetweenRotations": numberOfStepsBetweenRotations
    }
}

function createWf() {
    // main tuple
    var wfOut = [];

    // data variables
    var ifCoord = ["1"];
    var numberOfParticles = ["1000"];
    var numberOfSpecies = ["1"];
    var forceScalingFactor = ["0.1"];
    var rotationScalingFactor = ["3.00"];
    var diameterIncreasingFactor = ["0.01", "0.02"];
    var cellsX = ["20", "40"];
    var cellsY = ["20"];
    var cellsZ = ["20"];
    var constractionRate = ["56"];
    var initialPackingDensity = ["0.8"];
    var maximalNumberOfSteps = ["10000000"];
    var isConstantVolume = ["1"];
    var numberOfParts = ["1000"];
    var diameterOfParts1 = ["1.3"];
    var diameterOfParts2 = ["1.0"];
    var diameterOfParts3 = ["1.0"];
    var numberOfLinesPerPage = ["56"];
    var numberOfStepsBetweenPrintouts = ["100"];
    var numberOfStepsBetweenCoord = ["1000000"];
    var numberOfStepsBetweenRotations = ["1"];

    var lengths = [ifCoord.length, numberOfParticles.length,
        numberOfSpecies.length, forceScalingFactor.length,
        rotationScalingFactor.length, diameterIncreasingFactor.length,
        cellsX.length, cellsY.length, cellsZ.length,
        constractionRate.length, initialPackingDensity.length,
        maximalNumberOfSteps.length, isConstantVolume.length,
        numberOfParts.length, diameterOfParts1.length,
        diameterOfParts2.length, diameterOfParts3.length,
        numberOfLinesPerPage.length, numberOfStepsBetweenPrintouts.length,
        numberOfStepsBetweenCoord.length,
        numberOfStepsBetweenRotations.length];

    var counters = [lengths.length];
    var product = 1;
    for (i = 0; i < lengths.length; i++) {
        counters[i] = lengths[i];
        product *= lengths[i];
    }

    for (i = 0; i < product; i++) {
        var index = 0;
        var mySignal = [];
        mySignal = createSignalDat(wfOut, i,
            ifCoord[counters[index++] - 1],
            numberOfParticles[counters[index++] - 1],
            numberOfSpecies[counters[index++] - 1],
            forceScalingFactor[counters[index++] - 1],
            rotationScalingFactor[counters[index++] - 1],
            diameterIncreasingFactor[counters[index++] - 1],
            cellsX[counters[index++] - 1],
            cellsY[counters[index++] - 1],
            cellsZ[counters[index++] - 1],
            constractionRate[counters[index++] - 1],
            initialPackingDensity[counters[index++] - 1],
            maximalNumberOfSteps[counters[index++] - 1],
            isConstantVolume[counters[index++] - 1],
            numberOfParts[counters[index++] - 1],
            diameterOfParts1[counters[index++] - 1],
            diameterOfParts2[counters[index++] - 1],
            diameterOfParts3[counters[index++] - 1],
            numberOfLinesPerPage[counters[index++] - 1],
            numberOfStepsBetweenPrintouts[counters[index++] - 1],
            numberOfStepsBetweenCoord[counters[index++] - 1],
            numberOfStepsBetweenRotations[counters[index++] - 1]);

        mySignal.name = "signal_" + i;
        wfOut.push(mySignal);

        counters[lengths.length - 1]--;
        for (j = lengths.length - 1; j > 0; j--) {
            if (counters[j] === 0) {
                counters[j] = lengths[j];
                counters[j - 1]--;
            }
        }
    }

    fs.writeFile("data.json", JSON.stringify(wfOut, null, 2), function (err) {
        if (err) {
            return console.log(err);
        }
    });
}

createWf();
