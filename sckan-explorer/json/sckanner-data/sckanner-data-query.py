"""
This python script runs all the necessary SPARQL queries for SCKANNER against SCKAN DB in Stardog 
and saves the results in corresponing json files. This script assumes that the stardog server is running.
Author: Fahim Imam
Version: 1.0
"""


import stardog
import json
import logging
from pathlib import Path
import os
from dotenv import load_dotenv


# Load environment variables from .env file
load_dotenv()

# Stardog DB connection configuration using stardog cloud endpoint
STARDOG_USERNAME = os.getenv('STARDOG_USERNAME')
STARDOG_PASSWORD = os.getenv('STARDOG_PASSWORD')
if not STARDOG_USERNAME or not STARDOG_PASSWORD:
    raise ValueError("STARDOG_USERNAME and STARDOG_PASSWORD must be set in the .env file.")

CONN_DETAILS = {
    'endpoint': 'https://sd-c1e74c63.stardog.cloud:5820',
    'username': STARDOG_USERNAME,
    'password': STARDOG_PASSWORD
}

DB_NAME = 'SCKAN-NOV-2025'  # Update with the current database name.

SCKAN_VERSION = '2025-11-10' # Manual for now.
QUERY_DIR = Path(f'./sparql-queries/')
STATS_DIR = Path(f'./stats/sckan-version-{SCKAN_VERSION}/')

# Logging configuration
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# Query and output file mapping
QUERY_OUTPUT_PAIRS = [
                        ( QUERY_DIR / 'sckanner-hierarchy.rq', 
                          './hierarchy/sckanner-hierarchy.json')
                        # ( QUERY_DIR / 'sckan-version-info.rq',
                        #   STATS_DIR / 'sckan-version-info.json'),
                        # ( QUERY_DIR / 'stats-model-population-count.rq',
                        #   STATS_DIR / 'stats-model-population-count.json'),
                        # ( QUERY_DIR / 'stats-phenotype-count.rq',
                        #   STATS_DIR / 'stats-phenotype-count.json'),
                        # ( QUERY_DIR / 'stats-phenotype-value-count.rq',
                        #   STATS_DIR / 'stats-phenotype-value-count.json'),
                        # ( QUERY_DIR / 'stats-population-category-count.rq',
                        #   STATS_DIR / 'stats-population-category-count.json')
                     ]

# Ensure that the output directory exists.
def ensure_output_directory():  
    STATS_DIR.mkdir(parents=True, exist_ok=True)
    logging.info(f"Ensured output directory: ./{STATS_DIR}")

# Check if the Stardog server is available.
def check_stardog_status():
    try:
        with stardog.Admin(**CONN_DETAILS) as admin:  
            if not admin.healthcheck():
                logging.error("Server Status: Stardog server is NOT responding to health check.")
                raise RuntimeError("Stardog server is not healthy.")
            logging.info("Server Status: Stardog server is running and able to accept traffic.")
    except Exception as e:
        logging.exception("Failed to connect to Stardog server.")
        raise e

# Run a SPARQL query and save the results to a file.
def execute_and_save_query(conn, query_file_path, output_file_path):
    try:
        with open(query_file_path, 'r') as qf:
            query = qf.read()

        logging.info(f"Executing query from: {query_file_path}")
        result = conn.select(query, reasoning=False)

        output_path = Path(output_file_path)
        output_path.parent.mkdir(parents=True, exist_ok=True)  # ensure output directory exists

        with open(output_path, 'w') as outfile:
            json.dump(result, outfile, indent=2)

        logging.info(f"Query result saved to: {output_file_path}")
    except Exception as e:
        logging.exception(f"Failed to execute query or write output for: {query_file_path}")
        raise e

# Main function to run all SPARQL queries.
def run_all_queries():
    check_stardog_status()
    ensure_output_directory()
    
    try:
        with stardog.Connection(DB_NAME, **CONN_DETAILS) as conn:
            for i, (query_file, output_file) in enumerate(QUERY_OUTPUT_PAIRS, start=1):
                logging.info(f"Step {i} of {len(QUERY_OUTPUT_PAIRS)}")
                execute_and_save_query(conn, query_file, output_file)
    except Exception as e:
        logging.error("An error occurred while running queries.")
        raise e

    logging.info("All queries executed and results saved successfully.")

if __name__ == '__main__':
    run_all_queries()
