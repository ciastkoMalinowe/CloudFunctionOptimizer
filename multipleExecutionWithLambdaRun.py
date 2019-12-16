#!/usr/bin/env python3
import json
import argparse
import subprocess
import shutil

parser = argparse.ArgumentParser(description="Modifying config.json file, executing algorithms, with every possible "
                                             "combinations (budget x cost)")
parser.add_argument('-fp', '--filePath', action="store", dest="file_path", help="path to config file", default="")
parser.add_argument('-gr', '--graphs', nargs="+", action="store", dest="graphs")


def change_json_key(json_key, new_value, file_path):
    with open(file_path, 'r+') as f:
        data = json.load(f)
        data[json_key] = new_value
        f.seek(0)
        json.dump(data, f, indent=4)
        f.truncate()


def delete_results_folder():
    shutil.rmtree("./results/step1", ignore_errors=True)


args = parser.parse_args()
path_to_configuration = args.file_path


def run_process_and_wait_for_exit(process_exec):
    process = subprocess.Popen(process_exec, stdout=subprocess.PIPE)
    for line in iter(process.stdout.readline, b''):
        print(str(line))
    process.stdout.close()
    process.wait()


for graph in args.graphs:
    change_json_key("dag", graph, path_to_configuration)
    delete_results_folder()
    run_process_and_wait_for_exit(["./scripts/step1.sh", path_to_configuration])
    run_process_and_wait_for_exit(
        [
            "./multipleExecution.py",
            "--graphs",
            graph,
            "-fp",
            path_to_configuration,
            "-bp",
            "0.10",
            "0.15",
            "0.20",
            "0.25",
            "0.30",
            "0.35",
            "0.40",
            "0.45",
            "0.50",
            "0.55",
            "0.60",
            "0.65",
            "0.70",
            "0.75",
            "0.80",
            "0.85",
            "0.90",
            "-dp",
            "0.10",
            "0.15",
            "0.20",
            "0.25",
            "0.30",
            "0.35",
            "0.40",
            "0.45",
            "0.50",
            "0.55",
            "0.60",
            "0.65",
            "0.70",
            "0.75",
            "0.80",
            "0.85",
            "0.90",
            "-alg",
            "moheft",
            "moheft-loss",
            "sdbcs",
            "sdbws",
            "-wf",
            "ellipsoids"])
    shutil.make_archive("results/" + graph.split(".")[0] + "-step1", 'zip', './results/step1')
