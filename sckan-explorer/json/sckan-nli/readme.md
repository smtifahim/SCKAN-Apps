# SCKAN NLI Data Query Script

This directory contains the Python script `query-sckan-nli-data.py` which queries the SCKAN Stardog database and generates JSON data files for the SCKAN Natural Language Interface (NLI) application.

## Overview

The script connects to a Stardog database, executes multiple SPARQL queries, and saves the results as JSON files in the `sckan-nli-data/` directory. These JSON files are used by the SCKAN NLI system to process natural language queries about anatomical connectivity and organ innervation.

## Prerequisites

- Python 3.7 or higher
- Access to the SCKAN Stardog database (requires valid credentials)
- Internet connection to reach the Stardog cloud endpoint

## Setup Instructions

### 1. Python Environment Setup

It is recommended to use a virtual environment to manage dependencies.

#### Create a Virtual Environment

```bash
# Navigate to this directory
cd sckan-explorer/json/sckan-nli

# Create a virtual environment
python3 -m venv venv

# Activate the virtual environment
# On macOS/Linux:
source venv/bin/activate

# On Windows:
venv\Scripts\activate
```

### 2. Install Required Packages

Install the required Python packages using pip:

```bash
pip install stardog python-dotenv
```

Package Descriptions

- **stardog**: Python client library for interacting with Stardog databases
- **python-dotenv**: Loads environment variables from a `.env` file

### 3. Configure Environment Variables

Create a `.env` file in the same directory as the script with your Stardog credentials:

```bash
# Create .env file
touch .env
```

Add the following content to the `.env` file:

```
SCKAN_USERNAME=your_username_here
SCKAN_PASSWORD=your_password_here
```

**Important:** Never commit the `.env` file to version control. Ensure it is listed in `.gitignore`.

## Running the Script

### Basic Execution

Once the setup is complete, run the script:

```bash
python query-sckan-nli-data.py
```

### Expected Output

The script will execute the following steps:

1. **Step 0:** Check Stardog server status
2. **Step 1:** Query all SCKAN locations
3. **Step 2:** Query anatomical connectivity (A-B via C)
4. **Step 3:** Query axonal path partial order
5. **Step 4:** Query neuron metadata
6. **Step 5:** Query major organs synonyms
7. **Step 6:** Query species synonyms
8. **Step 7:** Query major nerves
9. **Step 8:** Query axonal path with synapse information
10. **Step 9:** Query organ innervation pathways with collapsed nodes
11. **Step 10:** Query SCKAN version information

Each step will display progress messages and confirm when query results are saved.

### Example Output

```
Program execution started...

Step 0: Checking Stardog server status..
        Server Status: Stardog server is running and able to accept traffic.
Step 0: Done!

Step 1: Executing query from: ./sparql-queries/sckan-all-locations.rq
        Saving query results...
        Query results saved to: ./sckan-nli-data/sckan-all-locations.json
Step 1: Done!

...

All queries executed and results are saved successfully!
```

## Generated Files

The script generates the following JSON files in the `sckan-nli-data/` directory:


| File                                                   | Description                                               |
| ------------------------------------------------------ | --------------------------------------------------------- |
| `sckan-all-locations.json`                             | All anatomical locations in SCKAN                         |
| `a-b-via-c.json`                                       | Anatomical connectivity pathways (from A to B via C)      |
| `axonal-path.json`                                     | Axonal path data with partial ordering                    |
| `neuron-metadata.json`                                 | Detailed neuron metadata and properties                   |
| `major-organs-synonyms.json`                           | Synonyms for major organs used in NLI processing          |
| `species-synonyms.json`                                | Species names and their synonyms for query parsing        |
| `major-nerves.json`                                    | Information about major nerve structures                  |
| `axonal-path-with-synapse.json`                        | Axonal path data including synapse information            |
| `organ-innervation-pathways-with-collapsed-nodes.json` | Organ innervation pathways with simplified node structure |
| `sckan-version.json`                                   | SCKAN database version information                        |

## SPARQL Queries

The script executes SPARQL queries from the `sparql-queries/` directory:

- `sckan-all-locations.rq`: Retrieves all anatomical locations
- `a-b-via-c.rq`: Queries connectivity patterns
- `axonal-path-partial-order.rq`: Extracts axonal path information
- `neuron-metadata.rq`: Fetches neuron metadata
- `major-organs-synonyms.rq`: Retrieves organ synonyms for NLI
- `species-synonyms.rq`: Gets species name variations
- `major-nerves.rq`: Queries major nerve structures
- `axonal-path-with-synapse.rq`: Fetches axonal paths with synapse details
- `organ-innervation-collapsed.rq`: Gets simplified organ innervation data
- `sckan-version-info.rq`: Gets database version details

## Configuration

To query a different Stardog database, modify the `db_name` variable in the script:

```python
db_name = 'SCKAN-FEB-2026'  # Change this to your target database name
```

Create a `.env` file in the same directory as the script with the following content:

```
SCKAN_USERNAME=your_username_here
SCKAN_PASSWORD=your_password_here
```

**Important:** Replace `your_username_here` and `your_password_here` with your actual Stardog credentials. Never commit the `.env` file to version control.

## Troubleshooting

### Server Connection Issues

**Problem:** Cannot connect to Stardog server

**Solution:**

- Verify your internet connection
- Check that the Stardog endpoint URL is correct
- Confirm your credentials are valid
- Ensure the server is running (Step 0 will check this)

### Authentication Errors

**Problem:** Authentication failed

**Solution:**

- Verify that the `.env` file exists in the correct directory
- Check that `SCKAN_USERNAME` and `SCKAN_PASSWORD` are correctly set
- Ensure there are no extra spaces or quotes in the `.env` file

### Missing Query Files

**Problem:** FileNotFoundError for SPARQL query files

**Solution:**

- Ensure you are running the script from the correct directory
- Verify that all query files exist in the `sparql-queries/` directory
- Check file paths in the `query_files` list

### Permission Errors

**Problem:** Permission denied when writing JSON files

**Solution:**

- Ensure the `sckan-nli-data/` directory exists
- Check write permissions for the directory
- Create the directory manually if needed: `mkdir -p sckan-nli-data`

### Query Execution Timeouts

**Problem:** Query takes too long or times out

**Solution:**

- Check your network connection stability
- Verify the Stardog server is not overloaded
- Consider running queries individually for debugging
- Contact database administrator if timeouts persist

## Deactivating Virtual Environment

When finished, deactivate the virtual environment:

```bash
deactivate
```

## Differences from SCKAN Explorer Data

The SCKAN NLI data query script differs from the Explorer data query script in the following ways:

- Queries additional synonym data for natural language processing
- Includes synapse-specific pathway information
- Generates organ innervation data with collapsed nodes for simplified visualization
- Produces data optimized for natural language query parsing and response generation

## Version

Script Version: 1.0

Author: Fahim Imam

## Additional Notes

- The script uses `reasoning=False` when executing SPARQL queries for performance
- All query results are saved with proper JSON indentation for readability
- The script will exit if the Stardog server is not reachable
- The generated data is specifically formatted for natural language interface requirements
