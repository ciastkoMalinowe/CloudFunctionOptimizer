"use strict";

const childProcess = require("child_process");
const fs = require("fs");
const async = require("async");
const aws = require("aws-sdk");
aws.config.update({
    region: 'eu-west-1',
    addressing_style:'path'
});
const path = require("path");
const s3 = new aws.S3();
const directory = "/tmp";

module.exports.executor = function (event, context) {

    console.log(event)
    const body = event.body;
    console.log(body);
  
    const executable = body.executable;
    const args = body.args;
    const bucket_name = body.options.bucket;
    const prefix = body.options.prefix;
    const tmp_dir = body.options.efs ? body.options.efs : "/tmp";
    //const tmp_dir = "/temporary/montage";
    const inputs = [];
    for (let index = 0; index < body.inputs.length; ++index) {
      inputs.push(body.inputs[index].name);
    }
    const outputs = [];
    for (let index = 0; index < body.outputs.length; ++index) {
      outputs.push(body.outputs[index].name);
    }
    const files = inputs.slice();
    if (!fs.existsSync(__dirname + "/" + executable)) {
      files.push(executable);
    }
  
    const t_start = Date.now();
    let t_executed;
    let t_end;
  
    console.log("Executable: " + executable);
    console.log("Arguments:  " + args);
    console.log("Inputs:      " + inputs);
    console.log("Outputs:    " + outputs);
    console.log("Bucket:     " + bucket_name);
    console.log("Prefix:     " + prefix);
  
    function execute(callback) {
      let proc_name = __dirname + "/" + executable;
  
  
      if (fs.existsSync(/tmp/ + executable)) {
        proc_name = /tmp/ + executable;
        console.log("Running executable from S3");
        fs.chmodSync(proc_name, "777");
      }
      let proc;
      console.log("Running " + proc_name);
  
      if (proc_name.endsWith(".js")) {
        proc = childProcess.fork(proc_name, args, {cwd: tmp_dir});
      } else {
        process.env.PATH = ".:" + __dirname;
        proc = childProcess.spawn(proc_name, args, {cwd: tmp_dir});
  
        proc.stdout.on("data", function (exedata) {
          console.log("Stdout: " + executable + exedata);
        });
  
        proc.stderr.on("data", function (exedata) {
          console.log("Stderr: " + executable + exedata);
        });
      }
  
      proc.on("error", function (code) {
        console.error("Error!!" + executable + JSON.stringify(code));
      });
      proc.on("exit", function () {
        console.log("My exe exit " + executable);
      });
  
      proc.on("close", function () {
        t_executed = Date.now();
        console.log("My exe close " + executable);
        callback()
      });
    }

    function uploadResult(callback) {
      
      t_end = Date.now();
      const duration = t_end - t_start;
      const downloading_duration = 0;
      const execution_duration = t_executed - t_start;
      const uploading_duration = 0;

      const response = JSON.stringify(
        {
          start: t_start,
          end: t_end,
          duration: duration,
          downloading_duration: downloading_duration,
          execution_duration: execution_duration,
          uploading_duration: uploading_duration,
          executable: executable,
          args: args
        });
      
      console.log("Uploading " + bucket_name + "/log/" + body.logName);
      
      const params = {
          Bucket: body.options.bucket,
          Key: "logs/" + body.logName,
          Body: response
        };
      console.log("Trying to save logs");
      s3.putObject(params, function (err) {
        if (err) {
          console.log("Error uploading file " + body.logName);
          console.log(err);
          callback(err);
          return;
        }
        console.log("Uploaded file " + body.logName);
        callback();
      });
    }
    
    async.waterfall([
      execute,
      uploadResult
    ], function (err) {
      if (err) {
        console.error("Error: " + err);
      } else {
          console.log("Success");
      }
    })
  return {};
};
