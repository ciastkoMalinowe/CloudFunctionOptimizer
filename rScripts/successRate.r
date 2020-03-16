library(tidyverse)
require(ggplot2)
algorithm <- "montage"
df <- read.csv(sprintf("/home/mamajews/Development/CloudFunctionOptimizer/outputs_multiple/all_%s.txt", algorithm), stringsAsFactors = FALSE)
names(df) <- c('time', 'cost', 'algorithm', 'deadlineParameter', 'budgetParameter', 'userDeadline', 'userBudget',
               'dag', 'inConstraints')
keeps <- c('algorithm', 'deadlineParameter', 'budgetParameter', 'dag', 'inConstraints', 'time', 'cost')
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
    #noObservations <- 324
    success <- nrow(algorithmFiltered %>% filter(inConstraints == 'true'))
    print(success)
    print(noObservations)
    print(success / noObservations)
    toBeAppended <- data.frame(alg, success/noObservations, dagCursor)
    result <- rbind(result, toBeAppended)
  }
}

names(result)[2] <- "success rate"
names(result)[3] <- "dag"
result <- mutate(result,
                 `number of base executions` = gsub("workflow_", "", gsub("ellipsoids_", "",gsub(".json", "" ,dag)))
)

result <- mutate(result,
                 `asNumber` = strtoi(`number of base executions`, base = 0L)
                 
)

labX <- "number of nodes"
tikz(sprintf('/home/mamajews/Development/Lambda-Scheduling-MSc/images/success-rate-%s.tex', algorithm),width=6, height=3)
ggplot(result, aes(x = `number of base executions`, y = result$`success rate`, fill = alg)) +
  geom_col(position = "dodge", colour = "black") +
  ylab("success rate") +
  scale_fill_brewer(palette = "Pastel1") +
  theme(legend.position="top") +
  xlab(labX)
dev.off()

resultSum <- data.frame(alg = character(), 'success rate' = double())
for (algCursor in allAlgorithms){
  allSuccessRates <- (result %>% filter(alg == algCursor))$'success rate'
  avg = mean(allSuccessRates)
  toBeAppended <- data.frame(algCursor, avg)
  resultSum <- rbind(resultSum, toBeAppended)
}

tikz(sprintf('/home/mamajews/Development/Lambda-Scheduling-MSc/images/summarized-%s.tex',algorithm),width=3.5, height=3)
ggplot(resultSum, aes(x = reorder(algCursor, -avg), y = avg)) +
  geom_col(fill = "lightblue", colour = "black") +
  ylab("success rate") +
  xlab("algorithm")
scale_fill_brewer(palette = "Pastel1")
dev.off()

#Scatter plot 
tikz('scatter-plot-montage.tex',width=5, height=3)

df <- df %>% filter(dag == '0.15')
df <- df %>% filter(dag == '0.15')
ggplot(df, aes(x=df$cost, y=df$time, color=algorithm,shape=algorithm)) +
  geom_point(size=5) + xlab('cost')+ ylab('time') +  theme(legend.position="top") + scale_fill_discrete(name="Experimental\nCondition")
dev.off()