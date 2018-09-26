library(tidyverse)
library(lubridate)

lead <- read_csv('sfusd_lead_sampling.csv')
glimpse(lead)


l1 <- lead %>% 
  mutate(lead_present = ifelse(`Pb (µg/L)` == '< 1' | is.na(`Pb (µg/L)`), FALSE, TRUE)) %>% 
  filter(lead_present) %>% 
  mutate(ppb = as.numeric(`Pb (µg/L)`), date = mdy(sample_date)) %>%
  select(school_name, date, ppb, lat, lon) %>% 
  group_by(school_name) %>% 
  filter(date == max(date)) %>%
  filter(ppb == max(ppb)) %>% 
  ungroup() %>% 
  unique()

l2 <- lead %>% 
  mutate(lead_present = ifelse(`Pb (µg/L)` == '< 1' | is.na(`Pb (µg/L)`), FALSE, TRUE)) %>% 
  filter(lead_present) %>% 
  mutate(ppb = as.numeric(`Pb (µg/L)`), date = mdy(sample_date)) %>%
  select(school_name, date, ppb, lat, lon) %>% 
  group_by(school_name) %>% 
  summarise(ppb2 = max(ppb)) %>% 
  ungroup() 

l1 %>% 
  left_join(l2) %>% 
  mutate(diff = ppb - ppb2) %>% View

# just going to use the max sample per school to represent problem
# using max reading from most recent test is the same as max overall sample for all but 5 schools

lead %>% 
  mutate(lead_present = ifelse(`Pb (µg/L)` == '< 1' | is.na(`Pb (µg/L)`), FALSE, TRUE)) %>% 
  filter(lead_present) %>% 
  mutate(ppb = as.numeric(`Pb (µg/L)`), date = mdy(sample_date)) %>%
  select(school_name, date, ppb, lat, lon) %>% 
  group_by(school_name) %>% 
  filter(ppb == max(ppb)) %>% 
  ungroup() %>% 
  unique() %>% 
  mutate(school_name = str_replace(school_name, 'ES', 'Elementary School'),
         school_name = str_replace(school_name, 'MS', 'Middle School'),
         school_name = str_replace(school_name, 'HS', 'High School')) %>% 
  write_csv('app_data.csv')


# looking at extremes
lead %>%
  filter(school_name %in% c('New School of San Francisco', 'International Study HS')) %>% 
  mutate(lead_present = ifelse(`Pb (µg/L)` == '< 1' | is.na(`Pb (µg/L)`), FALSE, TRUE)) %>% 
  filter(lead_present) %>% 
  mutate(date = mdy(sample_date), ppb = as.numeric(`Pb (µg/L)`)) %>% 
  select(school_name, sample_point_name , date, ppb, result) %>% 
  ggplot(aes(x = date, y = ppb, color = school_name)) +
  geom_point() +
  scale_y_log10()

 

View(lead)

lead %>% 
  mutate(lead_present = ifelse(`Pb (µg/L)` == '< 1' | is.na(`Pb (µg/L)`), FALSE, TRUE)) %>%  
  group_by(school_name, lat, lon) %>% 
  summarise(lead_present = any(lead_present)) %>% 
  ungroup() %>% 
  mutate(id = row_number()) %>% 
  select(id, school_name:lead_present) %>% 
  write_csv('school_lookup.csv')

school_lookup <- read_csv('school_lookup.csv')

