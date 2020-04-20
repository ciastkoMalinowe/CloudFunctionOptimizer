library(tidyverse)
require(ggplot2)
library(tikzDevice)


scheduled <- read.csv('/home/mamajews/Development/CloudFunctionOptimizer/results/step2/montage_AWS_512_1024_1536_2048_2560_3008x5/0.1-0.1-scheduled.csv', sep = "\t", header = FALSE)
names(scheduled) <- c('id', 'functionType', 'startTime', 'endTime')
scheduled$startTime <- (scheduled$startTime) / 1000
scheduled$endTime <- (scheduled$endTime ) / 1000
scheduled$functionType = as.character(scheduled$functionType)

tikz('/home/mamajews/Development/Lambda-Scheduling-MSc/images/execution-graph-montage-function-type0101.tex', width = 6, height = 5.5)

ggplot(scheduled) +
  geom_segment(aes(x = id, xend = id, y = startTime, yend = endTime, colour=functionType), size=5) +
  # geom_rect(aes(x = id, xend = id, y = startTime, yend = endTime), color = "grey", ) +
  # geom_point( aes(x=id, y=startTime), color=rgb(0.2,0.7,0.1,0.5), size=2 ) +
  # geom_point( aes(x=id, y=endTime), color=rgb(0.7,0.2,0.1,0.5), size=2) +
  coord_flip()+
  xlab("Task id") +
  ylab("Time [s]") +
  labs(colour = "Function type") +
  scale_x_continuous(breaks = seq(1, 34, by = 1))

dev.off()

scheduled <- read.csv('/home/mamajews/Development/CloudFunctionOptimizer/results/step2/montage_AWS_512_1024_1536_2048_2560_3008x5/0.8-0.8-scheduled.csv', sep = "\t", header = FALSE)
names(scheduled) <- c('id', 'functionType', 'startTime', 'endTime')
scheduled$startTime <- (scheduled$startTime) / 1000
scheduled$endTime <- (scheduled$endTime ) / 1000
scheduled$functionType = as.character(scheduled$functionType)

tikz('/home/mamajews/Development/Lambda-Scheduling-MSc/images/execution-graph-montage-function-type0808.tex', width = 6, height = 5.5)

ggplot(scheduled) +
  geom_segment(aes(x = id, xend = id, y = startTime, yend = endTime, colour=functionType), size=5) +
  # geom_rect(aes(x = id, xend = id, y = startTime, yend = endTime), color = "grey", ) +
  # geom_point( aes(x=id, y=startTime), color=rgb(0.2,0.7,0.1,0.5), size=2 ) +
  # geom_point( aes(x=id, y=endTime), color=rgb(0.7,0.2,0.1,0.5), size=2) +
  coord_flip()+
  xlab("Task id") +
  ylab("Time [s]") +
  labs(colour = "Function type") +
  scale_x_continuous(breaks = seq(1, 34, by = 1))

dev.off()

real_executed <- read.csv('/home/mamajews/Development/CloudFunctionOptimizer/test.csv', sep= " ", header=TRUE)
minimum <- min(real_executed$request_start)
real_executed$request_start <- (real_executed$request_start - minimum) / 1000
real_executed$request_end <- (real_executed$request_end - minimum) / 1000

scheduled <- scheduled %>% add_column(type_of_run = "scheduled")
real_executed <- real_executed %>% add_column(type_of_run = "real")

tikz('/home/mamajews/Development/Lambda-Scheduling-MSc/images/execution-graph-montage-real-scheduled.tex', width = 6, height = 5.5)
ggplot() +
  geom_segment(data = real_executed, aes(x = id, xend = id, y = request_start, yend = request_end,  colour=type_of_run), size=6, alpha = 0.8) +
  geom_segment(data = scheduled, aes(x = id, xend = id, y = startTime, yend = endTime, colour=type_of_run), size=4) +
  # geom_rect(aes(x = id, xend = id, y = startTime, yend = endTime), color = "grey", ) +
  # geom_point( aes(x=id, y=startTime), color=rgb(0.2,0.7,0.1,0.5), size=2 ) +
  # geom_point( aes(x=id, y=endTime), color=rgb(0.7,0.2,0.1,0.5), size=2) +
  coord_flip()+
  xlab("Task id") +
  ylab("Time [s]") +
  labs(colour = "Execution type") +
  scale_x_continuous(breaks = seq(1, 34, by = 1))
dev.off()

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