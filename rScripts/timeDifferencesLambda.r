library(tidyverse)
require(tikzDevice)

df <- read.csv("/home/mamajews/Development/CloudFunctionOptimizer/timeDifferences/lambdaExecutionTime.csv", stringsAsFactors = FALSE, sep = ";")
names(df) <- c('lambdaSize', 'date', 'execTime')

grouped <- group_by(df, lambdaSize) %>% summarize(average = mean(execTime), sd = sd(execTime))

# percentiled <- group_by(df, lambdaSize) %>% mutate(percrank=rank(execTime)/length(execTime))
# percentiled <- percentiled %>% filter(percrank > 0.90) %>% group_by(lambdaSize) %>% summarise(count = n(), proportion = count / nrow(.))


mutate(percrank = rank(value) / length(value))
# grouped <- grouped  %>% add_column(percentageToAverageTime = (grouped$sd / grouped$average) *  100)


a <- ggplot(df %>% filter(lambdaSize == 128), aes(x = execTime)) +
  geom_histogram() +
  xlab("execution time [s]") +
  ggtitle("128 MB")

b <- ggplot(df %>% filter(lambdaSize == 256), aes(x = execTime)) +
  geom_histogram() +
  xlab("execution time [s]") +
  ggtitle("256 MB")
c <- ggplot(df %>% filter(lambdaSize == 512), aes(x = execTime)) +
  geom_histogram() +
  xlab("execution time [s]") +
  ggtitle("512 MB")
d <- ggplot(df %>% filter(lambdaSize == 1024), aes(x = execTime)) +
  geom_histogram() +
  xlab("execution time [s]") +
  ggtitle("1024 MB")
e <- ggplot(df %>% filter(lambdaSize == 1536), aes(x = execTime)) +
  geom_histogram() +
  xlab("execution time [s]") +
  ggtitle("1536 MB")

tikz('/home/mamajews/Development/Lambda-Scheduling-MSc/images/timeExecutionICSRHistogram.tex', width = 6.5, height = 5.2)
library(patchwork)
a + b + c + d + e
dev.off()