# Thesis Search Navigator API

This API serves as the backend for the Thesis Search Navigator application. It provides endpoints for searching through LaTeX thesis content using vector search techniques.

## Prerequisites

- Python 3.10+
- Conda (for environment management)
- Thesis data already processed through readTexThesis

## Setup

1. Make sure you have processed your thesis data using the readTexThesis tools:
   ```bash
   cd ../readTexThesis
   ./process_overleaf.sh  # Or follow the manual workflow in readTexThesis README
   ```

2. Install the required dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Make the run script executable:
   ```bash
   chmod +x run_api.sh
   ```

## Running the API

```bash
./run_api.sh
```

The API will start on http://localhost:8000

## API Endpoints

- `GET /` - Health check
- `GET /chapters` - List of available chapters and sources
- `GET /stats` - Document statistics
- `POST /search` - Search functionality
- `POST /rewrite-text` - Text rewriting functionality

For detailed documentation of each endpoint, see the API documentation.

## Integration with Frontend

To use this API with the Thesis Search Navigator frontend:

1. Start the API server
2. Configure the frontend to use the API URL (default: http://localhost:8000)
3. Use the frontend to search and navigate through your thesis content

## Troubleshooting

- Ensure the readTexThesis directory is properly set up and has processed your thesis data
- Check that the conda environment from readTexThesis is activated
- Verify that the vector database (qdrant_storage2) exists and contains your indexed thesis data 