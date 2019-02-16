setwd('/Users/yoshimori/Studyspace/Magisterka/CloudFunctionOptimizer/plots')
library('ggplot2')
csv_256_results = read.table("../results/output256/real_avg_execution.csv",header = TRUE)
csv_512_results = read.table("../results/output512/real_avg_execution.csv",header = TRUE)
csv_1024_results = read.table("../results/output1024/real_avg_execution.csv",header = TRUE)
csv_1536_results = read.table("../results/output1536/real_avg_execution.csv",header = TRUE)
csv_2048_results = read.table("../results/output2048/real_avg_execution.csv",header = TRUE)
csv_2560_results = read.table("../results/output2560/real_avg_execution.csv",header = TRUE)
csv_3008_results = read.table("../results/output3008/real_avg_execution.csv",header = TRUE)
csv_256_results = csv_256_results[order(csv_256_results$id),]
csv_256_results$type <- '256'
csv_512_results = csv_512_results[order(csv_512_results$id),]
csv_512_results$type <- '512'
csv_1024_results = csv_1024_results[order(csv_1024_results$id),]
csv_1024_results$type <- '1024'
csv_1536_results = csv_1536_results[order(csv_1536_results$id),]
csv_1536_results$type <- '1536'
csv_2048_results = csv_2048_results[order(csv_2048_results$id),]
csv_2048_results$type <- '2048'
csv_2560_results = csv_2560_results[order(csv_2560_results$id),]
csv_2560_results$type <- '2560'
csv_3008_results = csv_3008_results[order(csv_3008_results$id),]
csv_3008_results$type <- '3008'
results <- rbind(csv_256_results, csv_512_results, csv_1024_results, csv_1536_results, csv_2048_results, csv_2560_results, csv_3008_results)

ggplot(results, aes(x=id, y=time, colour=type)) + geom_point() + theme(axis.text.x = element_text(angle = 90, hjust = 1))

