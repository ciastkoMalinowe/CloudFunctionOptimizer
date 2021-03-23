//var request = require('request');
const request = require('requestretry');
const executorConfig = require('./sqsCommand.config.js');
const aws = require("aws-sdk");
aws.config.update({
    region: 'eu-west-1'
});
const identity = function (e) {
    return e
};
function sqsCommand(ins, outs, config, cb) {

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
    

    const main = async () => {
        var sqs = new aws.SQS();

        const value = {
            body: jobMessage
        };

        const stringValue = JSON.stringify(value);

        var params = {
          "MessageBody": stringValue,
          "QueueUrl": url
        };
        
        const invokeLambda = (sqs, params) => new Promise((resolve, reject) => {
            sqs.sendMessage(params, (error, data) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(data);
                }
            });
        });

        const data = await invokeLambda(sqs, params);
        console.log(data);
        const exist = await waitAndGetResponse(data.MessageId);
        //console.log(exist);
        const request_end = Date.now();
        
        s3 = new aws.S3();
        var params = {
            Bucket: options.bucket,
            Key: "logs/" + data.MessageId
        };
        const log = await s3.getObject(params).promise().then(data => JSON.parse(data.Body.toString()));
        
        console.log("Function: " + executable + " response status code: " + 200);

        const request_duration = request_end - request_start;
        const body = log;
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
    async function waitAndGetResponse(messageId) {
      s3 = new aws.S3();
      var params = {
          Bucket: options.bucket,
          Key: "logs/" + messageId
      };
      //console.log("waiting for logs " + options.bucket + "/logs/" + messageId);
      
      let maxAttempts = 180;
      let delay = 5000;
      
      while(maxAttempts > 0) {
        maxAttempts -= 1;
        try { 
          const headCode = await s3.headObject(params).promise();
          return headCode;
        } catch (headErr) {
          if (headErr.code === 'NotFound') {
             let attempt = 180 - maxAttempts;
             console.log("Log file " + messageId + " not found, attempt " + attempt);
             await sleep(delay);
          } else {
            console.log(headErr);
            return;
          }
        }
      }
      console.log("ERROR");
      return;
//      return new Promise((resolve, reject) => {
//        s3.waitFor("objectExists", params, (error, data) => {
//            if (error) {
//              reject(error);
//            } else {
//              resolve(data);
//            }
//      });
//    });
  }

    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    const request_start = Date.now();
    main().catch(error => console.error(error));
}

exports.sqsCommand = sqsCommand;