    df <- read.csv("/home/mamajews/development/CloudFunctionOptimizer/every_possible_output/paretoFrontAll.txt")
    names(df) <- c('time','cost')
    
    max_budget <- 0.0007034740000000003
    min_budget <- 0.000382806
    max_time <- 40224
    min_time <- 18235
    deadline_parameter_time <- 0.5
    deadline_parameter_cost <- 0.5
    user_time_max <- min_time + deadline_parameter_time * (max_time - min_time)
    user_cost_max <- min_budget + deadline_parameter_cost * (max_budget - min_budget)

    sdbcs <- data.frame(35909,0.000415724, 1.0, 1.0)
    names(sdbcs) <- c('time','cost', 'time_constrain', 'cost_constrain')
    
    sdbws <- data.frame(36962, 0.00040032, 1.0, 1.0)
    names(sdbws) <- c('time','cost', 'time_constrain', 'cost_constrain') 
    
    require(ggplot2)
    library(ggrepel)
    plot <- ggplot(data = df, aes(x = time, y = cost)) 
    plot <- plot + geom_point(size = 1.5) 
    plot <- plot + geom_point(data = sdbcs, colour = "red", size = 1.5) 
    plot <- plot + geom_point(data = sdbws, colour = "green", size = 1.5, alpha =0.7)
    plot <- plot + geom_hline(yintercept=user_cost_max, linetype="dashed", color = "red")
    plot <- plot + geom_vline(xintercept=user_time_max, linetype="dashed", color = "red")
    plot <- plot 
    plot
