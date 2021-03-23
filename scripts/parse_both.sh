#!/bin/bash

logFile=$1
type=$2
provider=$3

cat ${logFile} | grep "${provider} Lambda" | cut -d " " -f 2,4,6,12,14,16,19,22,25 > logs.txt
awk '{print "lambda " $0 " " var}' var="$type" logs.txt
rm logs.txt
cat ${logFile} | grep "FargateFunction:" | cut -d " " -f 2,4,6,10,13,16,19,22,25,28,31 > logs.txt
awk '{print "fargate " $0 " " var}' var="$type" logs.txt
rm logs.txt
