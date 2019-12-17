library(tidyverse)
require(ggplot2)

df <- read.csv('/home/mamajews/development/CloudFunctionOptimizer/outputs_multiple/all_ellipsoids_fix.txt', stringsAsFactors = FALSE)
names(df) <- c('time', 'cost', 'algorithm', 'deadlineParameter', 'budgetParameter', 'userDeadline', 'userBudget',
               'dag', 'inConstraints')
keeps <- c('algorithm', 'deadlineParameter', 'budgetParameter', 'dag', 'inConstraints')
dfCut <- df[keeps]

allAlgorithms <- unique(df[['algorithm']])
allDags <- unique(df[['dag']])

#df <- df %>% filter(dag == 'ellipsoids_10.json')
options(stringsAsFactors=FALSE)
result <- data.frame(alg = character(), percentage = double(), dag = character())

for (dagCursor in allDags){
  for (alg in allAlgorithms){
    dfCut <- df[keeps]
    dfCut <- dfCut %>% filter(dag == dagCursor)
    algorithmFiltered <- dfCut %>% filter(algorithm == alg)
    noObservations <- nrow(algorithmFiltered)
    
    success <- nrow(algorithmFiltered %>% filter(inConstraints == 'true'))
    print(success / noObservations)
    toBeAppended <- data.frame(alg, success/noObservations, dagCursor)
    result <- rbind(result, toBeAppended)
  }
}

names(result)[2] <- "success rate"
names(result)[3] <- "dag"
  
ggplot(result, aes(x = dag, y = result$`success rate`, fill = alg)) +
  geom_col(position = "dodge", colour = "black") +
  ylab("success rate") +
  scale_fill_brewer(palette = "Pastel1")
