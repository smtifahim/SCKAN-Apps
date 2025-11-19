# This script assumes that the stardog server is running. The python code runs all the necessary SPARQL queries for SCKAN Explorer
# and saves the results in corresponing json files. 
# (version: 1.0; @Author: Fahim Imam)


import os
from dotenv import load_dotenv
import stardog
import json


# Load environment variables from .env file if present
load_dotenv()

# Stardog DB connection details using environment variables for credentials
conn_details = {
    'endpoint': 'https://sd-c1e74c63.stardog.cloud:5820',
    'username': os.environ.get('SCKAN_USERNAME'),
    'password': os.environ.get('SCKAN_PASSWORD')
}

# db_name = 'SIMPLE-SCKAN-TEST-SEP'
db_name = 'SCKAN-NOV-2025'


# File locations for the queries needed for SCKAN-Explorer
query_files = [
                './sparql-queries/sckan-all-locations.rq',
                './sparql-queries/a-b-via-c.rq',
                './sparql-queries/axonal-path-partial-order.rq',
                './sparql-queries/neuron-metadata.rq',
                './sparql-queries/sckan-version-info.rq'
              ]

# File locations for the generated query results in json format
generated_files = [
                   './sckan-data/sckan-all-locations.json',
                   './sckan-data/a-b-via-c.json',
                   './sckan-data/axonal-path.json',
                   './sckan-data/neuron-metadata.json',
                   './sckan-data/sckan-version.json'
                  ]

def checkServerStatus(admin):
    if (admin.healthcheck()):
        print ("        Server Status: Stardog server is running and able to accept traffic.")
    else:
        print ("        Server Status: Stardog server is NOT running. Please start the server and try again.")
        exit();

print ("\nProgram execution started...")
with stardog.Admin(**conn_details) as admin:  
    print ("\nStep 0: Checking Stardog server status..")
    checkServerStatus(admin)
    print ("Step 0: Done!")

with stardog.Connection(db_name, **conn_details) as conn: 
    for i, query_file in enumerate (query_files):
        print ("\nStep " + str(i+1) + ": Executing query from: " + query_file)
        with open(query_file, 'r') as file:
            query = file.read()
            result = conn.select(query, reasoning=False)
        print ("        Saving query results...")
        with open(generated_files[i], 'w') as file:
            json.dump(result, file, indent=2)
        print ("        Query results saved to: " + generated_files[i])
        print ("Step " + str(i+1) + ": Done!")
    conn.close()
print ("\nAll queries executed and results are saved successfully!\n")
