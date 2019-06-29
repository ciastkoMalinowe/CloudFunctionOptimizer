setwd('/Users/yoshimori/Studyspace/Magisterka/CloudFunctionOptimizer')
library('ggplot2')

planned_execution = read.table("./results-request-duration/montage/sdbws_x5/step4/sdbws-montage_AWS_256_512_1024_1536_2048_2560_3008x5/planned_execution.csv",header = TRUE)
real_execution = read.table("./results-request-duration/montage/sdbws_x5/step4/sdbws-montage_AWS_256_512_1024_1536_2048_2560_3008x5/average_execution.csv",header = TRUE)

# difference = sum(planned_execution$request_start - real_execution$request_start)

# real_tasks_durations = real_execution$request_end - real_execution$request_start
# planned_tasks_durations = planned_execution$request_end - planned_execution$request_start
# difference = sum(abs(real_tasks_durations - planned_tasks_durations))

di# Prepare planned data
planned_execution$request_start=planned_execution$request_start/1000
planned_execution$request_end=planned_execution$request_end/1000

# Prepare real execution data
real_execution$request_start=real_execution$request_start/1000
real_execution$request_end=real_execution$request_end/1000

# Sort
real_execution = real_execution[order(real_execution$request_start),]
planned_execution = planned_execution[match(real_execution$id, planned_execution$id),]

p <- ggplot(planned_execution, aes(colour=task)) + geom_segment(aes(x=request_start, xend=request_end, y=1:nrow(planned_execution), yend=1:nrow(planned_execution)), size=3, alpha=0.3) + xlab("Time in seconds") + ylab("Task") + scale_y_discrete(labels=planned_execution$task) + theme(axis.text.y = element_text(size=24)) + theme (axis.text.x = element_text(size=24)) + theme(axis.title=element_text(size=30)) + theme(legend.justification=c(1,0), legend.position=c(1,0)) + theme(legend.text = element_text(size = 24), legend.title = element_text(size = 24))
p <- p + geom_segment(data=real_execution, aes(x=request_start, xend=request_end, y=1:nrow(real_execution), yend=1:nrow(real_execution)), size=3, alpha=0.7)
p                      

