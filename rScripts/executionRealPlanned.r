library(tidyverse)
require(ggplot2)
library(tikzDevice)
library(jsonlite)


scheduled <- read.csv('/home/mamajews/Development/CloudFunctionOptimizer/results/step2/montage_AWS_512_1024_1536_2048_2560_3008x5/scheduled.csv', sep = "\t", header = FALSE)
names(scheduled) <- c('id', 'functionType', 'startTime', 'endTime')
scheduled$startTime <- (scheduled$startTime) / 1000
scheduled$endTime <- (scheduled$endTime ) / 1000
scheduled$functionType = as.character(scheduled$functionType)

ggplot(scheduled) +we
  geom_segment(aes(x = id, xend = id, y = startTime, yend = endTime, colour=functionType), size=5) +
  # geom_rect(aes(x = id, xend = id, y = startTime, yend = endTime), color = "grey", ) +
  # geom_point( aes(x=id, y=startTime), color=rgb(0.2,0.7,0.1,0.5), size=2 ) +
  # geom_point( aes(x=id, y=endTime), color=rgb(0.7,0.2,0.1,0.5), size=2) +
  coord_flip()+
  xlab("Task id") +
  ylab("Time [s]") +
  labs(colour = "Function type") +
  scale_x_continuous(breaks = seq(1, 34, by = 1))



  #
  # minimum <- min(df$request_start)
  # df$request_start <- (df$request_start - minimum) / 1000
  # df$request_end <- (df$request_end - minimum) / 1000
  # int_breaks <- function(x, n = 5) pretty(x, n)[pretty(x, n) %% 1 == 0]
  # tikz('/home/mamajews/Development/Lambda-Scheduling-MSc/images/ellipsoids-small-execution.tex',width=3.5, height=3)
  # ggplot(df) +
  #   geom_segment( aes(x=df$id, xend=df$id, y=df$request_start, yend=df$request_end), color="grey") +
  #   geom_point( aes(x=df$id, y=df$request_start), color=rgb(0.2,0.7,0.1,0.5), size=1 ) +
  #   geom_point( aes(x=df$id, y=df$request_end), color=rgb(0.7,0.2,0.1,0.5), size=1 ) +
  #   coord_flip()+
  #   theme(
  #     legend.position = "none",
  #   ) +
  #   xlab("Task id") +
  #   ylab("Time [s]")
   # dev.off()