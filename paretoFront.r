        df <- read.csv("/home/mamajews/Development/CloudFunctionOptimizer/outputs_multiple/all_montage-0.25.txt")
        names(df) <- c('time','cost','type','deadlineParameter','budgetParameter', 'deadline', 'budget')
        
        
        require(tidyverse)
        require(ggplot2)
        require(gridExtra)
        require(ggpubr)
        df$cost <- as.numeric(as.character(df$cost))
        curr_df <- df
        
        max_budget <- 0.00313396
        min_budget <- 0.000709930000000001
        max_time <- 59966
        min_time <- 14727

        curr_df <- df %>% filter(budgetParameter == 0.2)
        user_time_max <- curr_df[1,]$deadline
        user_cost_max <- curr_df[1,]$budget
        plot <- ggplot(data = curr_df, aes(x = time, y = cost, col=curr_df$type)) + xlim(min_time, max_time) + ylim(min_budget, max_budget)
        #plot <- plot + scale_color_manual(name = "",breaks = c ("moheft", "sdbcs", "moheft-loss", "sdbws", "pareto"), values = c("black", "red", "green", "blue", "rose"))
        plot <- plot + geom_point(size = 1.5) 
        plot <- plot + theme(legend.position = "bottom")
        plot <- plot + ggtitle('b = 0.2, c = 0.2')
        plot <- plot + geom_hline(yintercept = user_cost_max)
        plot <- plot + geom_vline(xintercept  = user_time_max)

        curr_df1 <- df %>% filter(budgetParameter == 0.1)
        user_time_max <- curr_df1[1,]$deadline
        user_cost_max <- curr_df1[1,]$budget
        plot1 <- ggplot(data = curr_df, aes(x = time, y = cost, col=curr_df1$type)) + xlim(min_time, max_time) + ylim(min_budget, max_budget)
       # plot1 <- plot1 + scale_color_manual(name = "",breaks = c ("moheft", "sdbcs", "moheft-loss", "sdbws", "pareto"), values = c("black", "red", "green", "blue", "rose"))
        plot1 <- plot1 + geom_point(size = 1.5)
        plot1 <- plot1 + theme(legend.position = "bottom")
        plot1 <- plot1 + ggtitle('b = 0.1, c = 0.1')
        plot1 <- plot1 + geom_hline(yintercept = user_cost_max)
        plot1 <- plot1 + geom_vline(xintercept  = user_time_max)

        curr_df2 <- df %>% filter(budgetParameter == 0.4)
        user_time_max <- curr_df2[1,]$deadline
        user_cost_max <- curr_df2[1,]$budget
        plot2 <- ggplot(data = curr_df, aes(x = time, y = cost, col=curr_df2$type)) + xlim(min_time, max_time) + ylim(min_budget, max_budget)
        #plot2 <- plot2 + scale_color_manual(name = "",breaks = c ("moheft", "sdbcs", "moheft-loss", "sdbws", "pareto"), values = c("black", "red", "green", "blue", "rose"))
        plot2 <- plot2 + geom_point(size = 1.5)
        plot2 <- plot2 + theme(legend.position = "bottom")
        plot2 <- plot2 + ggtitle('b = 0.4, c = 0.4')
        plot2 <- plot2 + geom_hline(yintercept = user_cost_max)
        plot2 <- plot2 + geom_vline(xintercept  = user_time_max)

        curr_df3 <- df %>% filter(budgetParameter == 0.6)
        user_time_max <- curr_df3[1,]$deadline
        user_cost_max <- curr_df3[1,]$budget
        plot3 <- ggplot(data = curr_df3, aes(x = time, y = cost, col=curr_df3$type)) + xlim(min_time, max_time) + ylim(min_budget, max_budget)
        #plot2 <- plot2 + scale_color_manual(name = "",breaks = c ("moheft", "sdbcs", "moheft-loss", "sdbws", "pareto"), values = c("black", "red", "green", "blue", "rose"))
        plot3 <- plot3 + geom_point(size = 1.5)
        plot3 <- plot3 + theme(legend.position = "bottom")
        plot3 <- plot3 + ggtitle('b = 0.6, c = 0.6')
        plot3 <- plot3 + geom_hline(yintercept = user_cost_max)
        plot3 <- plot3 + geom_vline(xintercept  = user_time_max)

        
        ggarrange(plot1,plot,plot2,plot3, common.legend = TRUE)
        