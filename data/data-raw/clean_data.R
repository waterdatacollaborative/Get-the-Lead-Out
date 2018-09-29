library(readxl)
library(tidyverse)
library(stringr)
library(lubridate)

# downloaded school locations from:
# https://data.sfgov.org/Economy-and-Community/Map-of-Schools/qb37-w9se/data
geo_sfusd <- read_csv('data-raw/Map_of_Schools.csv') 

# munged by hand
sfusd <- read_csv('data-raw/sfusd_lead.csv')


sfusd_names_to_geo_sfusd <- read_csv('data-raw/missing_location.csv')


campus_name <- geo_sfusd %>% 
  select(geo_name = `Campus Name`, location = `Location 1`, address2 = `Campus Address`)

sfusd_lead <- sfusd %>% 
  left_join(sfusd_names_to_geo_sfusd) %>% 
  mutate(geo_name = ifelse(is.na(geo_name), school_name, geo_name)) %>% 
  left_join(campus_name) %>% 
  mutate(address = ifelse(is.na(address), address2, address),
         address = toupper(address),
         location = str_remove(location, 'CA\n'),
         lat_long = ifelse(is.na(location), lat_long, location),
         sample_date = dmy(sample_date)) %>% 
  select(-address2, -location) %>% 
  rename(geo_school_name = geo_name)

View(sfusd_lead)
glimpse(sfusd_lead)

write_csv(sfusd_lead, 'sfusd_lead_sampling.csv')
