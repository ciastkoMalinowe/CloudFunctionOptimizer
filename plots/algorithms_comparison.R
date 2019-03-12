setwd('/Users/yoshimori/Studyspace/Magisterka/CloudFunctionOptimizer/plots')
library('ggplot2')

sdbws_results = read.table("../../results/all_x5/real_avg_execution.csv",header = TRUE)
sdbcs_results = read.table("../../results/all_x5_sdbcs_new/real_avg_execution.csv",header = TRUE)

sdbws_results = sdbws_results[order(sdbws_results$id),]
sdbws_results$algorithm <- "sdbws"

sdbcs_results = sdbcs_results[order(sdbcs_results$id),]
sdbcs_results$algorithm <- "sdbcs"


results <- rbind(sdbws_results, sdbcs_results)
ggplot(results, aes(x=id, y=time, group = type, colour=as.factor(task), shape=as.factor(algorithm))) + geom_point() + theme(axis.text.x = element_text(angle = 90, hjust = 1)) + labs(x = "Task ID", y = "Time in ms", colour = "Tasks", shape = "Algorithm") + ylim(0, 5000)


