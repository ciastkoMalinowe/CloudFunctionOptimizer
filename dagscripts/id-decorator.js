const fs = require('fs');
const path = require('path');

const dirPath = process.argv[2];

if(!dirPath){
    throw new Error("Provide valid arguments: node id-decorator.js DIR_PATH");
}

console.log(`Path to folder with DAG is ${dirPath}`);

const stats = fs.statSync(dirPath);

if(!stats.isDirectory()) {
    throw new Error("Given path is not directory");
}

fs.readdir(dirPath, (err,files) =>
    files
    .filter(file => file.endsWith(".json"))
    .forEach(file => addIDToDag(dirPath + "/" + file)
));

function addIDToDag(file) {

    fs.readFile(file, (err, dag) => {

        dag = JSON.parse(dag);

        const tasks = dag.tasks;
        let count = 1;
        tasks.forEach(task => task.config.id = count++);

        fs.writeFile(dirPath + "/output/" + path.basename(file), JSON.stringify(dag, null, 2), (err) => {
            if(err) throw err;
        })
    });
}




