library('ggplot2')
tasks = read.table("dbws.csv",header = TRUE)
min_start = min(tasks$start)
tasks$start=(tasks$start-min_start)/1000
tasks$end=(tasks$end-min_start)/1000
tasks = tasks[order(tasks$start),]
tasks

ggplot(tasks, aes(colour=resource)) + geom_segment(aes(x=start, xend=end, y=1:nrow(tasks), yend=1:nrow(tasks)), size=2) + xlab("Time in seconds") + ylab("Task") + theme (axis.text.y = element_text(size=10)) + scale_color_continuous(name="", breaks = c(256, 512, 1024, 2048), labels = c(256, 512, 1024, 2048), low="blue", high="red")
#+ theme (axis.text.y = element_text(size=6)) + theme(legend.justification=c(1,0), legend.position=c(1,0)) + theme(legend.text = element_text(size = 8))

ggsave("dbws.pdf", width = 16, height = 8, units = "cm")

#ggsave("plot121.pdf", width = 16, height = 24, units = "cm")
#ggsave("plot10.emf", width = 8, height = 12, units = "cm")