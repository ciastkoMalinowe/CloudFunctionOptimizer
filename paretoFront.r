df <- read.csv("/home/mamajews/development/CloudFunctionOptimizer/every_possible_output/paretoFrontAll.txt")
names(df) <- c('time','cost')

single_point <- data.frame(35909,0.000415724)
names(single_point) <- c('time','cost')

sdbws <- data.frame(36962, 0.00040032)
names(sdbws) <- c('time','cost') 

require(ggplot2)
library(ggrepel)
plot <- ggplot(data = df, aes(x = time, y = cost)) 
plot <- plot + geom_point(size = 1.5) 
plot <- plot + geom_point(data = single_point, colour = "red", size = 1.5) 
plot <- plot + geom_point(data = sdbws, colour = "green", size = 1.5, alpha =0.7)
plot <- plot + geom_hline(yintercept=0.00045, linetype="dashed", color = "red")
plot <- plot + geom_vline(xintercept=40000, linetype="dashed", color = "red")
plot <- plot
plot
#+ geom_point(data = single_point, colour = "red", aes(x = time, y = cost)
  