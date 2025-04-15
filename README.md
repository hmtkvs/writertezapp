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

#### API Configuration
- Default API URL: `http://localhost:8000`
- The frontend allows users to configure this URL through the API Settings dialog

#### API Endpoints

##### Health Check
- **URL**: `/`
- **Method**: GET
- **Response**: 
```json
{
  "message": "Welcome to Research Papers API"
}
```
- **Purpose**: Confirms API is running and available

##### Chapters
- **URL**: `/chapters`
- **Method**: GET
- **Response**:
```json
{
  "chapters": ["Introduction", "Literature Review", "Methodology", "Results", "Discussion", "Conclusion"],
  "sources": ["chapter1.tex", "chapter2.tex", "chapter3.tex", "chapter4.tex", "chapter5.tex", "chapter6.tex"]
}
```
- **Purpose**: Provides list of available chapters and source files for navigation and filtering

##### Statistics
- **URL**: `/stats`
- **Method**: GET
- **Response**:
```json
{
  "documentCount": 6,
  "chapterCount": 6,
  "sectionCount": 30
}
```
- **Purpose**: Provides metadata about the thesis document structure

##### Search
- **URL**: `/search`
- **Method**: POST
- **Request Body**:
```json
{
  "query": "machine learning applications",
  "limit": 5,
  "score_threshold": 0.5,
  "chapter_filter": "Literature Review",
  "source_filter": null
}
```
- **Parameters**:
  - `query` (string): The search query text
  - `limit` (number): Maximum number of results to return
  - `score_threshold` (number): Minimum similarity score (0-1) for results
  - `chapter_filter` (string|null): Filter results by chapter name
  - `source_filter` (string|null): Filter results by source file

- **Response**:
```json
{
  "results": [
    {
      "id": "section-2.3",
      "score": 0.87,
      "title": "Deep Learning",
      "content": "Deep learning represents a subset of machine learning...",
      "metadata": {
        "title": "Deep Learning",
        "source": "chapter2.tex",
        "parent_titles": ["Literature Review", "Machine Learning Approaches"],
        "level": 2
      }
    }
  ]
}
```

##### Text Rewriting
- **URL**: `/rewrite-text`
- **Method**: POST
- **Request Body**:
```json
{
  "selectedText": "The text that was selected by the user",
  "beforeText": "Text appearing before the selection for context",
  "afterText": "Text appearing after the selection for context",
  "userInput": "User's instructions for rewriting (e.g., 'Make this more formal')"
}
```
- **Response**:
```json
{
  "rewrittenText": "The rewritten version of the selected text"
}
```
- **Purpose**: Processes text rewriting requests with user instructions

#### Implementation Guidelines

##### CORS Configuration
Enable CORS to allow requests from the frontend domain:
```python
from flask import Flask
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes
```

##### Error Handling
Implement proper error responses:
```json
{
  "detail": "Error message explaining what went wrong"
}
```

##### Security Considerations
1. Enable HTTPS for production deployments
2. Implement rate limiting to prevent abuse
3. Validate all user input
4. Consider authentication for sensitive operations

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

## Integration Testing

1. Start the backend API server: `./run_backend_api.sh`
2. Start the frontend application and configure API URL
3. Verify all functionality:
   - Check that chapters load on the main page
   - Test search functionality with different queries and filters
   - Test text rewriting feature

## Dependencies

All dependencies are managed in the following files:
- `readTexThesis/environment.yml` - Main conda environment
- `thesis-search-api/requirements.txt` - API-specific dependencies
- `thesis-search-navigator/package.json` - Frontend dependencies 