#!/usr/bin/env bash

scriptdir=`dirname "$0"`
appdir=`dirname "${scriptdir}"`
configPath=$1
config=${appdir}/${configPath}

# Step 1
./scripts/step1.sh ${config}

# Step 2
./scripts/step2.sh ${config}

# Step 3
./scripts/step3.sh ${config}

# Step 4
./scripts/step4.sh ${config}