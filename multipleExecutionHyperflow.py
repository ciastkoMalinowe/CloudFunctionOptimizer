#!/usr/bin/env python3
import csv
import json
import shutil
import subprocess
import time
import argparse

parser = argparse.ArgumentParser(description="Modifying config.json file, executing algorithms, with every possible "
                                             "combinations (budget x cost)")
parser.add_argument('-m', '--memoryOption', action="store", dest="memory_option")
parser.add_argument('-s', '--schedule', action="store", dest="schedule")
parser.add_argument('-t', '--tries', action="store", dest="number_tries")

args = parser.parse_args()


def set_memory_option(memory_option, file_path):
    with open(file_path, 'r+') as f:
        data = json.load(f)
        # data[json_key] = new_value

        for task in data['tasks']:
            task['config']['deploymentType'] = memory_option

        f.seek(0)
        json.dump(data, f, indent=4)
        f.truncate()


def run_hyperflow(dag):
    process = subprocess.Popen(["./node_modules/hyperflow/bin/hflow", "run", dag], stdout=subprocess.PIPE)
    while True:
        output = process.stdout.readline().decode()
        if output == '' and process.poll() is not None:
            break
        if output:
            print(output.strip())


def write_times_to_file(elapsed_time, dag, target_file):
    row = [elapsed_time, dag]
    with open(target_file, 'a') as fd:
        writer = csv.writer(fd)
        writer.writerow(row)


set_memory_option(args.memory_option, args.schedule)
for i in range(int(args.number_tries)):
    start_time = time.time()
    print("Process started !")
    run_hyperflow(args.schedule)
    end_time = time.time()
    elapsed_time = end_time - start_time
    print("Process finished !")
    write_times_to_file(elapsed_time, args.memory_option, "timeDifferences/times_file_hyperflow.csv")

