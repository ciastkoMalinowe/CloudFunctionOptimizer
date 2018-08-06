//var request = require('request');
const request = require('requestretry');
const executor_config = require('./awsCommand.config.js');
const identity = function (e) {return e};

function awsCommand(ins, outs, config, cb) {

    let options = executor_config.options;
    if (config.executor.hasOwnProperty('options')) {
        let executorOptions = config.executor.options;
        for (let opt in executorOptions) {
            if (executorOptions.hasOwnProperty(opt)) {
                options[opt] = executorOptions[opt];
            }
        }
    }
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

    let deploymentType = config.deploymentType;
    let url = deploymentType ? executor_config.resources[deploymentType] : executor_config.default_url;
    let resource = deploymentType ? deploymentType : executor_config.default_resource;

    function optionalCallback(err, response, body) {
        if (err) {
            console.log("Function: " + executable + " error: " + err);
            cb(err, outs);
            return
        }
        if (response) {
            console.log("Function: " + executable + " response status code: " + response.statusCode + " number of request attempts: " + response.attempts)
        }
        console.log("Function: " + executable + " id: " + config.id + " resource: " + resource + " data: " + body.message);
        cb(null, outs);
    }

    request.post({
        timeout: 10,
        url: url,
        json: jobMessage,
        headers: {'Content-Type': 'application/json', 'Accept': '*/*'}
    }, optionalCallback);

}

exports.awsCommand = awsCommand;