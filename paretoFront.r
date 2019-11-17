df <- read.csv("/home/mamajews/Development/CloudFunctionOptimizer/every_possible_output/paretoFront1.txt")
names(df) <- c('time','cost')

single_point <- data.frame(35909,0.000415724)
names(single_point) <- c('time','cost')

sdbws <- data.frame(36962, 0.00040032)
names(sdbws) <- c('time','cost') 

require(ggplot2)
library(ggrepel)
ggplot(data = df, aes(x = time, y = cost)) + geom_point(size = 4) + geom_point(data = single_point, colour = "red", size = 2) + geom_point(data = sdbws, colour = "green", size = 2)
#+ geom_point(data = single_point, colour = "red", aes(x = time, y = cost)
  