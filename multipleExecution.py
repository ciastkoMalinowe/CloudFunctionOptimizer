#!/usr/bin/env python3
import json
import argparse
import subprocess

parser = argparse.ArgumentParser(description="Modifying config.json file, executing algorithms, with every possible "
                                             "combinations (budget x cost)")
parser.add_argument('-fp', '--filePath', action="store", dest="filePath", help="path to config file", default="")
parser.add_argument('-bp', '--budgetParameters', nargs="+", action="store", dest="budgetParameters")
parser.add_argument('-dp', '--deadlineParameters', nargs="+", action="store", dest="deadlineParameters")
parser.add_argument('-alg', '--algorithms', nargs="+", action="store", dest="algorithms")


def change_json_key(jsonKey, newValue, filePath):
    with open(filePath, 'r+') as f:
        data = json.load(f)
        data[jsonKey] = newValue
        f.seek(0)
        json.dump(data, f, indent=4)
        f.truncate()


def delete_results_folder():
    global process
    process = subprocess.Popen(["rm", "-rf", "./results/step2"])
    process.wait()


args = parser.parse_args()

for algorithm in args.algorithms:
    for budgetParameter in args.budgetParameters:
        for deadline in args.deadlineParameters:
            change_json_key("budgetParameter", budgetParameter, args.filePath)
            change_json_key("deadlineParameter", deadline, args.filePath)
            change_json_key("algorithm", algorithm, args.filePath)
            delete_results_folder()
            process = subprocess.Popen(["./scripts/step2.sh", args.filePath], stdout=subprocess.PIPE)
            for line in iter(process.stdout.readline, b''):
                print(str(line))
            process.stdout.close()
            process.wait()
