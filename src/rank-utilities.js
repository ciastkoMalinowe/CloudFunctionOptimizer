class RankUtilities {

    static computeAverageExecutionTime(task, functionTypes) {
        let total = 0;
        let times = functionTypes.map(functionType => {
            return task.finishTime[functionType] - task.startTime[functionType];
        });

        times.forEach(time => total += time);
        return total / times.length;
    }

    static computeUpwardRank(tasks, task, functionTypes) {
        let averageExecutionTime = this.computeAverageExecutionTime(task, functionTypes);
        let successors = tasks.filter(x => x.level === task.level + 1);

        if (successors.length === 0) {
            task.upwardRank = averageExecutionTime;
        } else {
            let successorRanks = successors.map(x => this.findOrComputeRank(tasks, x, functionTypes));
            task.upwardRank = averageExecutionTime + Math.max(...successorRanks);
        }

        return task.upwardRank;
    }

    static findOrComputeRank(tasks, task, functionTypes) {
        // Average communication time = 0
        let originalTask = tasks.find(x => x.config.id === task.config.id);
        if (originalTask.upwardRank === undefined) {
            return this.computeUpwardRank(tasks, originalTask, functionTypes);
        } else {
            return originalTask.upwardRank;
        }
    }

    static decorateTasksWithUpwardRank(tasks, functionTypes) {
        tasks.forEach(task => {
            if (task.upwardRank === undefined) this.computeUpwardRank(tasks, task, functionTypes);
        });
    }

}

module.exports = RankUtilities;
