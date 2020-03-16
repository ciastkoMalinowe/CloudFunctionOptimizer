library(tidyverse)
require(ggplot2)
algorithm <- "montage"
df <- read.csv(sprintf("/home/mamajews/Development/CloudFunctionOptimizer/outputs_multiple/all_%s.txt", algorithm), stringsAsFactors = FALSE)
names(df) <- c('time', 'cost', 'algorithm', 'deadlineParameter', 'budgetParameter', 'userDeadline', 'userBudget',
               'dag', 'inConstraints')
df <- df %>% filter(df$dag == 0.15)
df$inConstraints <- as.integer(as.logical(df$inConstraints))
keeps <- c('algorithm', 'deadlineParameter', 'budgetParameter', 'dag', 'inConstraints', 'time', 'cost')

allAlgorithms <- unique(df[['algorithm']])
allDags <- unique(df[['dag']])

#df <- df %>% filter(dag == 'ellipsoids_10.json')
options(stringsAsFactors=FALSE)


  # & df$inConstraints == 1)

dfCut <- df[keeps]
moheft <- dfCut %>% filter(df$algorithm == "moheft")
moheftLoss <- dfCut %>% filter(df$algorithm == "moheft-loss")
sdbcs <- dfCut %>% filter(df$algorithm == "sdbcs")
sdbws <- dfCut %>% filter(df$algorithm == "sdbws")


moheftPlot <- ggplot(data = moheft, aes(x = moheft$budgetParameter, y = moheft$deadlineParameter, ymin=0.1, ymax=1, xmin=0.1, xmamx=1, color=factor(moheft$inConstraints))) +
  geom_point() +
  scale_color_manual(values=c("#FF0000", "#008000")) +
  theme(legend.title = element_blank()) +
  theme(legend.position = "none") +
  xlab("budget parameter") +
  ylab("deadline parameter") +
  ggtitle("moheft")

moheftLossPlot <- ggplot(data = moheftLoss, aes(x = moheftLoss$budgetParameter, y = moheftLoss$deadlineParameter, ymin=0.1, ymax=1, xmin=0.1, xmamx=1, color=factor(moheftLoss$inConstraints))) +
  geom_point() +
  scale_color_manual(values=c("#FF0000", "#008000")) +
  theme(legend.title = element_blank()) +
  theme(legend.position = "none") +
  xlab("budget parameter") +
  ylab("deadline parameter") +
  ggtitle("moheft-loss")

sdbcsPlot <- ggplot(data = sdbcs, aes(x = sdbcs$budgetParameter, y = sdbcs$deadlineParameter, ymin=0.1, ymax=1, xmin=0.1, xmamx=1, color=factor(sdbcs$inConstraints))) +
  geom_point() +
  scale_color_manual(values=c("#FF0000", "#008000")) +
  theme(legend.title = element_blank()) +
  theme(legend.position = "none") +
  xlab("budget parameter") +
  ylab("deadline parameter") +
  ggtitle("sdbcs")

sdbwsPlot <- ggplot(data = sdbws, aes(x = sdbws$budgetParameter, y = sdbws$deadlineParameter, ymin=0.1, ymax=1, xmin=0.1, xmamx=1, color=factor(sdbws$inConstraints))) +
  geom_point() +
  scale_color_manual(values=c("#FF0000", "#008000")) +
  theme(legend.title = element_blank()) +
  theme(legend.position = "none") +
  xlab("budget parameter") +
  ylab("deadline parameter") +
  ggtitle("sdbws")

library(patchwork)
tikz(sprintf('/home/mamajews/Development/Lambda-Scheduling-MSc/images/montage-0.15-breakdown.tex',algorithm),width=6, height=5)
sdbwsPlot + sdbcsPlot + moheftPlot + moheftLossPlot
dev.off()