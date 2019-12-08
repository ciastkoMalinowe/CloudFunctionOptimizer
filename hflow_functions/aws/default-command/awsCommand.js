//var request = require('request');
const request = require('requestretry');
const executorConfig = require('./awsCommand.config.js');
const aws = require("aws-sdk");
aws.config.update({
    region: 'eu-central-1',
});
const identity = function (e) {
    return e
};

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
            FunctionName: 'aws-executor-ellipsoids-dev-aws-executor-128',
            Payload: stringValue
        };

        const result = await invokeLambda(lambda, params);
        const request_end = Date.now();

        console.log("Function: " + executable + " response status code: " + result.StatusCode);

        const request_duration = request_end - request_start;
        const body = JSON.parse(JSON.parse(result.Payload).body);
        body['id'] = config.id;
        body['resource'] = functionType;
        body['request_start'] = request_start;
        body['request_end'] = request_end;
        body['request_duration'] = request_duration;
        body['provider'] = executorConfig.provider;
        body['type'] = functionType;

        console.log(body);
        console.log('Success!');
        cb(null, outs);
    };


    const request_start = Date.now();
    main().catch(error => console.error(error));
}

exports.awsCommand = awsCommand;