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

def decorate_with_level():
    
    def have_common(list1, list2):
        return sum([element in list1 for element in list2]) > 0
    
    for proc in data["processes"]:
        ancestors = [p.get("level", 0) for p in data["processes"] if have_common(p["outs"], proc["ins"])]
        ancestors.append(0)
        proc["level"] = max(ancestors) + 1

def get_level_to_proc():
    level_to_proc = {}
    for proc in data["processes"]:
        lvl = proc["level"]
        tasks = level_to_proc.get(lvl, [])
        tasks.append(proc["config"]["id"])
        level_to_proc[lvl] = tasks
    return level_to_proc

decorate_with_level()
level_to_proc = get_level_to_proc()

def get_id_to_process():
    id_to_process = {}
    for proc in data["processes"]:
        id_to_process[proc["config"]["id"]] = proc
    return id_to_process

id_to_process = get_id_to_process()

def get_id_to_executions():
    id_to_executions = {}
    for proc in data["processes"]:
        executions = []
        for function in proc["startTime"]:
            time = proc["finishTime"][function] - proc["startTime"][function]
            price = config['prices']['AWS'][function]
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

id_to_executions = get_id_to_executions()

budget_factor = config["budgetParameter"]
deadline_factor = config["deadlineParameter"]

def get_min(proc_id, key):
    executions = id_to_executions[proc_id]
    return sorted(executions, key=lambda x: x[key])[0][key]

def get_max(proc_id, key):
    executions = id_to_executions[proc_id]
    return sorted(executions, key=lambda x: x[key], reverse=True)[0][key]

def get_deadline(fun):
    result = 0
    for level in level_to_proc:
        options = [fun(proc_id, 'time') for proc_id in level_to_proc[level]]
        result += sorted(options, reverse=True)[0]
    return result

def get_budget(fun):
    result = 0
    for level in level_to_proc:
        options = [fun(proc_id, 'cost') for proc_id in level_to_proc[level]]
        result += sum(options)
    return result

MAX_DEADLINE = get_deadline(get_max)
MIN_DEADLINE = get_deadline(get_min)
USER_DEADLINE = MIN_DEADLINE + (MAX_DEADLINE - MIN_DEADLINE) * deadline_factor

MAX_BUDGET = get_budget(get_max)
MIN_BUDGET = get_budget(get_min)
USER_BUDGET = MIN_BUDGET + (MAX_BUDGET - MIN_BUDGET) * budget_factor

# usuwa funkcje dla których istnieje tańsza i równie szybka lub szybsza funkcja 
def prune_useless(array):
    i = 0
    while i < (len(array)-1):
        if array[i]["cost"] <= array[i+1]["cost"]:
            array.pop(i+1)
        else:
            i += 1
    return array

def get_index(array, deadline):
    index = 0
    while index < len(array) and array[index]['time'] <= deadline:
        index += 1
    return index-1

def get_level_to_possibilities():
    level_to_possibilities = {}
    for level in level_to_proc.keys():
        tasks = level_to_proc[level]
        array = []
        possibilities = []
        deadlines = []
        for task in tasks:
            a = id_to_executions[task].copy() # a posortowane jest rosnąco po czasie
            a = prune_useless(a)
            array.append(a)
            for execution in a:
                deadlines.append(execution["time"])
        
        for deadline in deadlines:
            cost = 0
            functions = {}
            shouldAppend = True
            for a in array:
                index = get_index(a, deadline)
                if a[index]['time'] > deadline:
                    shouldAppend = False
                    break
                cost += a[index]["cost"]
                functions[a[index]["proc_id"]] = a[index]["function"]
                
            if shouldAppend:
                possibilities.append({
                    "time": deadline,
                    "cost": cost,
                    "functions": functions
                })
            
        level_to_possibilities[level] = sorted(possibilities, key=lambda x: x["cost"])
    return level_to_possibilities

level_to_possibilities = get_level_to_possibilities()

#startuję od najtańszego
level_to_decision = {}
for key in level_to_proc:
    level_to_decision[key] = 0
    
#liczę parametry obecnego układu
CURRENT_BUDGET = 0
CURRENT_DEADLINE = 0
for level in level_to_possibilities:
    possibilities = level_to_possibilities[level]
    CURRENT_BUDGET += possibilities[0]['cost']
    CURRENT_DEADLINE += possibilities[0]['time']
    
def get_best_option_for_level(level, current_option_index):
    possibilities = level_to_possibilities[level]
    options = []
    for index in range(current_option_index+1, len(possibilities)):
        time_delta = possibilities[current_option_index]['time'] - possibilities[index]['time']
        cost_delta = possibilities[index]['cost'] - possibilities[current_option_index]['cost']
        
        if cost_delta <= USER_BUDGET - CURRENT_BUDGET:
            loss = {
                'level': level,
                'index': index,
                'cost_delta': cost_delta,
                'loss': cost_delta / time_delta if time_delta != 0 else 0,
                'time_delta': time_delta
            }
            options.append(loss)
    if len(options) == 0:
        return None
    return sorted(options,key=lambda x: x['loss'])[0]
    
#dodaję opcje z najlepszym loss'em dla każdego levelu
options = []
for level in level_to_proc:
    option = get_best_option_for_level(level, 0)
    if option:
        options.append(option)
        
def apply_option(option):
    global USER_BUDGET, CURRENT_BUDGET, CURRENT_DEADLINE
    if option['cost_delta'] <= USER_BUDGET - CURRENT_BUDGET:
        level_to_decision[option['level']] = option['index']
        CURRENT_BUDGET += option['cost_delta']
        CURRENT_DEADLINE -= option['time_delta']
        return True
    return False

counter = 0
while(len(options) > 0):
    options = sorted(options,key=lambda x: x["loss"])
    
    applied = apply_option(options[0])
    if applied:
        counter += 1
    new_option = get_best_option_for_level(options[0]['level'], level_to_decision[options[0]['level']])
    if new_option:
        options.append(new_option)
    options = options[1:]
print(f'Applied {counter} updates')
print(f'planned budget {CURRENT_BUDGET}, user budget {USER_BUDGET}')
print(f'planned deadline {CURRENT_DEADLINE}, user deadline {USER_DEADLINE}')

def get_level_start_time(level):
    if level == 1:
        return 0;
    level -= 1
    return get_level_start_time(level) + level_to_possibilities[level][level_to_decision[level]]["time"]

# create a nice output json
counter = 0
for level in level_to_decision:
    decision = level_to_possibilities[level][level_to_decision[level]]
    start_time = get_level_start_time(level)
    for proc_id in decision["functions"]:
        counter += 1
        p = id_to_process[proc_id]
        function = decision["functions"][proc_id]
        p['config']['deploymentType'] = function
        p['config']['scheduledStartTime'] = start_time
        p['config']['scheduledFinishTime'] = start_time + p["finishTime"][function] - p["startTime"][function]
        if proc_id == 16:
            print(p)

with  open(output_dag_path,'w+') as f:
    json.dump(data, f, indent=2)
