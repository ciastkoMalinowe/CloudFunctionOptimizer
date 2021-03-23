var fs = require('fs');

function createDatString(ifCoord, numberOfParticles, numberOfSpecies,
                         forceScalingFactor, rotationScalingFactor, diameterIncreasingFactor,
                         cellsX, cellsY, cellsZ, constractionRate, initialPackingDensity,
                         maximalNumberOfSteps, isConstantVolume, numberOfParts,
                         diameterOfParts1, diameterOfParts2, diameterOfParts3,
                         numberOfLinesPerPage, numberOfStepsBetweenPrintouts,
                         numberOfStepsBetweenCoord, numberOfStepsBetweenRotations) {
    return '1.1  BASIC CONTROL DATA\n'
        + '=true if coordinates are to be saved    (         Lreslt_x)      '
        + ifCoord
        + '\n'
        + '2.1  PRINCIPAL SYSTEM PARAMETERS\n'
        + 'Number of particles                     (         No_parts)         '
        + numberOfParticles
        + '\n'
        + 'Number of species                       (       No_species)         '
        + numberOfSpecies
        + '\n'
        + 'Force scaling factor                    (          Epsilon)         '
        + forceScalingFactor
        + '\n'
        + 'Rotation scaling factor                 (          Eps_rot)         '
        + rotationScalingFactor
        + '\n'
        + 'Diameter increasing factor              (        Diam_incr)         '
        + diameterIncreasingFactor
        + '\n'
        + 'Number of cells in x direction          (       No_cells_x)         '
        + cellsX
        + '\n'
        + 'Number of cells in y direction          (       No_cells_y)         '
        + cellsY
        + '\n'
        + 'Number of cells in z direction          (       No_cells_z)         '
        + cellsZ
        + '\n'
        + 'Contraction rate of outer diameter      (             Ntau)         '
        + constractionRate
        + '\n'
        + 'Initial packing density                 (            Pnom0)         '
        + initialPackingDensity
        + '\n'
        + 'Maximal number of steps                 (        Max_steps)     	 '
        + maximalNumberOfSteps
        + '\n'
        + '= true if constant volume run          (          Leq_vol)         '
        + isConstantVolume
        + '\n'
        + 'Number of parts (species 0)             (           Number)         '
        + numberOfParts
        + '\n'
        + 'Diameter of parts (species 0)           (         Diameter)         '
        + diameterOfParts1
        + '\n'
        + 'Diameter of parts (species 0)           (         Diameter)         '
        + diameterOfParts2
        + '\n'
        + 'Diameter of parts (species 0)           (         Diameter)         '
        + diameterOfParts3
        + '\n'
        + '4.1  PRINTOUT CONTROL\n'
        + 'Number of lines per page                (        Npage_len)         '
        + numberOfLinesPerPage
        + '\n'
        + 'number of steps between printouts       (      Nprint_step)         '
        + numberOfStepsBetweenPrintouts
        + '\n'
        + 'number of steps between coord. storage  (       Nrslt_step)         '
        + numberOfStepsBetweenCoord
        + '\n'
        + 'number of steps between rotations       (        Nrot_step)         '
        + numberOfStepsBetweenRotations;
}

function createDat(filename) {
    var file = fs.readFileSync('data.json');
    var json = JSON.parse(file);
    var iteration = filename.split('.')[0];

    var myFile = createDatString(json[iteration].ifCoord, json[iteration].numberOfParticles,
        json[iteration].numberOfSpecies, json[iteration].forceScalingFactor,
        json[iteration].rotationScalingFactor, json[iteration].diameterIncreasingFactor,
        json[iteration].cellsX, json[iteration].cellsY, json[iteration].cellsZ,
        json[iteration].constractionRate, json[iteration].initialPackingDensity,
        json[iteration].maximalNumberOfSteps, json[iteration].isConstantVolume,
        json[iteration].numberOfParts, json[iteration].diameterOfParts1,
        json[iteration].diameterOfParts2, json[iteration].diameterOfParts3,
        json[iteration].numberOfLinesPerPage, json[iteration].numberOfStepsBetweenPrintouts,
        json[iteration].numberOfStepsBetweenCoord,
        json[iteration].numberOfStepsBetweenRotations);

    fs.writeFile(filename, myFile, function (err) {
        if (err) {
            console.log("Couldnt create " + filename + " file");
        } else {
        }
    });
}

createDat(process.argv[process.argv.length - 1]);