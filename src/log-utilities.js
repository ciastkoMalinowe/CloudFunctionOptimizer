const fs = require('fs');
const path = require("path");

class LogUtilities {

    /**
     * Print to all_{config.workflow}.txt file results of the algorithm, all points are outputted
     * @param points - points as tuples [time, cost]
     * @param userDeadline
     * @param userBudget
     * @param config
     * @param algorithm
     */
    static outputLogsToFile(points, userDeadline, userBudget, config, algorithm) {
        let filePath = './outputs_multiple/all_' + config.workflow + '.txt';
        for (const point of points) {
            let time = point[0];
            let cost = point[1];

            const isInConstraints = time <= userDeadline && cost <= userBudget;
            let toBeAppended = `${time},${cost},${algorithm},${config.deadlineParameter},${config.budgetParameter},`;
            toBeAppended += `${userDeadline},${userBudget},${path.basename(config.dag)},${isInConstraints}\n`;
            fs.appendFileSync(filePath, toBeAppended);
        }
    }

}

module.exports = LogUtilities;