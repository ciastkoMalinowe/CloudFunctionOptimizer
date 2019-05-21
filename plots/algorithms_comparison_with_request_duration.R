setwd('/Users/yoshimori/Studyspace/Magisterka/CloudFunctionOptimizer')
library('ggplot2')

sdbws_results = read.table("./results-request-duration/montage/sdbws_x5/step4/sdbws-montage_AWS_256_512_1024_1536_2048_2560_3008x5/average_execution.csv",header = TRUE)
sdbcs_results = read.table("./results-request-duration/montage/sdbcs_x5/step4/sdbcs-montage_AWS_256_512_1024_1536_2048_2560_3008x5/average_execution.csv",header = TRUE)

sdbws_results = sdbws_results[order(sdbws_results$id),]
sdbws_results$algorithm <- "sdbws"

sdbcs_results = sdbcs_results[order(sdbcs_results$id),]
sdbcs_results$algorithm <- "sdbcs"

results <- rbind(sdbws_results, sdbcs_results)
ggplot(results, aes(x=id, y=request_duration, group = type, colour=as.factor(task), shape=as.factor(algorithm))) + geom_point() + theme(axis.text.x = element_text(angle = 90, hjust = 1)) + labs(x = "Task ID", y = "Time in ms", colour = "Tasks", shape = "Algorithm") + ylim(0, 5000)


