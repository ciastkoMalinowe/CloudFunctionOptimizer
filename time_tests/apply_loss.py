import json
import sys
import math

input_dag_path = sys.argv[1]
output_dag_path = sys.argv[2]
config_path = sys.argv[3]

file = open(input_dag_path,)
cfile = open(config_path,)
data = json.load(file)
config = json.load(cfile)

class Constraints:
    
    def __init__(self, data, config):
        self.data = data
        self.config = config
        self._decorate_with_level()
        self.level_to_proc = self._get_level_to_proc()
        self.id_to_process = self._get_id_to_process()
        self.id_to_executions = self._get_id_to_executions()
        self.MAX_DEADLINE = self._get_deadline(self._get_max)
        self.MIN_DEADLINE = self._get_deadline(self._get_min)
        self.MAX_BUDGET = self._get_budget(self._get_max)
        self.MIN_BUDGET = self._get_budget(self._get_min)
    
    def _decorate_with_level(self):
    
        def have_common(list1, list2):
            return sum([element in list1 for element in list2]) > 0
    
        for proc in self.data["processes"]:
            ancestors = [p.get("level", 0) for p in self.data["processes"] if have_common(p["outs"], proc["ins"])]
            ancestors.append(0)
            proc["level"] = max(ancestors) + 1

    def _get_level_to_proc(self):
        level_to_proc = {}
        for proc in self.data["processes"]:
            lvl = proc["level"]
            tasks = level_to_proc.get(lvl, [])
            tasks.append(proc["config"]["id"])
            level_to_proc[lvl] = tasks
        return level_to_proc
    
    def _get_id_to_process(self):
        id_to_process = {}
        for proc in self.data["processes"]:
            id_to_process[proc["config"]["id"]] = proc
        return id_to_process
    
    def _get_id_to_executions(self):
        id_to_executions = {}
        for proc in self.data["processes"]:
            executions = []
            for function in proc["startTime"]:
                time = proc["finishTime"][function] - proc["startTime"][function]
                price = self.config['prices']['AWS'][function]
                cost = price * math.ceil(time / 100)
                executions.append({
                    "cost": cost, 
                    "time": time, 
                    "function": function,
                    "proc_id": proc["config"]["id"]
                })
            executions = sorted(executions, key=lambda x: x["time"]) #posortowane rosnąco po czasie
            id_to_executions[proc["config"]["id"]] = executions
        return id_to_executions

    def _get_min(self, proc_id, key):
        executions = self.id_to_executions[proc_id]
        return sorted(executions, key=lambda x: x[key])[0][key]

    def _get_max(self, proc_id, key):
        executions = self.id_to_executions[proc_id]
        return sorted(executions, key=lambda x: x[key], reverse=True)[0][key]

    def _get_deadline(self, fun):
        result = 0
        for level in self.level_to_proc:
            options = [fun(proc_id, 'time') for proc_id in self.level_to_proc[level]]
            result += sorted(options, reverse=True)[0]
        return result

    def _get_budget(self, fun):
        result = 0
        for level in self.level_to_proc:
            options = [fun(proc_id, 'cost') for proc_id in self.level_to_proc[level]]
            result += sum(options)
        return result
    
    def get_user_deadline(self, deadline_factor):
        return self.MIN_DEADLINE + (self.MAX_DEADLINE - self.MIN_DEADLINE) * deadline_factor

    def get_user_budget(self, budget_factor):
        return self.MIN_BUDGET + (self.MAX_BUDGET - self.MIN_BUDGET) * budget_factor
    
    def get_level_to_decision(self):
        level_to_decision = {}
        for proc in self.data['processes']:
            level = proc['level']
            function = proc['config']['deploymentType']
            proc_id = proc['config']['id']
            decision = level_to_decision.get(level, {'time': 0, 'cost': 0, 'functions' : {}})
            decision['functions'][proc_id] = function
            time = proc["finishTime"][function] - proc["startTime"][function]
            price = self.config['prices']['AWS'][function]
            cost = price * math.ceil(time / 100)
            decision['time'] = max(decision['time'],time)
            decision['cost'] += cost
            level_to_decision[level] = decision
        return level_to_decision
    
    def get_planned_budget(self):
        result = 0
        level_to_decision = self.get_level_to_decision()
        for lvl in level_to_decision:
            result += level_to_decision[lvl]['cost']
        return result
    
    def get_planned_deadline(self):
        result = 0
        level_to_decision = self.get_level_to_decision()
        for lvl in level_to_decision:
            result += level_to_decision[lvl]['time']
        return result
    
constraints = Constraints(data, config)
MAX_BUDGET = constraints.get_user_budget(config['budgetParameter'])
MAX_DEADLINE = constraints.get_user_deadline(config['deadlineParameter'])
CURRENT_BUDGET = constraints.get_planned_budget()
CURRENT_DEADLINE = constraints.get_planned_deadline()

def get_level_to_proc():
    level_to_proc = {}
    for proc in data["processes"]:
        lvl = proc["level"]
        tasks = level_to_proc.get(lvl, [])
        tasks.append(proc["config"]["id"])
        level_to_proc[lvl] = tasks
    return level_to_proc

level_to_proc = get_level_to_proc()

def get_id_to_process():
    id_to_process = {}
    for proc in data["processes"]:
        id_to_process[proc["config"]["id"]] = proc
    return id_to_process

id_to_process = get_id_to_process()

def get_last_task(tasks):
    ftimes = [(tasks[i],id_to_process[tasks[i]]["config"]["scheduledFinishTime"]) for i in range(len(tasks))]
    return sorted(ftimes,key=lambda x: x[1])[-1][0]

def get_2_last_task(tasks):
    ftimes = [(tasks[i],id_to_process[tasks[i]]["config"]["scheduledFinishTime"]) for i in range(len(tasks))]
    if len(ftimes) > 1:
        return sorted(ftimes,key=lambda x: x[1])[-2][0]
    else:
        return sorted(ftimes,key=lambda x: x[1])[-1][0]

def get_best_option_for_task(task, task2):
    proc = id_to_process[task]
    price = config['prices']['AWS'][proc["config"]["deploymentType"]]
    execution_time = proc["config"]["scheduledFinishTime"] - proc["config"]["scheduledStartTime"]
    cost = price * math.ceil(execution_time / 100)
    changes = []
    for key in proc["startTime"]:
        if(key != 'sdbcs'):
            startTime = proc["startTime"][key]
            finishTime = proc["finishTime"][key]
            new_price = config['prices']['AWS'][key]
            option = {
                "old_time": execution_time,
                "old_cost": cost,
                "new_time": finishTime - startTime,
                "time_loss": max(id_to_process[task2]["config"]["scheduledFinishTime"], proc["config"]["scheduledStartTime"] + (finishTime - startTime)) - proc["config"]["scheduledFinishTime"], 
                "new_cost": math.ceil((finishTime - startTime) / 100) * new_price,
                "deploymentType": key,
                "id": task,
                "level": proc["level"]
            }
            changes.append(option)
        
    for change in changes:
        if change["time_loss"] >= 0:
            change["loss"] = 0
        else:
            change["loss"] = (change["new_cost"] - change["old_cost"]) / (change["time_loss"] * -1)
    candidates = sorted(changes, key=lambda x: x["loss"])
    for candidate in candidates:
        if candidate["loss"] != 0:
            return candidate
    return None
    
time_updates_to_level = {}
for key in level_to_proc:
    time_updates_to_level[key] = 0;


def apply_option(option):
    global CURRENT_BUDGET
    if (CURRENT_BUDGET - option["old_cost"] + option["new_cost"]) <= MAX_BUDGET:
        CURRENT_BUDGET = CURRENT_BUDGET - option["old_cost"] + option["new_cost"]
        c = id_to_process[option["id"]]["config"]
        c["deploymentType"] = option["deploymentType"]
        old_finish = c["scheduledFinishTime"]
        c["scheduledFinishTime"] = c["scheduledStartTime"] + option["new_time"]
        time_updates_to_level[option["level"]] = time_updates_to_level[option["level"]] + option["time_loss"]
        return True
    return False
    
options = []
for level in level_to_proc:
    tasks = level_to_proc[level]
    task = get_last_task(tasks)
    task2 = get_2_last_task(tasks)
    option = get_best_option_for_task(task, task2)
    if option:
        options.append(option)
        
counter = 0
while(len(options) > 0):
    options = sorted(options,key=lambda x: x["loss"])
    applied = apply_option(options[0])
    if applied:
        counter += 1
        new_task = get_last_task(level_to_proc[options[0]["level"]])
        new_2_task = get_2_last_task(level_to_proc[options[0]["level"]])
        new_option = get_best_option_for_task(new_task, new_2_task)
        if new_option:
            options.append(new_option)
    options = options[1:]
print(f'Applied {counter} updates')
    
acc = 0
for i in range(1,len(time_updates_to_level)+1):
    acc += time_updates_to_level[i]
    time_updates_to_level[i] = acc
    
print(time_updates_to_level)
    
for proc in data["processes"]:
    if(proc["level"] > 1):
        proc["config"]["scheduledStartTime"] += time_updates_to_level[proc["level"]-1]
        proc["config"]["scheduledFinishTime"] += time_updates_to_level[proc["level"]-1]
        
with  open(output_dag_path,'w+') as f:
    json.dump(data, f, indent=2)
