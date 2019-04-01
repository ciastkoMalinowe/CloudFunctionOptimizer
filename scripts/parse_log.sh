#!/bin/bash

logFile=$1
type=$2
provider=$3

cat ${logFile} | grep $provider | cut -d " " -f 2,4,6,12,14,16 > logs.txt
awk '{print $0 " " var}' var="$type" logs.txt
rm logs.txt