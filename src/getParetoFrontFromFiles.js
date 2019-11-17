const pf = require('pareto-frontier');
const fs = require('fs');

const dirPath = process.argv[2];

let files = fs.readdirSync(dirPath).filter(fn => fn.match('.*pareto.*'));


let paretoFront = []

for (let file of files) {
    let array = fs.readFileSync(dirPath + "/" + file).toString().split("\n");
    for (const elem of array) {
        let sliced = elem.toString().split(',')
        paretoFront.push([Number.parseFloat(sliced[0]), Number.parseFloat(sliced[1])])
    }
}

console.log("Number of input points: " + paretoFront.length);

paretoFront = pf.getParetoFrontier(paretoFront,  { optimize: 'bottomLeft'} );
let paretoFrontWriteStream = fs.createWriteStream('every_possible_output/paretoFrontAll.txt');
paretoFront.forEach(function (point) {
    paretoFrontWriteStream.write(point.join(', ') + '\n');
});
paretoFrontWriteStream.end();