# SCKANNER Data Query Script

This directory contains the Python script `sckanner-data-query.py` which queries the SCKAN Stardog database and generates JSON data files for the SCKANNER application, including hierarchy data and statistics.

## Overview

The script connects to a Stardog database, executes multiple SPARQL queries, and saves the results as JSON files in the `hierarchy/` and `stats/` directories. These JSON files provide hierarchical anatomical data and statistical information about the SCKAN knowledge base.

## Prerequisites

- Python 3.7 or higher
- Access to the SCKAN Stardog database (requires valid credentials)
- Internet connection to reach the Stardog cloud endpoint

## Setup Instructions

### 1. Python Environment Setup

A virtual environment is recommended for dependency isolation.

#### Create a Virtual Environment

```bash
# Navigate to this directory
cd sckan-explorer/json/sckanner-data

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

```#### Package Descriptions

- **stardog**: Python client library for interacting with Stardog databases
- **python-dotenv**: Loads environment variables from a `.env` file

### 3. Configure Environment Variables

Create a `.env` file in the same directory as the script with the following content:

```bash
# Create .env file
touch .env
```
Add the following content to the `.env` file:

```
STARDOG_USERNAME=your_username_here
STARDOG_PASSWORD=your_password_here
```
**Important:** Replace `your_username_here` and `your_password_here` with your actual Stardog credentials. Never commit the `.env` file to version control. Ensure it is listed in `.gitignore`.

**Note:** This script uses `STARDOG_USERNAME` and `STARDOG_PASSWORD` environment variable names (different from the explorer-data and sckan-nli scripts which use `SCKAN_USERNAME` and `SCKAN_PASSWORD`).

## Running the Script

### Execution

After completing the setup, execute the script:

```bash
python sckanner-data-query.py
```
### Expected Output

The script will execute the following operations:

1. Check Stardog server health status
2. Ensure output directories exist
3. Execute queries sequentially:
   - **Step 1:** Query SCKANNER hierarchy data
   - **Step 2:** Query SCKAN version information
   - **Step 3:** Query model population count statistics
   - **Step 4:** Query phenotype count statistics
   - **Step 5:** Query phenotype value count statistics
   - **Step 6:** Query population category count statistics

Example Output

```
2026-03-02 10:15:30 - INFO - Server Status: Stardog server is running and able to accept traffic.
2026-03-02 10:15:30 - INFO - Ensured output directory: ./stats/prod/
2026-03-02 10:15:30 - INFO - Step 1 of 6
2026-03-02 10:15:30 - INFO - Executing query from: sparql-queries/sckanner-hierarchy.rq
2026-03-02 10:15:32 - INFO - Query result saved to: ./hierarchy/sckanner-hierarchy.json
2026-03-02 10:15:32 - INFO - Step 2 of 6
2026-03-02 10:15:32 - INFO - Executing query from: sparql-queries/sckan-version-info.rq
2026-03-02 10:15:33 - INFO - Query result saved to: ./stats/prod/sckan-version-info.json
...
2026-03-02 10:15:45 - INFO - All queries executed and results saved successfully.
```
## Generated Files

The script generates JSON files in two directories:

### Hierarchy Directory


| File                                | Description                                         |
| ----------------------------------- | --------------------------------------------------- |
| `hierarchy/sckanner-hierarchy.json` | Hierarchical anatomical structure data for SCKANNER |

### Statistics Directory (stats/prod/)


| File                                   | Description                                 |
| -------------------------------------- | ------------------------------------------- |
| `sckan-version-info.json`              | SCKAN database version information          |
| `stats-model-population-count.json`    | Count of populations per anatomical model   |
| `stats-phenotype-count.json`           | Count of phenotypes in the knowledge base   |
| `stats-phenotype-value-count.json`     | Count of phenotype values and distributions |
| `stats-population-category-count.json` | Count of populations by category            |

**Note:** The script automatically creates output directories, including parent directories, if they do not exist.

## SPARQL Queries

The script executes the following SPARQL queries from the `sparql-queries/` directory:

- `sckanner-hierarchy.rq`: Retrieves hierarchical anatomical structures for SCKANNER
- `sckan-version-info.rq`: Obtains database version and release information
- `stats-model-population-count.rq`: Retreives population counts per model
- `stats-phenotype-count.rq`: Computes phenotype occurrence statistics
- `stats-phenotype-value-count.rq`: Computes phenotype value distributions
- `stats-population-category-count.rq`: Computes population counts by category

## Configuration

### Database Selection

To query a different Stardog database, modify the `DB_NAME` variable in the script:

```python
DB_NAME = 'SCKAN-FEB-2026'  # Update with the current database name
```
### SCKAN Version

Update the `SCKAN_VERSION` variable to reflect the current SCKAN release:

```python
SCKAN_VERSION = '2026-02-11'  # Update with the current version
```
**Note:** This version identifier is currently set manually and may be used for organizing output files.

### Output Directory Configuration

By default, statistical data is saved to `./stats/prod/`. To modify this location, update the `STATS_DIR` variable:

```python
STATS_DIR = Path(f'./stats/prod/')  # Change as needed
```
### Credentials Configuration

Create a `.env` file in the same directory as the script with the following content:

```
STARDOG_USERNAME=your_username_here
STARDOG_PASSWORD=your_password_here
```
**Important:** Replace `your_username_here` and `your_password_here` with your actual Stardog credentials. Never commit the `.env` file to version control.

## Troubleshooting

### Server Connection Issues

**Problem:** Cannot connect to Stardog server

**Solution:**

- Verify your internet connection
- Check that the Stardog endpoint URL is correct
- Confirm your credentials are valid
- The script will log detailed error messages if connection fails

### Authentication Errors

**Problem:** Authentication failed or "STARDOG_USERNAME and STARDOG_PASSWORD must be set in the .env file"

**Solution:**

- Verify that the `.env` file exists in the correct directory
- Check that `STARDOG_USERNAME` and `STARDOG_PASSWORD` are correctly set (note the different variable names)
- Ensure there are no extra spaces or quotes in the `.env` file
- Verify the .env file is in the same directory as the script

### Missing Query Files

**Problem:** FileNotFoundError for SPARQL query files

**Solution:**

- Ensure you are running the script from the correct directory
- Verify that all query files exist in the `sparql-queries/` directory
- Check file paths in the `QUERY_OUTPUT_PAIRS` list
- The script expects query files at: `./sparql-queries/[query-name].rq`

### Directory Creation Issues

**Problem:** Cannot create output directories

**Solution:**

- Check write permissions for the script's directory
- The script automatically creates `hierarchy/` and `stats/prod/` directories
- Verify you have permissions to create directories in the current location
- Run with appropriate permissions if needed

### Query Execution Errors

**Problem:** Query fails during execution

**Solution:**

- Check the log output for specific error messages
- Verify the database name is correct
- Ensure the Stardog server is not overloaded
- Check that the query syntax in .rq files is valid
- Contact database administrator if errors persist

## Deactivating Virtual Environment

Upon completion of your work, deactivate the virtual environment:

```bash
deactivate
```
## Version

Script Version: 1.0

Author: Fahim Imam

## Additional Notes

- The script disables reasoning (`reasoning=False`) during SPARQL query execution to optimize performance
- The script terminates execution with detailed error diagnostics if any operation fails
- Output directories are created automatically, including parent directories as required
