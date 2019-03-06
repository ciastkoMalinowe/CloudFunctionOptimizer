setwd('/Users/yoshimori/Studyspace/Magisterka/CloudFunctionOptimizer')
library('ggplot2')

planned_execution = read.table("./all_x5_sdbcs_new/dbws_planned_execution.csv",header = TRUE)
real_execution = read.table("./all_x5_sdbcs_new/real_avg_execution.csv",header = TRUE)

# Prepare planned data
planned_execution$start=planned_execution$start/1000
planned_execution$end=planned_execution$end/1000

# Prepare real execution data
real_execution$start=real_execution$start/1000
real_execution$end=real_execution$end/1000

# Sort
real_execution = real_execution[order(real_execution$start),]
planned_execution = planned_execution[match(real_execution$id, planned_execution$id),]

p <- ggplot(planned_execution, aes(colour=task)) + geom_segment(aes(x=start, xend=end, y=1:nrow(planned_execution), yend=1:nrow(planned_execution)), size=3, alpha=0.3) + xlab("Time in seconds") + ylab("Task") + scale_y_discrete(labels=planned_execution$task) + theme (axis.text.y = element_text(size=6)) + theme(legend.justification=c(1,0), legend.position=c(1,0)) + theme(legend.text = element_text(size = 8))
p <- p + geom_segment(data=real_execution, aes(x=start, xend=end, y=1:nrow(real_execution), yend=1:nrow(real_execution)), size=3, alpha=0.7)
p                      
