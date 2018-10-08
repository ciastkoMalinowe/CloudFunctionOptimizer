#!/usr/bin/env bash

executionExtractor=/path/to/extractor/execution-extractor.js

dagPath=$1
csvPath=$2

node ${executionExtractor} ${dagPath} ${csvPath}
