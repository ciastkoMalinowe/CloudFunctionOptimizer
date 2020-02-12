library(tidyverse)
require(ggplot2)

df <- read.csv('/home/mamajews/development/CloudFunctionOptimizer/results/step1/ellipsoids_AWS_128_256_512_1024_1536_2048_2560_3008x1/normalized_logs.csv', 
               stringsAsFactors = FALSE,
               sep="")
df <- df %>% filter(resource == 128)

minimum <- min(df$request_start)
df$request_start <- (df$request_start - minimum) /1000
df$request_end <- (df$request_end - minimum) /1000

ggplot(df) +
  geom_segment( aes(x=df$id, xend=df$id, y=df$request_start, yend=df$request_end), color="grey") +
  geom_point( aes(x=df$id, y=df$request_start), color=rgb(0.2,0.7,0.1,0.5), size=1 ) +
  geom_point( aes(x=df$id, y=df$request_end), color=rgb(0.7,0.2,0.1,0.5), size=1 ) +
  coord_flip()+
  theme(
    legend.position = "none",
  ) +
  xlab("Task id") +
  ylab("Time [s]")