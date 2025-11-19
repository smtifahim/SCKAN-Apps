## This program reads and extracts citation data from neuron-metadata.json file. It extract each URI from the citation field 
## (which may have multiple URIs separated by commas). It then uses public APIs (CrossRef for DOIs and NCBI E-utilities for PubMed) 
## to retrieve the APA-style references in HTML format and saves the results in a structured JSON format. -Fahim Imam (Nov 1, 2024)
import json
import csv
import requests
import re

# Function to get APA style reference for a DOI, PubMed URI, or ISBN
def get_apa_reference(uri):
    # Check for DOI
    if "doi.org" in uri:
        doi = uri.split("doi.org/")[1]
        response = requests.get(
            f"https://doi.org/{doi}",
            headers={"Accept": "text/bibliography; style=apa"}
        )
        if response.status_code == 200:
            reference = response.text.strip()  # APA formatted reference
            return format_reference(reference, doi=uri)  # Format with DOI link
        else:
            print(f"Failed to retrieve DOI reference for {uri}: {response.status_code}")

    # check for PubMed ID (various formats)
    elif re.search(r'pubmed|ncbi\.nlm\.nih\.gov', uri):
        # Handle PMC articles
        pmc_id = re.search(r'articles/PMC(\d+)', uri)
        if pmc_id:  # Extract PMC ID
            pubmed_id = pmc_id.group(1)
            response = requests.get(
                f"https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi",
                params={"db": "pmc", "id": pubmed_id, "retmode": "json"}
            )
            if response.status_code == 200:
                data = response.json()
                if "result" in data and pubmed_id in data["result"]:
                    result = data["result"][pubmed_id]
                    title = result.get("title", "")
                    source = result.get("source", "")
                    pubdate = result.get("pubdate", "")
                    authors = result.get("authors", [])
                    
                    # Format authors in APA style (last name, initials)
                    formatted_authors = format_authors(authors)

                    # Return formatted reference in APA style
                    return f"{formatted_authors} ({pubdate.split()[0]}). {title}. <i>{source}</i>."
                else:
                    print(f"No result found for PMC ID {pubmed_id} in response: {data}")
            else:
                print(f"Failed to retrieve PMC reference for {uri}: {response.status_code}")
            return None

        # to handle direct PubMed links
        pubmed_id = re.search(r'\/(\d+)', uri)
        if pubmed_id:  # Ensure we found a numeric PubMed ID
            pubmed_id = pubmed_id.group(1)
            response = requests.get(
                f"https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi",
                params={"db": "pubmed", "id": pubmed_id, "retmode": "json"}
            )
            if response.status_code == 200:
                data = response.json()
                if "result" in data and pubmed_id in data["result"]:
                    result = data["result"][pubmed_id]
                    title = result.get("title", "")
                    source = result.get("source", "")
                    pubdate = result.get("pubdate", "")
                    authors = result.get("authors", [])
                    
                    # Format authors in APA style (last name, initials)
                    formatted_authors = format_authors(authors)

                    # Return formatted reference in APA style
                    return f"{formatted_authors} ({pubdate.split()[0]}). {title}. <i>{source}</i>."
                else:
                    print(f"No result found for PubMed ID {pubmed_id} in response: {data}")
            else:
                print(f"Failed to retrieve PubMed reference for {uri}: {response.status_code}")
            return None

    # Check for ISBN
    elif "isbn" in uri:
        isbn_match = re.search(r'isbn[-]?13/(\d{3}-\d{1,5}-\d{1,7}-\d{1,7}-\d{1})', uri)
        if isbn_match:
            isbn_number = isbn_match.group(0)  # Extracted ISBN format
            response = requests.get(
                f"https://www.googleapis.com/books/v1/volumes?q={isbn_number}"
            )
            if response.status_code == 200:
                data = response.json()
                if "items" in data:
                    # Assuming we just take the first item for simplicity
                    book_info = data["items"][0]["volumeInfo"]
                    title = book_info.get("title", "")
                    authors = book_info.get("authors", [])
                    publisher = book_info.get("publisher", "")
                    published_date = book_info.get("publishedDate", "")
                    
                    # format the authors in APA style
                    formatted_authors = format_authors(authors)

                    # Return formatted reference in APA style
                    return f"{formatted_authors} ({published_date.split('-')[0]}). {title}. <i>{publisher}</i>."
                else:
                    print(f"No results found for ISBN {isbn_number}.")
            else:
                print(f"Failed to retrieve ISBN reference for {uri}: {response.status_code}")

    return None  # Return None if APA reference can't be retrieved

def format_authors(authors):
    """Format authors in APA style, using et al. for more than two authors."""
    if not authors:
        return "Unknown author"

    formatted_authors = []
    for i, author in enumerate(authors):
        name = author.get("name", "")
        if name:
            last_name, *initials = name.split()
            formatted_authors.append(f"{last_name}, {' '.join(i[0]+'.' for i in initials)}")
    
    if len(formatted_authors) > 2:
        return f"{formatted_authors[0]}, {formatted_authors[1]}, et al."
    else:
        return " & ".join(formatted_authors)

def format_reference(reference, doi=None, pubmed_id=None):
    """Format the reference to include DOI or PubMed ID as a hyperlink."""
    if doi:
        return f"{reference} DOI:<a href='{doi}' target='_blank'>{doi}</a>."
    if pubmed_id:
        return f"{reference} PMID:<a href='https://pubmed.ncbi.nlm.nih.gov/{pubmed_id}' target='_blank'>{pubmed_id}</a>."
    return reference

# Main function to process citations and save in JSON and CSV formats
def process_citations(input_file, output_json, output_csv):
    with open(input_file, 'r') as f:
        json_data = json.load(f)
    
    results = []
    unique_uris = set()  # To track unique URIs
    csv_data = []  # List to store data for CSV output

    # Access the nested "results" -> "bindings" structure
    bindings = json_data.get("results", {}).get("bindings", [])

    for entry in bindings:
        citations_field = entry.get("Citations", {}).get("value", "")
        citations = [uri.strip() for uri in citations_field.split(",") if uri.strip()]
        
        for uri in citations:
            if uri not in unique_uris:  # Process only if the URI is unique
                apa_reference = get_apa_reference(uri)
                if apa_reference:
                    # Append to results and CSV data without Neuron_IRI
                    results.append({"url": uri, "APA_Reference": apa_reference})
                    csv_data.append([uri, apa_reference])
                    unique_uris.add(uri)  # Mark URI as processed
                    print(f"Processed URI: {uri}")  # Progress message
                else:
                    print(f"Could not retrieve APA reference for URI: {uri}")
    
    # Save results to output JSON file
    with open(output_json, 'w') as f:
        json.dump(results, f, indent=4)
    
    # Save results to output CSV file
    with open(output_csv, 'w', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        writer.writerow(["URL", "APA_Reference"])  # Header
        writer.writerows(csv_data)

    print("Processing complete. Results saved to JSON and CSV files.")

# Example usage
process_citations('./sckan-data/neuron-metadata.json', 'output_citations.json', 'output_citations.csv')