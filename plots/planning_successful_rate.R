setwd('/Users/yoshimori/Studyspace/Magisterka/CloudFunctionOptimizer')
library('ggplot2')

# Generally it does not look pretty :(

results = read.table("./results.csv",header = TRUE)

sdbcs = results[results[, "algorithm"] == "sdbcs",]
sdbws = results[results[, "algorithm"] == "sdbws",]

sdbcs_B03 = sdbcs[sdbcs[, "budget"] == 0.3,]
sdbcs_B03_D03 = sdbcs_B03[sdbcs_B03[, "deadline"] == 0.3,]
sdbcs_B03_D03_SR = round(nrow(sdbcs_B03_D03[sdbcs_B03_D03[, "inConstrains"] == 1,])/2.2, 2)
sdbcs_B03_D05 = sdbcs_B03[sdbcs_B03[, "deadline"] == 0.5,]
sdbcs_B03_D05_SR = round(nrow(sdbcs_B03_D05[sdbcs_B03_D05[, "inConstrains"] == 1,])/2.2, 2)
sdbcs_B03_D07 = sdbcs_B03[sdbcs_B03[, "deadline"] == 0.7,]
sdbcs_B03_D07_SR = round(nrow(sdbcs_B03_D07[sdbcs_B03_D07[, "inConstrains"] == 1,])/2.2, 2)

sdbcs_B05 = sdbcs[sdbcs[, "budget"] == 0.5,]
sdbcs_B05_D03 = sdbcs_B05[sdbcs_B05[, "deadline"] == 0.3,]
sdbcs_B05_D03_SR = round(nrow(sdbcs_B05_D03[sdbcs_B05_D03[, "inConstrains"] == 1,])/2.2, 2)
sdbcs_B05_D05 = sdbcs_B05[sdbcs_B05[, "deadline"] == 0.5,]
sdbcs_B05_D05_SR = round(nrow(sdbcs_B05_D05[sdbcs_B05_D05[, "inConstrains"] == 1,])/2.2, 2)
sdbcs_B05_D07 = sdbcs_B05[sdbcs_B05[, "deadline"] == 0.7,]
sdbcs_B05_D07_SR = round(nrow(sdbcs_B05_D07[sdbcs_B05_D07[, "inConstrains"] == 1,])/2.2, 2)

sdbcs_B07 = sdbcs[sdbcs[, "budget"] == 0.7,]
sdbcs_B07_D03 = sdbcs_B07[sdbcs_B07[, "deadline"] == 0.3,]
sdbcs_B07_D03_SR = round(nrow(sdbcs_B07_D03[sdbcs_B07_D03[, "inConstrains"] == 1,])/2.2, 2)
sdbcs_B07_D05 = sdbcs_B07[sdbcs_B07[, "deadline"] == 0.5,]
sdbcs_B07_D05_SR = round(nrow(sdbcs_B07_D05[sdbcs_B07_D05[, "inConstrains"] == 1,])/2.2, 2)
sdbcs_B07_D07 = sdbcs_B07[sdbcs_B07[, "deadline"] == 0.7,]
sdbcs_B07_D07_SR = round(nrow(sdbcs_B07_D07[sdbcs_B07_D07[, "inConstrains"] == 1,])/2.2, 2)

sdbws_B03 = sdbws[sdbws[, "budget"] == 0.3,]
sdbws_B03_D03 = sdbws_B03[sdbws_B03[, "deadline"] == 0.3,]
sdbws_B03_D03_SR = round(nrow(sdbws_B03_D03[sdbws_B03_D03[, "inConstrains"] == 1,])/2.2, 2)
sdbws_B03_D05 = sdbws_B03[sdbws_B03[, "deadline"] == 0.5,]
sdbws_B03_D05_SR = round(nrow(sdbws_B03_D05[sdbws_B03_D05[, "inConstrains"] == 1,])/2.2, 2)
sdbws_B03_D07 = sdbws_B03[sdbws_B03[, "deadline"] == 0.7,]
sdbws_B03_D07_SR = round(nrow(sdbws_B03_D07[sdbws_B03_D07[, "inConstrains"] == 1,])/2.2, 2)

sdbws_B05 = sdbws[sdbws[, "budget"] == 0.5,]
sdbws_B05_D03 = sdbws_B05[sdbws_B05[, "deadline"] == 0.3,]
sdbws_B05_D03_SR = round(nrow(sdbws_B05_D03[sdbws_B05_D03[, "inConstrains"] == 1,])/2.2, 2)
sdbws_B05_D05 = sdbws_B05[sdbws_B05[, "deadline"] == 0.5,]
sdbws_B05_D05_SR = round(nrow(sdbws_B05_D05[sdbws_B05_D05[, "inConstrains"] == 1,])/2.2, 2)
sdbws_B05_D07 = sdbws_B05[sdbws_B05[, "deadline"] == 0.7,]
sdbws_B05_D07_SR = round(nrow(sdbws_B05_D07[sdbws_B05_D07[, "inConstrains"] == 1,])/2.2, 2)

sdbws_B07 = sdbws[sdbws[, "budget"] == 0.7,]
sdbws_B07_D03 = sdbws_B07[sdbws_B07[, "deadline"] == 0.3,]
sdbws_B07_D03_SR = round(nrow(sdbws_B07_D03[sdbws_B07_D03[, "inConstrains"] == 1,])/2.2, 2)
sdbws_B07_D05 = sdbws_B07[sdbws_B07[, "deadline"] == 0.5,]
sdbws_B07_D05_SR = round(nrow(sdbws_B07_D05[sdbws_B07_D05[, "inConstrains"] == 1,])/2.2, 2)
sdbws_B07_D07 = sdbws_B07[sdbws_B07[, "deadline"] == 0.7,]
sdbws_B07_D07_SR = round(nrow(sdbws_B07_D07[sdbws_B07_D07[, "inConstrains"] == 1,])/2.2, 2)

budget_03 <- data.frame("Algorithm"=c("sdbcs", "sdbcs", "sdbcs", "sdbws", "sdbws", "sdbws"), "Deadline" = c("0.3", "0.5", "0.7", "0.3", "0.5", "0.7"), "Success Rate" = c(sdbcs_B03_D03_SR, sdbcs_B03_D05_SR, sdbcs_B03_D07_SR, sdbws_B03_D03_SR, sdbws_B03_D05_SR, sdbws_B03_D07_SR))
budget_05 <- data.frame("Algorithm"=c("sdbcs", "sdbcs", "sdbcs", "sdbws", "sdbws", "sdbws"), "Deadline" = c("0.3", "0.5", "0.7", "0.3", "0.5", "0.7"), "Success Rate" = c(sdbcs_B05_D03_SR, sdbcs_B05_D05_SR, sdbcs_B05_D07_SR, sdbws_B05_D03_SR, sdbws_B05_D05_SR, sdbws_B05_D07_SR))
budget_07 <- data.frame("Algorithm"=c("sdbcs", "sdbcs", "sdbcs", "sdbws", "sdbws", "sdbws"), "Deadline" = c("0.3", "0.5", "0.7", "0.3", "0.5", "0.7"), "Success Rate" = c(sdbcs_B07_D03_SR, sdbcs_B07_D05_SR, sdbcs_B07_D07_SR, sdbws_B07_D03_SR, sdbws_B07_D05_SR, sdbws_B07_D07_SR))

ggplot(data=budget_03, aes(x=Deadline, y=Success.Rate, fill=Algorithm)) + geom_bar(stat="identity", position=position_dodge()) + geom_text(aes(label=Success.Rate), vjust=1.6, color="white", position = position_dodge(0.9), size=7) + ylab("Planning Success Rate (%)") + theme(plot.title = element_text(hjust = 0.5)) + theme(axis.title=element_text(size=36)) + theme(axis.text.y = element_text(size=30)) + theme (axis.text.x = element_text(size=30)) + theme(legend.text = element_text(size = 30), legend.title = element_text(size = 30))
ggplot(data=budget_05, aes(x=Deadline, y=Success.Rate, fill=Algorithm)) + geom_bar(stat="identity", position=position_dodge()) + geom_text(aes(label=Success.Rate), vjust=1.6, color="white", position = position_dodge(0.9), size=7) + ylab("Planning Success Rate (%)") + theme(plot.title = element_text(hjust = 0.5)) + theme(axis.title=element_text(size=36)) + theme(axis.text.y = element_text(size=30)) + theme (axis.text.x = element_text(size=30)) + theme(legend.text = element_text(size = 30), legend.title = element_text(size = 30))
ggplot(data=budget_07, aes(x=Deadline, y=Success.Rate, fill=Algorithm)) + geom_bar(stat="identity", position=position_dodge()) + geom_text(aes(label=Success.Rate), vjust=1.6, color="white", position = position_dodge(0.9), size=7) + ylab("Planning Success Rate (%)") + theme(plot.title = element_text(hjust = 0.5)) + theme(axis.title=element_text(size=36)) + theme(axis.text.y = element_text(size=30)) + theme (axis.text.x = element_text(size=30)) + theme(legend.text = element_text(size = 30), legend.title = element_text(size = 30))

