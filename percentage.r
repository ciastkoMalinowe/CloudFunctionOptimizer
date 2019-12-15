library(tidyverse)
require(ggplot2)

df <- read.csv('/home/mamajews/Development/CloudFunctionOptimizer/outputs_multiple/all_ellipsoids.txt', stringsAsFactors = FALSE)
names(df) <- c('time', 'cost', 'algorithm', 'deadlineParameter', 'budgetParameter', 'userDeadline', 'userBudget',
               'dag', 'inConstraints')
keeps <- c('algorithm', 'deadlineParameter', 'budgetParameter', 'dag', 'inConstraints')
df <- df %>% filter(dag == 'ellipsoids_10.json')
dfCut <- df[keeps]

allAlgorithms <- unique(df[['algorithm']])

options(stringsAsFactors=FALSE)
result <- data.frame(alg = character(), percentage = double())
for (alg in allAlgorithms){
  print(alg)
  algorithmFiltered <- dfCut %>% filter(algorithm == alg)
  noObservations <- nrow(algorithmFiltered)
  
  success <- nrow(algorithmFiltered %>% filter(inConstraints == 'true'))
  print(success / noObservations)
  toBeAppended <- data.frame(alg, success/noObservations)
  result <- rbind(result, toBeAppended)
}