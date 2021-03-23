const request = require('requestretry');
const aws = require("aws-sdk");
const s3 = new aws.S3();
const s3LogCheckRetryFrequency = 5 * 1000;

async function awsLambdaCommand(ins, outs, config, cb) {

    const executorConfig = await getConfig(config.workdir);

    const options = executorConfig.options;
    if (config.executor.hasOwnProperty('options')) {
        let executorOptions = config.executor.options;
        for (let opt in executorOptions) {
            if (executorOptions.hasOwnProperty(opt)) {
                options[opt] = executorOptions[opt];
            }
        }
    }

    let logName = (Math.random() * 1e12).toString(36);

    options['efs'] = "/mnt/montage";
    options['task_id'] = config.id;
    const executable = config.executor.executable;
    const jobMessage = {
        "executable": executable,
        "args": config.executor.args,
        "env": (config.executor.env || {}),
        "inputs": ins.map(i => i),
        "outputs": outs.map(o => o),
        "options": options,
        "stdout": config.executor.stdout,
        "logName": logName
    };

    let functionType = config.deploymentType ? config.deploymentType : executorConfig.functionType;
    let url = executorConfig.resources[functionType];
    const lambda = new aws.Lambda();
    console.log("Executing: " + JSON.stringify(jobMessage) + "@" + url);
    
    const value = {
        body: jobMessage
    };
    const stringValue = JSON.stringify(value);

    const params = {
        FunctionName: url,
        InvocationType: 'Event',
        Payload: stringValue
    };

    const fireTime = Date.now();

    invokeLambda(params)
        .then(async function (response) {
            await waitForLogs(1)
            console.log("Lambda task: " + executable + " completed successfully.");
            cb(null, outs);
        })
        .catch(function (error) {
            console.log("Function: " + executable + " error: " + error);
            cb(error, outs);
        });

    function invokeLambda(params) {
    
        return new Promise((resolve, reject) => {
    
            lambda.invoke(params, (err,data) => {
                if (err) {
                    console.log(err, err.stack);
                    reject(err);
                }
                else {
                    console.log(data);
                    resolve(data);
                }
            });     
        });
    }

    async function waitForLogs(retry) {
        if ((retry * s3LogCheckRetryFrequency) / 1000 > 900) { // lambda can execute up to 900 seconds
            console.log("Error - waiting over 15 minutes. Terminating.");
            cb("Error", outs);
        }
        await getS3Logs()
            .catch(() => {
                return sleep(s3LogCheckRetryFrequency)
                    .then(waitForLogs.bind(null, retry + 1));
            });
    }

    async function getS3Logs() {
        const params = {
            Bucket: options.bucket,
            Key: "logs/" + logName
        };
        await s3.getObject(params).promise().then(async function (data) {
           // console.log("Metrics: task: " + config.name + " fire time " + fireTime + " " + data.Body.toString());
            const endTime = Date.now();
            const body = JSON.parse(data.Body.toString());
            console.log(body);
            body['id'] = config.id;
            body['resource'] = functionType;
            body['request_start'] = fireTime;
            body['request_end'] = endTime;
            body['request_duration'] = endTime - fireTime;
            body['type'] = functionType;
            body['provider'] = executorConfig.provider;
    
            console.log("Response: " + JSON.stringify(body));
        });
    }

    function retry(err, response) {
        console.log(response.statusCode);
     //   if (response.statusCode === 502 || response.statusCode === 400 || response.statusCode === 500) {
    //        console.log("Error: " + err + ", retrying " + executable);
   //         return true;
    //    }
   //     if (response.statusCode === 504) {
   //         console.log(executable + " timeout!")
   //     }
        return false;
    }

    async function getConfig(workdir) {
        let config;
        try {
            config = require(workdir + "/awsLambdaCommand.config.js");
        } catch (e) {
            console.log("No config in " + workdir + ", loading config from default location: .");
            config = require("./awsLambdaCommand.config.js");
        }
        return config;
    }

    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

exports.awsLambdaCommand = awsLambdaCommand;
