library(tidyverse)
require(ggplot2)
library(tikzDevice)

df <- read.csv('/home/mamajews/Development/normalized_logs.csv',
               stringsAsFactors = FALSE,
               sep="")
df <- df %>% filter(resource == 128)

minimum <- min(df$request_start)
df$request_start <- (df$request_start - minimum) / 1000 
df$request_end <- (df$request_end - minimum) / 1000
int_breaks <- function(x, n = 5) pretty(x, n)[pretty(x, n) %% 1 == 0] 
tikz('/home/mamajews/Development/Lambda-Scheduling-MSc/images/ellipsoids-small-execution.tex',width=3.5, height=3)
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
dev.off()