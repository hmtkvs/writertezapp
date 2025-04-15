# WriterTezApp - Thesis Search and Navigation System

This project provides a complete system for searching and navigating through LaTeX thesis documents using vector search technology.

## Project Structure

The project consists of three main components:

- **readTexThesis/** - Parser and vector database tools for LaTeX thesis documents
- **thesis-search-api/** - Backend API for thesis search functionality
- **thesis-search-navigator/** - Frontend application for thesis search and navigation

## Setup

### Prerequisites

- Python 3.10+
- Node.js & npm
- Conda (for environment management)
- Pandoc: `brew install pandoc` (macOS) or `apt-get install pandoc` (Linux)

### Environment Setup

1. **Set up the parser and vector database**:
   ```bash
   cd readTexThesis
   conda env create -f environment.yml
   conda activate thesis
   chmod +x process_overleaf.sh query.sh run.sh
   ```

2. **Process your thesis data**:
   ```bash
   ./process_overleaf.sh
   ```
   Or for a quick start:
   ```bash
   ./run.sh
   ```

3. **Set up and run the API**:
   ```bash
   cd ../thesis-search-api
   chmod +x run_api.sh
   ./run_api.sh
   ```

4. **Set up and run the frontend**:
   ```bash
   cd ../thesis-search-navigator
   npm install
   npm run dev
   ```

5. Open the application in your browser at http://localhost:3000

## Components Details

### 1. readTexThesis - Thesis Parser and Vector DB

The parser component converts LaTeX (.tex) files from an Overleaf project into structured text and JSON files for analysis and includes vector database tools for semantic searching.

#### Key Features
- Convert .tex files to plain text and structured JSON
- Process Overleaf projects automatically
- Index content in a vector database for semantic search
- Perform semantic searches with filtering options

#### Workflow
1. Download your Overleaf project as a ZIP
2. Process the files with provided scripts
3. Index the content for searching
4. Use query tools to search through your thesis

### 2. thesis-search-api - Backend API

This component serves as the backend for the Thesis Search Navigator application, providing endpoints for searching through LaTeX thesis content.

#### API Endpoints
- `GET /` - Health check
- `GET /chapters` - List of available chapters and sources
- `GET /stats` - Document statistics
- `POST /search` - Search functionality
- `POST /rewrite-text` - Text rewriting functionality

### 3. thesis-search-navigator - Frontend Application

The frontend application provides a user interface for searching and navigating through the thesis content.

#### Features
- Search through thesis content
- Navigate chapters and sections
- Visualize concept distribution
- Text rewriting capabilities
- Cross-reference linking

## Usage

1. Upload your LaTeX thesis through the readTexThesis parser
2. Start the API server
3. Launch the frontend application
4. Use the search functionality to find relevant sections
5. Navigate through chapters and sections
6. Utilize text rewriting features for editing

## Dependencies

All dependencies are managed in the following files:
- `readTexThesis/environment.yml` - Main conda environment
- `thesis-search-api/requirements.txt` - API-specific dependencies
- `thesis-search-navigator/package.json` - Frontend dependencies 