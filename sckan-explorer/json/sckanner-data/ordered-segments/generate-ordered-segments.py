# This program reads the csv file containing the ordered structures
# (e.g., spinal cord segments) and converts the csv into an 
# appropreate json format with only ontology IRIs for SCKANNER. -Fahim Imam

import csv
import json

csv_file = 'Ordered-Segments.csv'
json_file = 'order.json'

# initialize a dictionary
output_dict = {}

# open and read the CSV file
with open(csv_file, mode='r') as file:
    reader = csv.reader(file)
    
    # a variable to track the current main structure
    current_structure = None
    
    for row in reader:
        # check if the row has an ID; i.e., it's a main structure row
        if row[0]:
            current_structure = row[0]
            # initialize an empty list for the subclass IDs for this structure
            output_dict[current_structure] = []
        
        # check if the row has a subclass ID
        if row[2]:
            subclass_id = row[2]
            # add the subclass ID to the list under the current structure
            if current_structure:
                output_dict[current_structure].append(subclass_id)

# write the result to a JSON file
with open(json_file, mode='w') as file:
    json.dump(output_dict, file, indent=2)

print(f"Data has been written to {json_file}")
