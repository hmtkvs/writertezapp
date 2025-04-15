from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import os
import sys
import json
import subprocess
import re
import traceback
from pathlib import Path

# Disable warnings related to IDNA codec errors
import warnings
warnings.filterwarnings("ignore", category=UnicodeWarning)

# Print current directory for debugging
print(f"Current working directory: {os.getcwd()}")

# Add the readTexThesis directory to path so we can import modules from it
script_dir = os.path.dirname(os.path.abspath(__file__))
readTexThesis_path = os.path.abspath(os.path.join(script_dir, '..', 'readTexThesis'))
sys.path.insert(0, readTexThesis_path)  # Insert at beginning of path for priority

print(f"Python path: {sys.path}")
print(f"Looking for readTexThesis at: {readTexThesis_path}")
print(f"Directory exists: {os.path.exists(readTexThesis_path)}")

# Check if qdrant_retriever.py exists
retriever_path = os.path.join(readTexThesis_path, "qdrant_retriever.py")
print(f"Looking for qdrant_retriever.py at: {retriever_path}")
print(f"File exists: {os.path.exists(retriever_path)}")

# Override Qdrant storage path to use absolute path
os.environ['QDRANT_STORAGE_PATH'] = os.path.join(readTexThesis_path, "qdrant_storage2")
print(f"Setting Qdrant storage path to: {os.environ['QDRANT_STORAGE_PATH']}")

# Create a dummy search function that returns empty results in case of import failure
def dummy_search_documents(*args, **kwargs):
    print("Warning: Using dummy search function")
    return []

# Create a dummy list_chapters function that returns empty results in case of import failure
def dummy_list_chapters(*args, **kwargs):
    print("Warning: Using dummy list_chapters function")
    return []

# Default values in case of import failure
search_documents = dummy_search_documents
list_chapters = dummy_list_chapters
COLLECTION_NAME = "research_papers"

# Store original working directory
# original_dir = os.getcwd() # No longer needed

# Import the modules from readTexThesis
success = False
try:
    # Change to readTexThesis directory before importing modules
    # os.chdir(readTexThesis_path) # Removed
    # print(f"Changed to directory: {os.getcwd()}") # Removed
    
    # Import directly from the script
    # Imports should work since readTexThesis_path is in sys.path
    from qdrant_retriever import search_documents, list_chapters, COLLECTION_NAME, qdrant_client, deepinfra_client # Keep this import
    
    # Debug: Check collection status
    print(f"\nDEBUG: Checking Qdrant collection status...")
    print(f"DEBUG: Collection name expected: {COLLECTION_NAME}")
    try:
        collection_info = qdrant_client.get_collection(COLLECTION_NAME)
        print(f"DEBUG: Collection info: {collection_info}")
        print(f"DEBUG: Collection exists and has {collection_info.vectors_count} vectors")
    except Exception as e:
        print(f"DEBUG: Error checking collection: {e}")
    
    success = True
    
    # Create safer wrapper functions for qdrant operations
    def safe_list_chapters():
        """A wrapper around list_chapters that catches and handles IDNA errors"""
        try:
            # Get scroll results directly from qdrant_client
            scroll_result = qdrant_client.scroll(
                collection_name=COLLECTION_NAME,
                limit=1000,
                with_payload=True
            )
            # scroll returns a tuple: (list[Record], Optional[str | int])
            return scroll_result[0] if scroll_result else []
        except UnicodeError as e:
            print(f"Unicode/IDNA error in list_chapters: {e}")
            return []
        except Exception as e:
            print(f"Unexpected error in list_chapters: {e}")
            return []
            
    def safe_search_documents(query, limit=5, score_threshold=0.5, chapter_filter=None, source_filter=None):
        """A wrapper around search_documents that catches and handles IDNA and OpenAI errors"""
        try:
            return search_documents(
                query=query,
                limit=limit,
                score_threshold=score_threshold,
                chapter_filter=chapter_filter,
                source_filter=source_filter
            )
        except UnicodeError as e:
            print(f"Unicode/IDNA error in search_documents: {e}")
            return []
        except Exception as e:
            print(f"Unexpected error in search_documents: {e}")
            return []
    
    # Return to original directory
    # os.chdir(original_dir) # Removed
    # print(f"Returned to directory: {os.getcwd()}") # Removed
except ImportError as e:
    print(f"Error importing modules from readTexThesis: {e}")
    print(f"Looking in path: {readTexThesis_path}")
    print(f"Python path: {sys.path}")
    print("Traceback:")
    traceback.print_exc()
    
    # Try to load qdrant_retriever.py manually
    try:
        print("Attempting to load qdrant_retriever.py manually...")
        # os.chdir(original_dir)  # Removed - manual loading should also work without changing dir
        
        import importlib.util
        spec = importlib.util.spec_from_file_location("qdrant_retriever", retriever_path)
        qdrant_retriever = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(qdrant_retriever)
        
        # Get functions from the module
        search_documents = qdrant_retriever.search_documents
        list_chapters = qdrant_retriever.list_chapters
        COLLECTION_NAME = qdrant_retriever.COLLECTION_NAME
        success = True
        
        print("Successfully loaded qdrant_retriever.py manually")
    except Exception as e2:
        print(f"Error loading module manually: {e2}")
        traceback.print_exc()

# Define API models
class ChaptersResponse(BaseModel):
    chapters: List[str]
    sources: List[str]

class StatsResponse(BaseModel):
    documentCount: int
    chapterCount: int
    sectionCount: int

class SearchQuery(BaseModel):
    query: str
    limit: int = 5
    score_threshold: float = 0.5
    chapter_filter: Optional[str] = None
    source_filter: Optional[str] = None
    page: int = 1  # Page number for pagination
    page_size: int = 10  # Number of results per page

class ResultMetadata(BaseModel):
    title: str
    source: str
    parent_titles: List[str]
    level: int

class SearchResult(BaseModel):
    id: str
    score: float
    title: str
    content: str
    metadata: ResultMetadata

class SearchResponse(BaseModel):
    results: List[SearchResult]
    total_results: int  # Total number of results available
    current_page: int   # Current page number
    total_pages: int    # Total number of pages
    has_more: bool      # Whether there are more results available

class RewriteRequest(BaseModel):
    selectedText: str
    beforeText: str = ""
    afterText: str = ""
    userInput: str = ""
    shouldRewrite: bool = False  # Trigger flag to control when to make the API call

class RewriteResponse(BaseModel):
    rewrittenText: str

# Create FastAPI app
app = FastAPI(title="Research Papers API")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/", summary="Health check endpoint")
async def root():
    """Health check endpoint"""
    status = "operational" if success else "limited functionality"
    
    # Get available collections
    available_collections = []
    try:
        # Attempt to import qdrant_client directly
        if success and 'qdrant_client' in globals():
            # Try to list collections
            collections_info = qdrant_client.get_collections()
            if hasattr(collections_info, 'collections'):
                available_collections = [coll.name for coll in collections_info.collections]
            elif isinstance(collections_info, dict) and 'collections' in collections_info:
                available_collections = [coll.get('name') for coll in collections_info['collections']]
            elif isinstance(collections_info, list):
                available_collections = [coll.get('name') if isinstance(coll, dict) else str(coll) for coll in collections_info]
            else:
                available_collections = ["Unknown response format from qdrant_client.get_collections()"]
        else:
            available_collections = ["qdrant_client not available"]
    except Exception as e:
        available_collections = [f"Error listing collections: {str(e)}"]
    
    return {
        "message": "Welcome to Research Papers API",
        "status": status,
        "import_success": success,
        "qdrant_collections": available_collections
    }

@app.get("/chapters", response_model=ChaptersResponse, summary="List available chapters and sources")
async def get_chapters():
    """Return thesis chapters and sources"""
    try:
        if not success:
            raise HTTPException(status_code=500, detail="API not properly initialized")
        
        # Define the known chapter mapping based on the data files
        chapter_mapping = {
            "0-": "Abbreviations",
            "1-": "Introduction",
            "2-": "Background",
            "3-": "State of the Art",
            "4-": "Job Offer and Applicant CV Classification Using Rich Information from a Labour Market Taxonomy",
            "5-": "Using Large Language Models and Recruiter Expertise for Optimized Multilingual Job Offer -- Applicant CV Matching",
            "6-": "Enhancing Job Posting Classification with Multilingual Embeddings and Large Language Models",
            "7-": "Multilingual Skill Extraction for Job Vacancy--Job Seeker Matching in Knowledge Graphs",
            "8-": "Conclusions and Future Work"
        }
            
        scroll_result = qdrant_client.scroll(
            collection_name=COLLECTION_NAME,
            limit=1000,
            with_payload=True
        )
        results = scroll_result[0] if scroll_result else []
        
        chapters = set()
        sources = set()
        
        if results:
            for point in results:
                if hasattr(point, 'payload'):
                    # Get source file and use it to determine chapter
                    if 'source_json' in point.payload and point.payload['source_json']:
                        source_path = point.payload['source_json']
                        filename = os.path.basename(source_path)
                        
                        # Add source (convert from JSON to TEX)
                        tex_name = filename.replace('.json', '.tex')
                        if any(tex_name.startswith(prefix) for prefix in chapter_mapping.keys()):
                            # Remove number prefix for chapter files
                            tex_name = re.sub(r'^\d+-', '', tex_name)
                        sources.add(tex_name.lower())
                        
                        # Add chapter based on filename prefix
                        for prefix, chapter_name in chapter_mapping.items():
                            if filename.startswith(prefix):
                                chapters.add(chapter_name)
                                break
        
        # Ensure all chapters are included even if not found in results
        chapters = set(chapter_mapping.values())
        
        return {
            "chapters": list(sorted(chapters)),
            "sources": list(sorted(sources))
        }
    except Exception as e:
        print(f"ERROR in get_chapters endpoint: {str(e)}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/stats", response_model=StatsResponse, summary="Get document statistics")
async def get_stats():
    """Return document statistics"""
    try:
        if not success:
            raise HTTPException(status_code=500, detail="API not properly initialized")
            
        # Get all points from the collection
        scroll_result = qdrant_client.scroll(
            collection_name=COLLECTION_NAME,
            limit=1000,
            with_payload=True
        )
        results = scroll_result[0] if scroll_result else []
        
        # Count unique document sources, chapters, and sections
        sources = set()
        chapters = set()
        sections = set()
        
        for point in results:
            if not hasattr(point, 'payload'):
                continue
                
            # Count sources
            if 'source_json' in point.payload and point.payload['source_json']:
                sources.add(point.payload['source_json'])
            
            # Count chapters (from parent_titles)
            if 'parent_titles' in point.payload and point.payload['parent_titles']:
                chapters.add(point.payload['parent_titles'][0])
            
            # Count sections - each point is a section
            if hasattr(point, 'id'):
                sections.add(point.id)
        
        return {
            "documentCount": len(sources),
            "chapterCount": len(chapters),
            "sectionCount": len(sections)
        }
    except Exception as e:
        print(f"Error in get_stats: {str(e)}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/search", response_model=SearchResponse, summary="Search for content")
async def search(query: SearchQuery):
    """Search endpoint that uses the qdrant_retriever functionality with pagination"""
    try:
        if not success:
            raise HTTPException(status_code=500, detail="API not properly initialized")
            
        # First, get total count with a larger limit
        print(f"Searching for: '{query.query}' with score_threshold={query.score_threshold}")
        
        # Use a much larger limit to get more results
        all_results = safe_search_documents(
            query=query.query,
            limit=1000,  # Increased limit to get more potential matches
            score_threshold=query.score_threshold,
            chapter_filter=query.chapter_filter,
            source_filter=query.source_filter
        )
        
        # Calculate pagination values
        total_results = len(all_results)
        page_size = min(query.page_size, 20)  # Limit page size to prevent too large responses
        total_pages = (total_results + page_size - 1) // page_size
        current_page = min(max(1, query.page), total_pages) if total_pages > 0 else 1
        
        # Get the slice of results for the current page
        start_idx = (current_page - 1) * page_size
        end_idx = start_idx + page_size
        page_results = all_results[start_idx:end_idx]
        
        print(f"DEBUG: Pagination info - Total: {total_results}, Page: {current_page}/{total_pages}, Size: {page_size}, Results: {len(page_results)}")
        
        # Get all points from the collection to find complete sections
        scroll_result = qdrant_client.scroll(
            collection_name=COLLECTION_NAME,
            limit=1000,
            with_payload=True
        )
        all_points = scroll_result[0] if scroll_result else []
        
        # Create a map of source_json -> points for faster lookup
        points_by_source = {}
        for point in all_points:
            if hasattr(point, 'payload'):
                source = point.payload.get('source_json', '')
                if source not in points_by_source:
                    points_by_source[source] = []
                points_by_source[source].append(point)
        
        # Format results according to API spec
        formatted_results = []
        for idx, result in enumerate(page_results):
            if not hasattr(result, 'payload'):
                continue
                
            payload = result.payload if hasattr(result, "payload") else {}
            
            # Extract parent titles and determine level
            parent_titles = payload.get('parent_titles', [])
            level = payload.get('level', len(parent_titles))
            
            # Get the most specific title
            title = payload.get('title', parent_titles[-1] if parent_titles else "Untitled")
            
            # Clean up source path to just filename
            source_path = payload.get('source_json', '')
            source_file = os.path.basename(source_path).replace('.json', '.tex')
            if source_file.startswith(('0-', '1-', '2-', '3-', '4-', '5-', '6-', '7-', '8-', '9-')):
                source_file = re.sub(r'^\d+-', '', source_file)
            source_file = source_file.lower()
            
            # Generate a more readable section ID
            if parent_titles:
                chapter_match = re.match(r'^(\d+)-', os.path.basename(source_path))
                chapter_num = chapter_match.group(1) if chapter_match else '0'
                section_id = f"section-{chapter_num}.{level}"
            else:
                section_id = f"section-{result.id if hasattr(result, 'id') else idx+1}"
            
            # Find the complete section content by looking at all points from the same source
            complete_content = payload.get('content', 'No content available')
            if source_path in points_by_source:
                # Find points that are part of the same section
                section_points = []
                for point in points_by_source[source_path]:
                    if (point.payload.get('parent_titles', []) == parent_titles and 
                        point.payload.get('title', '') == title):
                        section_points.append(point)
                
                # Combine content from all points in the section
                if section_points:
                    complete_content = ' '.join(p.payload.get('content', '') for p in section_points)
            
            # Clean up content
            complete_content = re.sub(r'\s*{#[^}]+}\s*', ' ', complete_content)
            complete_content = re.sub(r'\s+', ' ', complete_content).strip()
            complete_content = re.sub(r'\\[a-zA-Z]+\{([^}]+)\}', r'\1', complete_content)
            
            formatted_results.append(SearchResult(
                id=section_id,
                score=result.score if hasattr(result, "score") else 0.0,
                title=title,
                content=complete_content,
                metadata=ResultMetadata(
                    title=title,
                    source=source_file,
                    parent_titles=parent_titles,
                    level=level
                )
            ))
        
        response_data = {
            "results": formatted_results,
            "total_results": total_results,
            "current_page": current_page,
            "total_pages": total_pages,
            "has_more": current_page < total_pages
        }
        
        print(f"DEBUG: Sending response with {len(formatted_results)} results, has_more={response_data['has_more']}")
        return response_data
        
    except Exception as e:
        print(f"Error in search: {str(e)}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/rewrite-text", response_model=RewriteResponse, summary="Rewrite selected text")
async def rewrite_text(request: RewriteRequest):
    """Text rewriting endpoint that uses LLM to improve the text based on user input"""
    try:
        # Only make the API call if shouldRewrite is True
        if not request.shouldRewrite:
            return {"rewrittenText": request.selectedText}
            
        # Construct context with before and after text
        context = f"{request.beforeText.strip()}\n[HIGHLIGHTED: {request.selectedText}]\n{request.afterText.strip()}"
        
        # Construct the prompt for the LLM
        prompt = f"""You are an expert academic writing assistant. Your task is to rewrite the highlighted portion of text while:
1. Maintaining LaTeX formatting and mathematical notation
2. Preserving academic writing style
3. Ensuring coherence with the surrounding context
4. Following the user's specific instructions

Text with context:
{context}

User instruction: {request.userInput}

Provide ONLY the rewritten version of the highlighted text, preserving any LaTeX commands and mathematical notation."""

        # Call the LLM using deepinfra_client
        response = deepinfra_client.chat.completions.create(
            model="meta-llama/Llama-2-70b-chat-hf",  # Using Llama 2 70B for high-quality academic writing
            messages=[
                {"role": "system", "content": "You are an expert academic writing assistant specializing in LaTeX documents."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=1000,
            temperature=0.7  # Balanced between creativity and consistency
        )
        
        # Extract and clean the rewritten text
        rewritten_text = response.choices[0].message.content.strip()
        
        # Remove any potential wrapper quotes or backticks that the model might add
        rewritten_text = rewritten_text.strip('`"\' ')
        
        return {"rewrittenText": rewritten_text}
    except Exception as e:
        print(f"Error in rewrite_text: {str(e)}")
        traceback.print_exc()
        return {"rewrittenText": request.selectedText}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True) 