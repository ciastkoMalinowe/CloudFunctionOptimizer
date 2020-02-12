#Script to print plot with asymptotic functions
eq = function(x){x + x * log(x)}
smoheft = function(x){x + x * log(x) + x^2}
plot(eq(1:1000),smoheft(1:1000), type='l')

ggplot(data.frame(x=c(1, 100)), aes(x=x)) + 
  stat_function(fun=eq, n= 100, show.legend = TRUE, aes(color="SDBWS and SDBCS")) + 
  stat_function(fun =smoheft, n=100, show.legend = TRUE, aes(color="SMOHEFT and SMOHEFT-LOSS")) +
  scale_colour_manual("Algorithms", values = c("red", "blue")) +
  theme(legend.position="top")
  
  