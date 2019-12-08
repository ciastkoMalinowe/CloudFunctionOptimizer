#!/bin/bash

logFile=$1
type=$2
provider=$3

cat ${logFile} | grep "Response:" | cut -c 11-