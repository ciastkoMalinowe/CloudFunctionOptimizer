#!/bin/bash
# ./parse_log.sh logs.txt real

type=$2
cat $1 | grep GCF | cut -d " " -f 2,4,6,12,14,16 > logs
awk '{print $0 " " var}' var="$type" logs
rm logs