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

#Buckets 

#combines fronts of two levels into one
def add_possibilities(level_a,level_b, p):
    level_c = []
    for a in level_a:
        for b in level_b:
            c = {
                "cost": a["cost"] + b["cost"],
                "time": a["time"] + b["time"],
                "functions": {**a["functions"] , **b["functions"]}
            }
            level_c.append(c)
    level_c = sorted(level_c, key=lambda x: x["time"])
    c = 0
    while c < len(level_c)-2:
        if level_c[c+1]["cost"] >= level_c[c]["cost"]:
            level_c.pop(c+1)
        else:
            c += 1
    if len(level_c) > p:
        print(len(level_c) - p)
        
        bucket_size = (level_c[-1]["time"] - level_c[0]["time"]) / p
        result = []
        treshold = level_c[0]["time"]
        for c in level_c:
            if c['time'] >= treshold:
                result.append(c)
                treshold += bucket_size
                
        return result
            
    return level_c
    

levels = []
for p in level_to_possibilities:
    levels.append(level_to_possibilities[p])
while len(levels) > 1:
    a = levels.pop(0)
    b = levels.pop(0)
    c = add_possibilities(a,b, len(a)+len(b))
    levels.append(c)


plans = [l for l in levels[0] if l["cost"] <= USER_BUDGET and l["time"] <= USER_DEADLINE]

if(len(plans) > 0):
    plan = sorted(plans, key=lambda p: p["cost"])
    target_cost = (plan[0]["cost"] + plan[-1]["cost"])/2
    target_time = (plan[0]["time"] + plan[-1]["time"])/2
    for p in plans:
        p['weight'] = (p["cost"]-target_cost)*(p["cost"]-target_cost)/(MAX_BUDGET - MIN_BUDGET)/(MAX_BUDGET - MIN_BUDGET) + (p["time"]-target_time)*(p["time"]-target_time)/(MAX_DEADLINE - MIN_DEADLINE)/(MAX_DEADLINE - MIN_DEADLINE)
    
else:
    plans = levels[0]
    for p in plans:
        p['weight'] = (p["cost"]-USER_BUDGET)*(p["cost"]-USER_BUDGET)/(MAX_BUDGET - MIN_BUDGET)/(MAX_BUDGET - MIN_BUDGET) + (p["time"]-USER_DEADLINE)*(p["time"]-USER_DEADLINE)/(MAX_DEADLINE - MIN_DEADLINE)/(MAX_DEADLINE - MIN_DEADLINE)

plan = sorted(plans, key=lambda p:p["weight"])[0]
    

# create a nice output json
counter = 0
start_time = 0
end = 0
for level in level_to_proc:
    for proc_id in level_to_proc[level]:
        p = id_to_process[proc_id]
        function = plan["functions"][proc_id]
        p['config']['deploymentType'] = function
        p['config']['scheduledStartTime'] = start_time
        p['config']['scheduledFinishTime'] = start_time + p["finishTime"][function] - p["startTime"][function]
        end = max(end,p['config']['scheduledFinishTime'])
    start_time = end
    end = 0
        
with  open(output_dag_path,'w+') as f:
    json.dump(data, f, indent=2)
