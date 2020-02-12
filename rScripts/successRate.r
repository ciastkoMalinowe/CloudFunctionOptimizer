library(tidyverse)
require(ggplot2)

df <- read.csv('/home/mamajews/development/CloudFunctionOptimizer/outputs_multiple/all_ellipsoids.txt', stringsAsFactors = FALSE)
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
result <- mutate(result,
       `number of base executions` = gsub("ellipsoids_", "",gsub(".json", "" ,dag))
)
ggplot(result, aes(x = `number of base executions`, y = result$`success rate`, fill = alg)) +
  geom_col(position = "dodge", colour = "black") +
  ylab("success rate") +
  scale_fill_brewer(palette = "Pastel1") +
  theme(legend.position="top") +
  xlab("number of base executions")


resultSum <- data.frame(alg = character(), 'success rate' = double())
for (algCursor in allAlgorithms){
  allSuccessRates <- (result %>% filter(alg == algCursor))$'success rate'
  avg = mean(allSuccessRates)
  toBeAppended <- data.frame(algCursor, avg)
  resultSum <- rbind(resultSum, toBeAppended)
}


ggplot(resultSum, aes(x = reorder(algCursor, -avg), y = avg)) +
  geom_col(fill = "lightblue", colour = "black") +
  ylab("success rate") +
  xlab("algorithm")
  scale_fill_brewer(palette = "Pastel1")

