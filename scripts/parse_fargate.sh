#!/bin/bash

logFile=$1
type=$2

cat ${logFile} | grep "FargateFunction:" | cut -d " " -f 2,4,8,10,12,15,18,21,24,27,30,33 > logs.txt
awk '{print $0 " " var}' var="$type" logs.txt
rm logs.txt
