#!/usr/bin/env python3
import json
import argparse
import subprocess

parser = argparse.ArgumentParser(description="Modifying config.json file, executing algorithms, with every possible "
                                             "combinations (budget x cost)")
parser.add_argument('-fp', '--filePath', action="store", dest="file_path", help="path to config file", default="")
parser.add_argument('-bp', '--budgetParameters', nargs="+", action="store", dest="budget_parameters")
parser.add_argument('-dp', '--deadlineParameters', nargs="+", action="store", dest="deadline_parameters")
parser.add_argument('-alg', '--algorithms', nargs="+", action="store", dest="algorithms")
parser.add_argument('-gr', '--graphs', nargs="+", action="store", dest="graphs")
parser.add_argument('-wf', '--workflow', action="store", dest="workflow", help="workflow", default="")


def change_json_key(json_key, new_value, file_path):
    with open(file_path, 'r+') as f:
        data = json.load(f)
        data[json_key] = new_value
        f.seek(0)
        json.dump(data, f, indent=4)
        f.truncate()


def delete_results_folder():
    global process
    process = subprocess.Popen(["rm", "-rf", "./results/step2"])
    process.wait()


args = parser.parse_args()

path_to_configuration = args.file_path

for algorithm in args.algorithms:
    for budget_parameter in args.budget_parameters:
        for deadline_parameter in args.deadline_parameters:
            for graph in args.graphs:
                change_json_key("budgetParameter", budget_parameter, path_to_configuration)
                change_json_key("deadlineParameter", deadline_parameter, path_to_configuration)
                change_json_key("algorithm", algorithm, path_to_configuration)
                change_json_key("workflow", args.workflow, path_to_configuration)
                change_json_key("dag", graph, path_to_configuration)
                delete_results_folder()
                process = subprocess.Popen(["./scripts/step2.sh", path_to_configuration], stdout=subprocess.PIPE)
                for line in iter(process.stdout.readline, b''):
                    print(str(line))
                process.stdout.close()
                process.wait()