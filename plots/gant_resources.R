library('ggplot2')
tasks = read.table("real_avg_execution.csv",header = TRUE)
min_start = min(tasks$start)
tasks$start=(tasks$start-min_start)/1000
tasks$end=(tasks$end-min_start)/1000
tasks = tasks[order(tasks$start),]
tasks

ggplot(tasks, aes(colour=resource)) + geom_segment(aes(x=start, xend=end, y=1:nrow(tasks), yend=1:nrow(tasks)), size=2) + xlab("Time in seconds") + ylab("Task") + theme (axis.text.y = element_text(size=10)) + scale_color_continuous(name="", breaks = c(256, 512, 1024, 1536), labels = c(256, 512, 1024, 1536), low="blue", high="red")
#ggplot(tasks, aes(colour=task)) + geom_segment(aes(x=start, xend=end, y=1:nrow(tasks), yend=1:nrow(tasks)), size=2) + xlab("Time in seconds") + ylab("Task") + theme (axis.text.y = element_text(size=10)) + scale_color_continuous(name="", breaks = c(256, 512, 1024, 2048), labels = c(256, 512, 1024, 2048), low="blue", high="red")

#+ theme (axis.text.y = element_text(size=6)) + theme(legend.justification=c(1,0), legend.position=c(1,0)) + theme(legend.text = element_text(size = 8))

ggsave("real_avg_execution_resources_small.pdf", width = 9, height = 9, units = "cm")
#ggsave("real_avg_execution_resources_small.pdf", width = 16, height = 24, units = "cm")
