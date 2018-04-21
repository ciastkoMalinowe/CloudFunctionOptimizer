#!/bin/bash
# ./parse_log.sh logs_256.txt 256

type=$2
cat $1 | grep GCF | cut -d " " -f 2,4,6,12,14,16 > logs.txt
awk '{print $0 " " var}' var="$type" logs.txt
rm logs.txt