#!/usr/bin/env bash

dagPath=$1

./logs/parse_log.sh ./logs/withresources/logs10_2048.txt 2048 >> ./logs/withresources/logs10.csv
./logs/parse_log.sh ./logs/withresources/logs10_1024.txt 1024 >> ./logs/withresources/logs10.csv
./logs/parse_log.sh ./logs/withresources/logs10_512.txt 512 >> ./logs/withresources/logs10.csv
./logs/parse_log.sh ./logs/withresources/logs10_256.txt 256 >> ./logs/withresources/logs10.csv

./run_dbws.sh ${dagPath} ./logs/withresources/logs10.csv ./dag-dbws.json

./run.sh ./dag-dbws.json ./logs/withresources/logs10_real.txt
./logs/parse_log.sh ./logs/withresources/logs10_real.txt real >> ./logs/withresources/logs10.csv

./extract.sh ./dag-dbws.json ./logs/withresources/logs10.csv ./dag-output.json ./result.csv

