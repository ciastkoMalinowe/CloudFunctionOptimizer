library('ggplot2')
types = read.table("all.csv",header = TRUE)
types
types$price
ggplot(types, aes(x = type, y=time)) + geom_bar(stat="identity")