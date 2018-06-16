library('ggplot2')
types = read.table("extracted_results.csv",header = TRUE)
#types = types[order(types$time),]

user_time=26.747

types
types$type <- factor(types$type, levels = types$type[order(types$time)])

ggplot(types, aes(x = type, y=time)) + geom_bar(position="dodge", stat="identity", fill = "#66a0ff") + geom_hline(yintercept = user_time) + ylab("Time in seconds") + xlab("Function type")

ggsave("compare-times-small.pdf", width = 9, height = 9, units = "cm")
