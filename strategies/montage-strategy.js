function montageDecorateStrategy(tasks) {
    tasks.forEach(task => {
        task.deploymentType = "2048";
    });
}

module.exports = montageDecorateStrategy;