require(ggplot2)
require(zoo)
require(tidyverse)
require(patchwork)
require(gridExtra)
require(tikzDevice)
require(stringr)
library(patchwork)


df <- read.csv("times_file.csv")
names(df) <- c('time', 'algorithm', 'dag')
grouped <- group_by(df, algorithm, dag) %>% summarize(m = mean(time), sd = sd(time), count = n())
grouped <- add_column(grouped, shortDagName = str_split(str_split(str_split(grouped$dag, "/", simplify = TRUE)[, 2], "\\.json", simplify = TRUE)[, 1], "-", simplify = TRUE)[,2])
print(grouped)

#data = . %>% filter(algorithm %in% c("moheft", "moheft-loss")),
getPlot <- function(grouped, pallete) ggplot(data = grouped, aes(x = shortDagName, y = m, fill = algorithm)) +
  geom_bar(
    stat = "identity", position = position_dodge(), colour = "black") +
  xlab("montage degree") +
  ylab("time [s]") +
  scale_fill_brewer(palette = pallete) +
  geom_errorbar(aes(ymin = m - sd, ymax = m + sd), width = .1, position = position_dodge(.9)) +
  theme(legend.position = "top")

tikz('/home/mamajews/Development/Lambda-Scheduling-MSc/images/summarized-execution-time-montage.tex', width = 6, height = 3)
plot1 <- getPlot(grouped %>% filter(algorithm %in% c("moheft", "moheft-loss")), "Pastel1")
plot2 <- getPlot(grouped %>% filter(algorithm %in% c("sdbcs", "sdbws")), "Pastel2")
plot1 + plot2
dev.off()
#
# grouped <- grouped %>% mutate(lowerBound = rollm - sd)
# grouped <- grouped %>% mutate(upperBound = rollm + sd)
#
# main_plot <- ggplot(grouped, ymin = 0, ymax = 550) +
#   geom_point(aes(x = attemptNumber, y = m, color = 'results'), size = 0.05, alpha = 3 / 10) +
#   geom_smooth(aes(x = attemptNumber, y = rollm, colour = 'rolling average'), size = 0.4, se = FALSE) +
#   # geom_line(aes(x = attemptNumber, y = rollm, colour = 'rolling average'), size = 0.4, se = FALSE) +
#   geom_smooth(aes(x = attemptNumber, y = lowerBound, colour = 'lower bound sd'), size = 0.5, se = FALSE, linetype = "dashed") +
#   geom_smooth(aes(x = attemptNumber, y = upperBound, colour = 'upper bound sd'), size = 0.5, se = FALSE, linetype = "dashed") +
#   xlab('attempt number') +
#   ylab("reward") +
#   scale_colour_manual(name = "type", values = c('results' = "black", 'rolling average' = 'red', 'lower bound sd' = 'yellow', 'upper bound sd' = 'orange')) +
#   theme(legend.position = "bottom") +
#   ylim(0,550)
# main_plot
#
#
# parameter_plot <- ggplot(grouped) +
#   geom_line(aes(x = attemptNumber, y = experimentRate, colour = "experiment rate")) +
#   geom_line(aes(x = attemptNumber, y = learningRate, colour = 'learning rate')) +
#   xlab('attempt number') +
#   ylab('rate') +
#   scale_colour_manual(name = "type", values = c('learning rate' = "red", 'experiment rate' = "blue")) +
#   theme(legend.position = "bottom") +
#   ylim(0,1)
#
# # tikz('/home/mamajews/Development/IWIUMLab2/plot-qlearning-sarsa-3.tex',width=6, height=5)
# main_plot +
#   parameter_plot +
#   plot_layout(ncol = 1, widths = c(1, 1), heights = c(3,1))
# # dev.off()