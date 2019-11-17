df <- read.csv("/home/mamajews/Development/CloudFunctionOptimizer/every_possible_output/paretoFront1.txt")




names(df) <- c('time','cost')

require(ggplot2)
library(ggrepel)
ggplot(data = df, aes(x = time, y = cost)) + geom_point() 
#geom_label(hjust=0.15, vjust=-0.15, aes(label = paste(df$time, df$cost, ""), color = 'red'), show.legend = NA) + theme(legend.position = "none")

  