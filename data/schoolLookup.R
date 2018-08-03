library(tidyverse)

lead <- read_csv('sfusd_lead_sampling.csv')
glimpse(lead)

lead %>% 
  mutate(lead_present = ifelse(`Pb (µg/L)` == '< 1' | is.na(`Pb (µg/L)`), FALSE, TRUE)) %>%  
  group_by(school_name, lat, lon) %>% 
  summarise(lead_present = any(lead_present)) %>% 
  ungroup() %>% 
  mutate(id = row_number()) %>% 
  select(id, school_name:lead_present) %>% 
  write_csv('school_lookup.csv')

school_lookup <- read_csv('school_lookup.csv')
