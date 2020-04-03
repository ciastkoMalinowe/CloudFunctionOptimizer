#!/usr/bin/env python3
import json
import argparse
import subprocess
import shutil
import time
import os.path
import csv

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
    shutil.rmtree("./results/step2", ignore_errors=True)


args = parser.parse_args()

path_to_configuration = args.file_path


def delete_results_and_run_process():
    delete_results_folder()
    process = subprocess.Popen(["./scripts/step2.sh", path_to_configuration], stdout=subprocess.PIPE)
    while True:
        output = process.stdout.readline().decode()
        if output == '' and process.poll() is not None:
            break
        if output:
            print(output.strip())


def write_times_to_file(elapsed_time, algorithm, dag, target_file):
    row = [elapsed_time, algorithm, dag]
    with open(target_file, 'a') as fd:
        writer = csv.writer(fd)
        writer.writerow(row)


for algorithm in args.algorithms:
    print(algorithm)
    # if algorithm == "moheft":
    #     change_json_key("algorithm", algorithm, path_to_configuration)
    #     delete_results_and_run_process()
    #     continue

    for budget_parameter in args.budget_parameters:
        for deadline_parameter in args.deadline_parameters:
            print("Processing :" + deadline_parameter.__str__() + " " + budget_parameter.__str__() + " " + algorithm)
            for graph in args.graphs:
                change_json_key("budgetParameter", budget_parameter, path_to_configuration)
                change_json_key("deadlineParameter", deadline_parameter, path_to_configuration)
                change_json_key("algorithm", algorithm, path_to_configuration)
                change_json_key("workflow", args.workflow, path_to_configuration)
                change_json_key("dag", graph, path_to_configuration)
                start_time = time.time()
                delete_results_and_run_process()
                end_time = time.time()
                elapsed_time = time.time() - start_time
                write_times_to_file(elapsed_time, algorithm, graph, "times_file.csv")
