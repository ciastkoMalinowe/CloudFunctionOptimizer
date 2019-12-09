df <- read.csv('/home/mamajews/development/CloudFunctionOptimizer/outputs_multiple/all_ellipsoids.txt')
names(df) <- c('time', 'cost', 'algorithm', 'deadlineParameter', 'budgetParameter', 'userDeadline', 'userBudget',
               'dag', 'inConstraints')
keeps <- c('algorithm', 'deadlineParameter', 'budgetParameter', 'dag', 'inConstraints')
dfCut <- df[keeps]

