//var request = require('request');
const request = require('requestretry');
const executorConfig = require('./awsCommand.config.js');
const aws = require("aws-sdk");
aws.config.update({
    region: 'eu-west-1'
});
const identity = function (e) {
    return e
};
let times = Array(100);
times.fill(0);
let runningTasks = 0;
let index = 0;

let waiting_tasks = 0;

function awsCommand(ins, outs, config, cb) {

    const options = executorConfig.options;
    if (config.executor.hasOwnProperty('options')) {
        const executorOptions = config.executor.options;
        for (let opt in executorOptions) {
            if (executorOptions.hasOwnProperty(opt)) {
                options[opt] = executorOptions[opt];
            }
        }
    }
    options['efs'] = "/mnt/montage";
    options['task_id'] = config.id;
    const executable = config.executor.executable;
    const jobMessage = {
        "executable": executable,
        "args": config.executor.args,
        "env": (config.executor.env || {}),
        "inputs": ins.map(identity),
        "outputs": outs.map(identity),
        "options": options
    };

    console.log("Time: " + " Executing:  " + JSON.stringify(jobMessage));

    const functionType = config.deploymentType ? config.deploymentType : executorConfig.functionType;
    const url = executorConfig.resources[functionType];

    const lambda = new aws.Lambda();

    const main = async () => {
        const invokeLambda = (lambda, params) => new Promise((resolve, reject) => {
            lambda.invoke(params, (error, data) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(data);
                }
            });
        });


        const value = {
            body: jobMessage
        };

        const stringValue = JSON.stringify(value);

        const params = {
            FunctionName: url,
            Payload: stringValue
        };
        
        //every batch of 50 tasks is delayed by 25s to prevent InvalidSignatureException
        // while ((Date.now() - times[index]) < 25000) { //25 sec
        //    await sleep((Date.now() - times[index]));
        //}
        //times[index] = Date.now();
        //index = (index+1)%50;
        //runningTasks++;
        
        waiting_tasks += 1;
        await sleep(Math.floor(waiting_tasks/50)*25000);
        
        const result = await invokeLambda(lambda, params);
        const request_end = Date.now();
        
        waiting_tasks -= 1;

        console.log("Function: " + executable + " response status code: " + result.StatusCode);

        const request_duration = request_end - request_start;
        console.log(result.Payload);
        const body = JSON.parse(JSON.parse(result.Payload).body);
        console.log(body);
        body['id'] = config.id;
        body['resource'] = functionType;
        body['request_start'] = request_start;
        body['request_end'] = request_end;
        body['request_duration'] = request_duration;
        body['type'] = functionType;
        body['provider'] = executorConfig.provider;

        console.log("Response: " + JSON.stringify(body));
        console.log('Success!');
        cb(null, outs);
    };
    
    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    const request_start = Date.now();
    main().catch(error => console.error(error));
}

exports.awsCommand = awsCommand;