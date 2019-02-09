#!/usr/bin/env bash
# ./run_dbws.sh ./dag.json ./results.json

timeDecorator=../dagscripts/time-decorator.js
dbwsDecorator=../app.js

dagPath=$1
csvPath=$2
outputPath=$3

dagDirPath=$(dirname "${dagPath}")
dagBaseName=$(basename "${dagPath}" .json)
tmp=tmp-times.json

echo args: $@
echo Will decorate with times

echo node ${timeDecorator} ${dagPath} ${csvPath} ./${tmp}
node ${timeDecorator} ${dagPath} ${csvPath} ./${tmp}

echo Decorated with times

echo node --harmony ${dbwsDecorator}  ./${tmp} ${outputPath}
node --harmony ${dbwsDecorator}  ./${tmp} ${outputPath}

echo Dbws dag ready

#rm ./${tmp}