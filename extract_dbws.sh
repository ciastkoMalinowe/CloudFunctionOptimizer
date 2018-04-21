#!/usr/bin/env bash

executionExtractor=/home/asia/WebstormProjects/CloudFunctionOptimizer/extractor/execution-extractor.js

dagPath=$1
csvPath=$2

node ${executionExtractor} ${dagPath} ${csvPath}
