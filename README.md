# Thesis Search Navigator

This project provides a complete system for searching and navigating through LaTeX thesis documents using vector search technology.

## Project Structure

- **readTexThesis/** - Parser and vector database tools for LaTeX thesis documents
- **thesis-search-api/** - Backend API for thesis search functionality
- **thesis-search-navigator/** - Frontend application for thesis search and navigation

## Setup

### Environment Setup

1. Create and activate the conda environment:
   ```bash
   cd readTexThesis
   conda env create -f environment.yml
   conda activate thesis
   ```

2. Set up the API:
   ```bash
   cd thesis-search-api
   ./setup.sh
   ```

3. Run the API:
   ```bash
   ./run_api.sh
   ```

4. In a separate terminal, run the frontend:
   ```bash
   cd thesis-search-navigator
   npm install
   npm run dev
   ```

5. Open the application in your browser at http://localhost:3000

## Usage

1. Upload your LaTeX thesis through the readTexThesis parser
2. Use the search functionality to find relevant sections in your thesis
3. Navigate through chapters and sections
4. Utilize text rewriting features for editing

## Dependencies

All dependencies are managed in the following files:
- `readTexThesis/environment.yml` - Main conda environment
- `thesis-search-api/requirements.txt` - API-specific dependencies
- `thesis-search-navigator/package.json` - Frontend dependencies 