    df <- read.csv("/home/mamajews/Development/CloudFunctionOptimizer/every-possible-wf_0.02-256x512x1024-1_1/paretoFrontAll.txt")
    names(df) <- c('time','cost')
    type = 'pareto'
    df <- cbind(df, type)
    
    
    moheft <- read.csv('/home/mamajews/Development/CloudFunctionOptimizer/moheft.csv')
    names(moheft) <- c('time', 'cost')
    type = 'moheft-pareto'
    moheft <- cbind(moheft, type)
    
    df <- rbind(df, moheft)
    
    max_budget <- 0.0007034740000000003
    min_budget <- 0.000382806
    max_time <- 40224
    min_time <- 18235
    deadline_parameter_time <- 0.7
    deadline_parameter_cost <- 0.7
    user_time_max <- min_time + deadline_parameter_time * (max_time - min_time)
    user_cost_max <- min_budget + deadline_parameter_cost * (max_budget - min_budget)

    #sdbcs <- data.frame(35909,0.000415724, 1.0, 1.0)
    #sdbcs <- data.frame(35909,0.000415724, 0.9, 0.9)
    sdbcs <- data.frame(35909,0.000406575, 0.7, 0.7)
    
    names(sdbcs) <- c('time','cost', 'time_constrain', 'cost_constrain')
    
    #sdbws <- data.frame(36962, 0.00040032, 1.0, 1.0)
    #sdbws <- data.frame(36962, 0.00040032, 0.9, 0.9)
    sdbws <- data.frame(36962, 0.00040032, 0.7, 0.7)
    
    names(sdbws) <- c('time','cost', 'time_constrain', 'cost_constrain') 
    
    require(ggplot2)
    plot <- ggplot(data = df, aes(x = time, y = cost, col=df$type))
    
    plot <- plot + coord_cartesian(xlim = c(min(df[,1]), max(df[,1])), ylim = c(min(df[,2]), max(df[,2])))
    
    plot <- plot + scale_color_manual(name = "",breaks = c ("pareto", "sdbcs", "sdbws", "accepted solutions", "moheft-pareto"), values = c("black", "red", "green", "blue", "rose"))
    plot <- plot + geom_point(size = 1.5) 
    plot <- plot + geom_point(data = sdbcs, aes(color = "sdbcs", x = sdbcs$time, y=sdbcs$cost), size = 1.5) 
    plot <- plot + geom_point(data = sdbcs, aes(color = "sdbws", x = sdbws$time, y=sdbws$cost), size = 1.5) 
    #plot <- plot + geom_point(data = moheft, aes(color = "moheft", x = sdbcs$time, y=sdbcs$cost), size = 1.5) 
    
    #plot <- plot + geom_hline(yintercept=user_cost_max, linetype="dashed", color = "blue")
    #plot <- plot + geom_vline(xintercept=user_time_max, linetype="dashed", color = "blue")
    plot <- plot + theme(legend.position = "bottom")
    
    plot <- plot + geom_rect(data = df[1,], aes(xmin = min(df[,1] - 10000), xmax = user_time_max, ymax = user_cost_max, ymin=min(df[,2])- 0.5), fill="blue", inherit.aes = FALSE, alpha = 0.1)
    
    #plot <- plot + annotate(geom="text", label = "1.0", x = user_time_max + 2000, y = user_cost_max + 0.000005, col = 'blue')
    #plot <- plot + annotate(geom="text", label = "1.0", x = user_time_max + 2000, y = user_cost_max + 0.000005, col = 'blue')
    
    
    
    
    plot