//var request = require('request');
const request = require('requestretry');
const executorConfig = require('./awsCommandEFS.config.js');
const identity = function (e) {return e};

function retryStrategy(err, response, body) {
    return err || response.statusCode >= 400 || request.RetryStrategies.HTTPOrNetworkError(err, response);
}

function awsCommandEFS(ins, outs, config, cb) {

    let options = executorConfig.options;
    if (config.executor.hasOwnProperty('options')) {
        let executorOptions = config.executor.options;
        for (let opt in executorOptions) {
            if (executorOptions.hasOwnProperty(opt)) {
                options[opt] = executorOptions[opt];
            }
        }
    }
    options['efs'] = "/mnt/montage/";
    options['task_id'] = config.id;
    let executable = config.executor.executable;
    let jobMessage = {
        "executable": executable,
        "args": config.executor.args,
        "env": (config.executor.env || {}),
        "inputs": ins.map(identity),
        "outputs": outs.map(identity),
        "options": options
    };

    console.log("Executing:  " + JSON.stringify(jobMessage));

    let functionType = config.deploymentType ? config.deploymentType : executorConfig.functionType;
    let url = executorConfig.resources[functionType];

    function optionalCallback(err, response, body) {
        if (err) {
            console.log("Function: " + executable + " error: " + err);
            cb(err, outs);
            return
        }
        if (response) {
            console.log("Function: " + executable + " response status code: " + response.statusCode + " number of request attempts: " + response.attempts)
        }
        //console.log("Function: " + executable + " id: " + config.id + " resource: " + functionType + " data: " + body.message);
        //cb(null, outs);

        const request_end = Date.now(); 
        const request_duration = request_end - request_start;
        console.log(body);
        const body2 = body;
        console.log(body2);
        body2['id'] = config.id;
        body2['resource'] = functionType;
        body2['request_start'] = request_start;
        body2['request_end'] = request_end;
        body2['request_duration'] = request_duration;
        body2['type'] = functionType;
        body2['provider'] = executorConfig.provider;

        console.log("Response: " + JSON.stringify(body2));
        console.log('Success!');
        cb(null, outs);
    }

    const request_start = Date.now();
    request.post({
        retryDelay: 1000,
        timeout: 900000,
        retryStrategy: retryStrategy,
        maxAttempts: 30,
        url: url,
        json: jobMessage,
        headers: {'Content-Type': 'application/json', 'Accept': '*/*'}
    }, optionalCallback);

}

exports.awsCommandEFS = awsCommandEFS;