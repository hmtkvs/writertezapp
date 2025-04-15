# TeX Thesis Parser

This project provides tools to convert LaTeX (.tex) files from an Overleaf project into structured text and JSON files for analysis. It also includes vector database tools for semantic searching of the parsed content.

## Components

1. **read_tex_files.py**: Python script that converts .tex files to plain text and structured JSON.
2. **process_overleaf.sh**: Bash script to automate the workflow of downloading, extracting, and processing Overleaf projects.
3. **qdrant_create_update.py**: Python script that indexes parsed JSON files into a vector database for semantic search.
4. **qdrant_retriever.py**: Python script that performs semantic searches on the indexed content.
5. **query.sh**: Bash script that simplifies searching with various filtering options.

## Environment Setup

### Conda Environment

This project includes a conda environment file for easy setup:

1. Make sure you have Miniconda or Anaconda installed
2. Create the environment:
   ```
   conda env create -f environment.yml
   ```
3. Activate the environment:
   ```
   conda activate thesis
   ```

### Dependencies

- Python 3.10+
- Pandoc: `brew install pandoc` (macOS) or `apt-get install pandoc` (Linux)
- Required Python packages:
  - pandas
  - numpy
  - qdrant-client
  - openai

## Workflow

### One-time Setup

1. Clone this repository
2. Set up the conda environment (see above)
3. Install Pandoc
4. Make the scripts executable: 
   ```
   chmod +x process_overleaf.sh query.sh
   ```

### Automated Workflow

1. Download your Overleaf project as a ZIP file to your Downloads folder
2. Run the automated script:
   ```
   ./process_overleaf.sh
   ```
3. The script will:
   - Find the most recently downloaded ZIP file
   - Archive any existing data (if present)
   - Extract the ZIP file into the data directory
   - Run the conversion process to generate TXT and JSON files
   - Index the JSON files into the vector store
   - Store outputs in a timestamped directory

### Manual Workflow

If you prefer to run the conversion process manually:

1. Place your .tex files in the `data` directory
2. Run the conversion script:
   ```
   python read_tex_files.py
   ```
3. Index the parsed files into the vector store:
   ```
   python qdrant_create_update.py output_YYYYMMDD_HHMMSS
   ```
4. Find the processed files in the timestamped output directory

## Semantic Search

After the content has been indexed, you can perform semantic searches to find relevant information.

### Using query.sh (Recommended)

The `query.sh` script provides a convenient way to search the indexed content:

```bash
# Basic search
./query.sh "ESCO taxonomy"

# Filter by chapter
./query.sh "neural networks" "Introduction"

# Return more results
./query.sh "embeddings" "" 10

# Adjust similarity threshold
./query.sh "vector database" "" 5 0.7

# List available chapters
./query.sh
```

### Direct Usage of qdrant_retriever.py

For more advanced options, you can use the `qdrant_retriever.py` script directly:

```bash
# Basic search
python qdrant_retriever.py "query text"

# List available chapters and sources
python qdrant_retriever.py --list-chapters

# Filter by chapter
python qdrant_retriever.py "query text" -c "Introduction"

# Filter by source file
python qdrant_retriever.py "query text" -s "/path/to/file.json"

# Control number of results
python qdrant_retriever.py "query text" -n 10

# Adjust similarity threshold
python qdrant_retriever.py "query text" -t 0.7

# Show full content
python qdrant_retriever.py "query text" -f
```

## Output

The parser generates two types of output files:

1. **Plain text (.txt)** - TeX files converted to plain text with formatting removed
2. **Structured JSON (.json)** - Hierarchical representation of documents with:
   - Chapters
   - Sections
   - Subsections
   - Content for each level

## Directory Structure

- **data/** - Current source TeX files
- **archive/** - Previously processed versions of source files
- **output_YYYYMMDD_HHMMSS/** - Converted files from each run
- **qdrant_storage2/** - Vector database storage
- **latest_data** - Symbolic link to the most recent data directory
- **latest_output** - Symbolic link to the most recent output directory

## Quick Start

For a quick start with a new Overleaf download:

```bash
./run.sh
```

This will:
1. Activate the conda environment
2. Process the most recent downloaded Overleaf zip file
3. Index the content for searching
4. Create appropriate symbolic links 