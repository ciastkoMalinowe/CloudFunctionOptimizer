setwd('/home/amnich/Documents/magisterka/CloudFunctionOptimizer/time_tests/e200-large')
library('ggplot2')
library('gridExtra')
level_front_loss = read.table("./level_front-loss.csv",header = TRUE)
sdbcs = read.table("./sdbcs.csv",header = TRUE)
sdbws = read.table("./sdbws.csv",header = TRUE)
moheft_loss = read.table("./moheft-loss.csv",header = TRUE)
loss_sdbcs = read.table("./loss-sdbcs.csv",header = TRUE)
loss_sdbws = read.table("./loss-sdbws.csv",header = TRUE)
loss_moheft_loss = read.table("./loss-moheft-loss.csv",header = TRUE)

add_planned <- function(frame) {
  frame$planned = (frame$budget_planned <= frame$budget_calculated) & (frame$deadline_planned <= frame$deadline_calculated)
  frame
}

level_front_loss  = add_planned(level_front_loss)
sdbcs = add_planned(sdbcs)
sdbws = add_planned(sdbws)
moheft_loss = add_planned(moheft_loss)
loss_sdbcs = add_planned(loss_sdbcs)
loss_sdbws = add_planned(loss_sdbws)
loss_moheft_loss = add_planned(loss_moheft_loss)

g1 <- ggplot(level_front_loss, aes(budget, deadline)) + 
  geom_point(aes(colour = planned)) +
  ggtitle('Ellipsoids 200 Levels') + 
  scale_x_continuous(breaks = seq(0, 0.6, by = 0.1)) +
  scale_y_continuous(breaks = seq(0, 0.6, by = 0.05))

g2 <- ggplot(moheft_loss, aes(budget, deadline)) + 
  geom_point(aes(colour = planned)) +
  ggtitle('Ellipsoids 200 Moheft + Loss') +
  scale_x_continuous(breaks = seq(0, 0.6, by = 0.1)) +
  scale_y_continuous(breaks = seq(0, 0.6, by = 0.05))

g3 <- ggplot(loss_moheft_loss, aes(budget, deadline)) + 
  geom_point(aes(colour = planned)) +
  ggtitle('Ellipsoids 200 Moheft + Double Loss') +
  scale_x_continuous(breaks = seq(0, 0.6, by = 0.1)) +
  scale_y_continuous(breaks = seq(0, 0.6, by = 0.05))

g4 <- ggplot(sdbcs, aes(budget, deadline)) + 
  geom_point(aes(colour = planned)) +
  ggtitle('Ellipsoids 200 Sdbcs') +
  scale_x_continuous(breaks = seq(0, 0.6, by = 0.1)) +
  scale_y_continuous(breaks = seq(0, 0.6, by = 0.05))

g5 <- ggplot(loss_sdbcs, aes(budget, deadline)) + 
  geom_point(aes(colour = planned)) +
  ggtitle('Ellipsoids 200 Sdbcs + Loss') + 
  scale_x_continuous(breaks = seq(0, 0.6, by = 0.1)) +
  scale_y_continuous(breaks = seq(0, 0.6, by = 0.05))

g6 <- ggplot(sdbws, aes(budget, deadline)) + 
  geom_point(aes(colour = planned)) +
  ggtitle('Ellipsoids 200 Sdbws') +
  scale_x_continuous(breaks = seq(0, 0.6, by = 0.1)) +
  scale_y_continuous(breaks = seq(0, 0.6, by = 0.05))

g7 <- ggplot(loss_sdbws, aes(budget, deadline)) + 
  geom_point(aes(colour = planned)) +
  ggtitle('Ellipsoids 200 Sdbws + Loss') +
  scale_x_continuous(breaks = seq(0, 0.6, by = 0.1)) +
  scale_y_continuous(breaks = seq(0, 0.6, by = 0.05))

grid.arrange(g1,g2,g3,g4,g5,g6,g7, nrow=3)

scale_x_continuous(breaks = seq(0, 0.2, by = 0.04)) +
  scale_y_continuous(breaks = seq(0, 0.2, by = 0.02))
scale_x_continuous(breaks = seq(0, 0.6, by = 0.1)) +
  scale_y_continuous(breaks = seq(0, 0.6, by = 0.05))

scale_color_manual(values=c("#00BFC4")) +

tasks = read.table("./0.16_0.06/sdbws.csv",header = TRUE)
tasks$start=(tasks$start)/1000
tasks$end=(tasks$end)/1000
tasks = tasks[order(tasks$start),]
tasks$machine = 0
maxmachine=1
for(i in 1:nrow(tasks))
{
  st = tasks$start[i]
  last_tasks = aggregate(end ~ machine, data = tasks, max)
  busy = last_tasks[last_tasks$end < st & last_tasks$machine != 0,]
  print(st)
  print(busy)
  if (nrow(busy)==0)
  {
    tasks$machine[i] = maxmachine
    maxmachine = maxmachine+1
  }
  else tasks$machine[i] = busy$machine[1]
}
tasks

ggplot(tasks, aes(colour=function.)) + geom_segment(aes(x=start, xend=end, y=1:nrow(tasks), yend=1:nrow(tasks)), size=2) + xlab("Time in seconds") + ylab("Task") + scale_y_discrete(labels=tasks$task) + theme (axis.text.y = element_text(size=6)) + theme(legend.justification=c(1,0), legend.position=c(1,0)) + theme(legend.text = element_text(size = 8)) +
  ggtitle('Sdbws 0.16 0.6')

warm_mean <- function(column) {
  mean(x = sort(x = column)[-c(1, length(x = column))])
}

warm_sd <- function(column) {
  sd(x = sort(x = column)[-c(1, length(x = column))])
}

get_avg <- function(normalized, column) {
  with_mean <- aggregate(list(time_mean = normalized[,column]),
                         list(id = normalized$id, resource = normalized$resource),
                         warm_mean)
  
  with_sd <- aggregate(list(time_sd = normalized[,column]),
                       list(id = normalized$id, resource = normalized$resource),
                       warm_sd)
  
  merge(with_mean, with_sd, c("id", "resource"))
}

normalized =read.table("../e100/normalized_logs.csv",header = TRUE)
request_duration <- get_avg(normalized, "request_duration")
request_duration$time_mean <- request_duration$time_mean/1000
request_duration$time_sd <- request_duration$time_sd/1000

ggplot(request_duration, aes(id, time_mean)) + 
  geom_point(aes(colour = resource)) +
 # geom_errorbar(aes(ymin=request_duration_mean-request_duration_sd, ymax=request_duration_mean+request_duration_sd), width=.2, position=position_dodge(0.05)) +
  ggtitle('Montage 0.15: average tasks duration - larger lambdas') +
  xlab("task id") +
  ylab("request duration in s")

request_duration$resource <- factor(request_duration$resource,levels = c("lambda-128", "lambda-256", "lambda-512", "lambda-768", 
                                                                         "lambda-1024", "lambda-1280", "lambda-1536", "lambda-1792", "lambda-2048"))


ggplot(request_duration[request_duration$id == 201,], aes(resource, time_mean)) + 
  geom_point() +
  geom_errorbar(aes(ymin=time_mean-time_sd, ymax=time_mean+time_sd), width=.2, position=position_dodge(0.05)) +
  ggtitle('Montage 0.15: task 187 average duration - larger lambdas') +
  ylab("request duration in s")


normalized =read.table("../sqs/e100-5/normalized_logs.csv",header = TRUE)

#normalized$downloaded <- as.numeric(as.character(normalized$downloaded))
#normalized$executed <- as.numeric(as.character(normalized$executed))
#normalized$uploaded <- as.numeric(as.character(normalized$uploaded))
#normalized$request_duration <- as.numeric(as.character(normalized$request_duration))
#normalized$time <- as.numeric(as.character(normalized$time))

normalized$launched <- normalized$request_duration - normalized$time
launched <- get_avg(normalized, "launched")
launched$type <- "launched"
launched$time_sum <- launched$time_mean
launched$min_error <- launched$time_sum - launched$time_sd
launched$max_error <- launched$time_sum + launched$time_sd

downloaded <- get_avg(normalized, "downloaded")
downloaded$type <- "downloaded"
downloaded$time_sum <- downloaded$time_mean + launched[launched$id == downloaded$id && launched$resource == downloaded$resource,]$time_mean
downloaded$min_error <- downloaded$time_sum - downloaded$time_sd
downloaded$max_error <- downloaded$time_sum + downloaded$time_sd

executed <- get_avg(normalized, "executed")
executed$type <- "executed"
executed$time_sum <- executed$time_mean + downloaded[executed$id == downloaded$id && executed$resource == downloaded$resource,]$time_sum
executed$min_error <- executed$time_sum - executed$time_sd
executed$max_error <- executed$time_sum + executed$time_sd

uploaded <- get_avg(normalized, "uploaded")
uploaded$type <- "uploaded"
uploaded$time_sum <- uploaded$time_mean + executed[executed$id == uploaded$id && executed$resource == uploaded$resource,]$time_sum
uploaded$min_error <- uploaded$time_sum - uploaded$time_sd
uploaded$max_error <- uploaded$time_sum + uploaded$time_sd

durations <- rbind(rbind(downloaded, executed), rbind(uploaded, launched))
durations$time_mean <- durations$time_mean/1000
durations$time_sd <- durations$time_sd/1000
durations$resource <- factor(durations$resource,levels = c("lambda-128", "lambda-256", "lambda-512", "lambda-768", 
                                                                         "lambda-1024", "lambda-1280", "lambda-1536", "lambda-1792", "lambda-2048"))
durations$type <- factor(durations$type, levels = c("uploaded", "executed", "downloaded", "launched"))
ggplot(durations[durations$id==110,], aes(fill=type, x=resource, y=time_mean)) + 
  geom_bar(position="stack", stat="identity") +
  geom_errorbar(aes(ymin=min_error/1000, ymax=max_error/1000), width=.5, position=position_dodge(0.5)) +
  ggtitle('Montage 0.15: task 110 average durations - larger lambdas') +
  ylab("time in s")


durations$type <- factor(durations$type, levels = c("uploaded", "executed", "downloaded", "launched"))
single_lambdas <- durations[durations$type != "launched",]
single_lambdas <- durations[durations$resource == "lambda-128",]# & durations$type != "launched",]
single_lambdas <- single_lambdas[single_lambdas$id == 1 | single_lambdas$id == 14 | single_lambdas$id == 51 | single_lambdas$id == 594 | single_lambdas$id == 650, ]
ggplot(single_lambdas, aes(fill=type, x=id, y=time_mean)) + 
  geom_bar(position="stack", stat="identity") +
  facet_grid( ~ resource) +
 # geom_errorbar(aes(ymin=min_error/1000, ymax=max_error/1000), width=.5, position=position_dodge(0.5)) +
  ggtitle('Ellipsoids 100 tasks (avg from 4 warm starts) SQS + EFS 30MB/s') +
  ylab("time in s")



#*************************** FROM THE OLD FILE ***************************

setwd('/home/amnich/Documents/magisterka/CloudFunctionOptimizer/time_tests')
library('ggplot2')
library('cowplot')
level = read.table("./0.15/level_front-loss.csv",header = TRUE)
sml = read.table("./0.15/moheft-loss.csv",header = TRUE)
loss_sml = read.table("./0.15/loss-moheft-loss.csv",header = TRUE)
sdbcs = read.table("./0.15/sdbcs.csv",header = TRUE)
loss_sdbcs = read.table("./0.15/loss-sdbcs.csv",header = TRUE)
sdbws = read.table("./0.15/sdbws.csv",header = TRUE)
loss_sdbws = read.table("./0.15/loss-sdbws.csv",header = TRUE)

add_planned <- function(table) {
  table$planned = (table$budget_planned <= table$budget_calculated) & (table$deadline_planned <= table$deadline_calculated)
  table
}
level <- add_planned(level)
sml <- add_planned(sml)
loss_sml <- add_planned(loss_sml)
sdbcs <- add_planned(sdbcs)
loss_sdbcs <- add_planned(loss_sdbcs)
sdbws <- add_planned(sdbws)
loss_sdbws <- add_planned(loss_sdbws)

myColors <- c("#f8766d", "#00b0f6")
names(myColors) <- levels(c(TRUE, FALSE))
colScale <- scale_colour_manual(name = "planned",values = myColors)

onlyTrue <- scale_colour_manual(name = "planned",values = c("#00b0f6"))

g_level <- ggplot(level, aes(budget, deadline)) + 
  geom_point(aes(colour = planned)) + colScale +
  ggtitle('Montage 0.15 Levels') +
  scale_x_continuous(breaks = seq(0, 0.2, by = 0.04)) +
  scale_y_continuous(breaks = seq(0, 0.2, by = 0.02))

g_sml <- ggplot(sml, aes(budget, deadline)) + 
  geom_point(aes(colour = planned)) + colScale + 
  ggtitle('Montage 0.15 Moheft + Loss') +
  scale_x_continuous(breaks = seq(0, 0.2, by = 0.04)) +
  scale_y_continuous(breaks = seq(0, 0.2, by = 0.02))

g_loss_sml <- ggplot(loss_sml, aes(budget, deadline)) + 
  geom_point(aes(colour = planned)) + colScale +
  ggtitle('Montage 0.15 Moheft + Double Loss') +
  scale_x_continuous(breaks = seq(0, 0.2, by = 0.04)) +
  scale_y_continuous(breaks = seq(0, 0.2, by = 0.02))

g_sdbcs <- ggplot(sdbcs, aes(budget, deadline)) + 
  geom_point(aes(colour = planned)) + colScale +
  ggtitle('Montage 0.15 Sdbcs') +
  scale_x_continuous(breaks = seq(0, 0.2, by = 0.04)) +
  scale_y_continuous(breaks = seq(0, 0.2, by = 0.02))

g_loss_sdbcs <- ggplot(loss_sdbcs, aes(budget, deadline)) + 
  geom_point(aes(colour = planned)) + colScale +
  ggtitle('Montage 0.15 Sdbcs + Loss') +
  scale_x_continuous(breaks = seq(0, 0.2, by = 0.04)) +
  scale_y_continuous(breaks = seq(0, 0.2, by = 0.02))

g_sdbws <- ggplot(sdbws, aes(budget, deadline)) + 
  geom_point(aes(colour = planned)) + colScale +
  ggtitle('Montage 0.15 Sdbws') +
  scale_x_continuous(breaks = seq(0, 0.2, by = 0.04)) +
  scale_y_continuous(breaks = seq(0, 0.2, by = 0.02))

g_loss_sdbws <- ggplot(loss_sdbws, aes(budget, deadline)) + 
  geom_point(aes(colour = planned)) + colScale +
  ggtitle('Montage 0.15 Sdbws + Loss') +
  scale_x_continuous(breaks = seq(0, 0.2, by = 0.04)) +
  scale_y_continuous(breaks = seq(0, 0.2, by = 0.02))

scale_x_continuous(breaks = seq(0, 0.6, by = 0.1)) +
  scale_y_continuous(breaks = seq(0, 0.6, by = 0.05))

scale_x_continuous(breaks = seq(0, 0.2, by = 0.04)) +
  scale_y_continuous(breaks = seq(0, 0.2, by = 0.02))

plot_grid(g_level, g_sml, g_loss_sml, g_sdbcs, g_loss_sdbcs, g_sdbws, g_loss_sdbws, 
          ncol = 3, nrow = 3)



tasks = read.table("./0.15/0.01_0.04/level_front-loss.csv",header = TRUE)
tasks$start=(tasks$start)/1000
tasks$end=(tasks$end)/1000

tasks = read.table("./0.15/0.01_0.04/results/result.csv",header = TRUE)
tasks <- tasks[tasks$type == "level_front-loss",]
tasks$function. = tasks$resource 
tasks$start=(tasks$request_start)/1000
tasks$end=(tasks$request_end)/1000

tasks = tasks[order(tasks$start),]
tasks$machine = 0
maxmachine=1
for(i in 1:nrow(tasks))
{
  st = tasks$start[i]
  last_tasks = aggregate(end ~ machine, data = tasks, max)
  busy = last_tasks[last_tasks$end < st & last_tasks$machine != 0,]
  print(st)
  print(busy)
  if (nrow(busy)==0)
  {
    tasks$machine[i] = maxmachine
    maxmachine = maxmachine+1
  }
  else tasks$machine[i] = busy$machine[1]
}
tasks

ggplot(tasks, aes(colour=function.)) + geom_segment(aes(x=start, xend=end, y=1:nrow(tasks), yend=1:nrow(tasks)), size=2) + xlab("Time in seconds") + ylab("Task") + scale_x_continuous(minor_breaks = seq(0 , 40, 2.5), breaks = seq(0, 40, 5)) + scale_y_discrete(labels=tasks$task) + theme (axis.text.y = element_text(size=6)) + theme(legend.justification=c(1,0), legend.position=c(1,0)) + theme(legend.text = element_text(size = 8)) + 
  ggtitle("0.01 0.04 Executed")



results = read.table("./0.15/results.csv",header = TRUE)
results$time_diff = (results$execution_time_calculated - results$execution_time_real)/results$execution_time_real*100
results$deadline_diff = (results$execution_time_calculated - results$planned_deadline)/results$execution_time_calculated*100
results$cost_diff = (results$execution_cost - results$planned_budget)/results$execution_cost*100
results$type = paste(results$budget_factor,"_",results$time_factor)

ggplot(results, aes(type, time_diff)) + 
  geom_point(aes(colour = algorithm)) + 
  ggtitle('Difference between execution time calculated and measured by last request (in %)') +
  xlab("budget_time") +
  ylab("time difference(%)")

ggplot(results, aes(type, deadline_diff)) + 
  geom_point(aes(colour = algorithm)) + 
  ggtitle('Difference between execution time calculated from plan and from reasult (in %)') +
  xlab("budget_time") +
  ylab("time difference(%)")

ggplot(results, aes(type, cost_diff)) + 
  geom_point(aes(colour = algorithm)) + 
  ggtitle('Difference between planned and real cost (in %)') +
  xlab("budget_time") +
  ylab("cost difference(%)")

ggplot(results, aes(planned_deadline, execution_time_calculated)) + 
  geom_point(aes(colour = algorithm)) + 
  ggtitle('Planned vs real execution time') +
  xlab("planned execution time") +
  ylab("real execution time") + scale_y_log10() + scale_x_log10()










# + geom_text(aes(x=time, y=id, label = task), color = "gray20", data = tasks)
# + theme (axis.text.y = element_text(size=6)) + theme(legend.justification=c(1,0), legend.position=c(1,0)) + theme(legend.text = element_text(size = 8))

#ggplot(tasks, aes(colour=resource)) + geom_segment(aes(x=start, xend=end, y=1:nrow(tasks), yend=1:nrow(tasks)), size=2) + xlab("Time in seconds") + ylab("Task") + theme (axis.text.y = element_text(size=10)) + scale_color_continuous(name="", breaks = c(256, 512, 1024, 2048), labels = c(256, 512, 1024, 2048), low="blue", high="red")
#+ theme (axis.text.y = element_text(size=6)) + theme(legend.justification=c(1,0), legend.position=c(1,0)) + theme(legend.text = element_text(size = 8))

#ggplot(tasks, aes(colour=task)) + geom_segment(aes(x=start, xend=end, y=machine, yend=machine), size=3) + xlab("Time in seconds") + ylab("Machine") + scale_y_discrete(labels=1:maxmachine) + theme (axis.text.y = element_text(size=10)) + theme(legend.justification=c(1,0), legend.position="right") + theme(legend.text = element_text(size = 8))
# ggsave("logs_real_3.pdf", width = 16, height = 24, units = "cm")

#ggsave("plot121.pdf", width = 16, height = 24, units = "cm")
#ggsave("plot10.emf", width = 8, height = 12, units = "cm")



















