#!/bin/bash

logFile=$1
type=$2
provider=$3

cat ${logFile} | grep "${provider} Lambda" | cut -d " " -f 2,4,6,8,10,12,18,20,22,25,28,31 > logs.txt
awk '{print $0 " " var}' var="$type" logs.txt
rm logs.txt