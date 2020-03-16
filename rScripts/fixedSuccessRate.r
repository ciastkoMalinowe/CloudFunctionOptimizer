library(tidyverse)
require(ggplot2)
algorithm <- "montage"

fixedBudget <- 0.75
selectedDag <- 0.15

df <- read.csv(sprintf("/home/mamajews/Development/CloudFunctionOptimizer/outputs_multiple/all_%s.txt", algorithm), stringsAsFactors = FALSE)
names(df) <- c('time', 'cost', 'algorithm', 'deadlineParameter', 'budgetParameter', 'userDeadline', 'userBudget',
               'dag', 'inConstraints')
keeps <- c('algorithm', 'deadlineParameter', 'budgetParameter', 'dag', 'inConstraints', 'time', 'cost')
df <- df %>% filter(dag == selectedDag)
df <- df %>% filter(df$budgetParameter == fixedBudget)


parameters <- data.frame(0, 0.25)
parameters <- rbind(parameters, c(0.25, 0.5))
parameters <- rbind(parameters, c(0.5, 0.75))
parameters <- rbind(parameters, c(0.75, 1))
names(parameters) <- c('lowerBound', 'upperBound')


dfCut <- df[keeps]
allAlgorithms <- unique(df[['algorithm']])
allDags <- unique(df[['dag']])
options(stringsAsFactors = FALSE)
result <- data.frame(alg = character(), percentage = double(), bounds = character())

for (i in seq_len(nrow(parameters))) {
  lowerBound <- parameters[i, 1]
  upperBound <- parameters[i, 2]
  for (alg in allAlgorithms) {
    dfCut <- df[keeps]
    dfCut <- dfCut %>% filter(df$deadlineParameter >= lowerBound & df$deadlineParameter < upperBound)
    algorithmFiltered <- dfCut %>% filter(algorithm == alg)
    noObservations <- nrow(algorithmFiltered)
    success <- nrow(algorithmFiltered %>% filter(inConstraints == 'true'))
    bounds <- sprintf("[%.2f, %.2f)", lowerBound, upperBound)
    toBeAppended <- data.frame(alg, success / noObservations, bounds)
    result <- rbind(result, toBeAppended)
  }
}


names(result)[2] <- "success rate"
names(result)[3] <- "dag"
result <- mutate(result,
                 `number of base executions` = gsub("workflow_", "", gsub("ellipsoids_", "", gsub(".json", "", dag)))
)

result <- mutate(result,
                 `asNumber` = strtoi(`number of base executions`, base = 0L)

)

tikz(sprintf('/home/mamajews/Development/Lambda-Scheduling-MSc/images/success-rate-%s-%s-budget-fixed-%s.tex', selectedDag, algorithm, fixedBudget)
  , width = 3.5, height = 3)
labX <- "Deadline parameter range"
ggplot(result, aes(x = `number of base executions`, y = result$`success rate`, fill = alg)) +
  geom_col(position = "dodge", colour = "black") +
  ylab("success rate") +
  scale_fill_brewer(palette = "Pastel1") +
  theme(legend.position = "top") +
  xlab(labX)
dev.off()

#
# resultSum <- data.frame(alg = character(), 'success rate' = double())
# for (algCursor in allAlgorithms){
#   allSuccessRates <- (result %>% filter(alg == algCursor))$'success rate'
#   avg = mean(allSuccessRates)
#   toBeAppended <- data.frame(algCursor, avg)
#   resultSum <- rbind(resultSum, toBeAppended)
# }
#
# #tikz(sprintf('/home/mamajews/Development/Lambda-Scheduling-MSc/images/summarized-%s.tex',algorithm),width=3.5, height=3)
# ggplot(resultSum, aes(x = reorder(algCursor, -avg), y = avg)) +
#   geom_col(fill = "lightblue", colour = "black") +
#   ylab("success rate") +
#   xlab("algorithm")
# scale_fill_brewer(palette = "Pastel1")
# dev.off()
