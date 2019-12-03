const fs = require('fs');
const path = require("path");

class LogUtilities {

    /**
     * Print to all_{config.workflow}.txt file results of the algorithm
     * @param points - points as tuples [time, cost]
     * @param userDeadline
     * @param userBudget
     * @param config
     */
    static outputLogsToFile(points, userDeadline, userBudget, config, algorithm) {
        let filePath = './outputs_multiple/all_' + config.workflow + '.txt';
        const separator = ',';
        for (const point of points) {
            let time = point[0];
            let cost = point[1];
            fs.appendFileSync(filePath, time + separator + cost + separator + algorithm + separator
                + config.deadlineParameter + separator + config.budgetParameter + separator + userDeadline + separator + userBudget + separator + path.basename(config.dag) + '\n');
        }
    }

}

module.exports = LogUtilities;