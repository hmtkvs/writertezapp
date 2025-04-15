# Thesis Search Navigator - Backend API Documentation

## Overview
This documentation outlines the backend API requirements for the Thesis Search Navigator frontend application. The backend should implement all endpoints described below to ensure proper integration.

## Configuration
- Default API URL: `http://localhost:8000`
- The frontend allows users to configure this URL through the API Settings dialog

## API Endpoints

### 1. Root Endpoint (Health Check)
- **URL**: `/`
- **Method**: GET
- **Response**: 
```json
{
  "message": "Welcome to Research Papers API"
}
```
- **Purpose**: Confirms API is running and available

### 2. Chapters Endpoint
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

### 3. Statistics Endpoint
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

### 4. Search Endpoint
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
- **Response Fields**:
  - `id` (string): Unique identifier for the result
  - `score` (number): Relevance score (0-1)
  - `title` (string): Section title
  - `content` (string): Matched content
  - `metadata.title` (string): Section title
  - `metadata.source` (string): Source file
  - `metadata.parent_titles` (array): Hierarchy [chapter, section, subsection]
  - `metadata.level` (number): Hierarchy depth level

### 5. Text Rewriting Endpoint
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

## Implementation Requirements

### CORS Configuration
Enable CORS to allow requests from the frontend domain:
```python
from flask import Flask
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes
```

### Error Handling
Implement proper error responses:
```json
{
  "detail": "Error message explaining what went wrong"
}
```

### Implementation Example (Python/Flask)

```python
from flask import Flask, request, jsonify
from flask_cors import CORS
import openai  # or any other AI service you prefer

app = Flask(__name__)
CORS(app)

@app.route('/')
def index():
    return jsonify({"message": "Welcome to Research Papers API"})

@app.route('/chapters')
def get_chapters():
    # Return thesis chapters and sources
    return jsonify({
        "chapters": ["Introduction", "Literature Review", "Methodology", "Results", "Discussion", "Conclusion"],
        "sources": ["chapter1.tex", "chapter2.tex", "chapter3.tex", "chapter4.tex", "chapter5.tex", "chapter6.tex"]
    })

@app.route('/stats')
def get_stats():
    # Return document statistics
    return jsonify({
        "documentCount": 6,
        "chapterCount": 6,
        "sectionCount": 30
    })

@app.route('/search', methods=['POST'])
def search():
    data = request.json
    query = data.get('query', '')
    limit = data.get('limit', 5)
    score_threshold = data.get('score_threshold', 0.5)
    chapter_filter = data.get('chapter_filter')
    source_filter = data.get('source_filter')
    
    # Implement your search logic here
    # Return search results
    return jsonify({
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
    })

@app.route('/rewrite-text', methods=['POST'])
def rewrite_text():
    data = request.json
    selected_text = data.get('selectedText', '')
    before_text = data.get('beforeText', '')
    after_text = data.get('afterText', '')
    user_input = data.get('userInput', '')
    
    # Implement text rewriting logic here
    rewritten_text = f"Improved version of: {selected_text}"
    
    return jsonify({"rewrittenText": rewritten_text})

if __name__ == '__main__':
    app.run(debug=True, port=8000)
```

## Integration Testing

1. Start the backend API server: `./run_backend_api.sh`
2. Start the frontend application and configure API URL
3. Verify all functionality:
   - Check that chapters load on the main page
   - Test search functionality with different queries and filters
   - Test text rewriting feature

## Data Flow Diagram

```
┌───────────────┐       GET /chapters       ┌──────────────┐
│  Frontend     │◄────────────────────────►│  Backend     │
│  Application  │       GET /stats          │  API Server  │
│               │◄────────────────────────►│              │
│  Thesis       │       POST /search        │  Implements  │
│  Search       │◄────────────────────────►│  document    │
│  Navigator    │                           │  parsing and │
│               │       POST /rewrite-text  │  search      │
│               │◄────────────────────────►│  capabilities│
└───────────────┘                           └──────────────┘
```

## Security Considerations

1. Enable HTTPS for production deployments
2. Implement rate limiting to prevent abuse
3. Validate all user input
4. Consider authentication for sensitive operations

## Deployment

The script `run_backend_api.sh` is provided to launch the API server:
```bash
#!/bin/bash
echo "Starting Research Papers API server from backend folder..."
cd backend && ./run_api.sh 
```

Ensure the backend directory and `run_api.sh` script exist with proper permissions. 