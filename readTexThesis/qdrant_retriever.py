import argparse
from qdrant_client import QdrantClient
from qdrant_client.http.models import Filter, FieldCondition, MatchValue, MatchText
from openai import OpenAI
import textwrap
import os

# Configuration - same as in qdrant_vs_create.py
QDRANT_PATH = os.getenv('QDRANT_STORAGE_PATH', "./qdrant_storage2")
COLLECTION_NAME = "research_papers"

print(f"Using Qdrant storage at: {QDRANT_PATH}")

# Initialize clients
qdrant_client = QdrantClient(path=QDRANT_PATH)
deepinfra_client = OpenAI(
    base_url="https://api.deepinfra.com/v1/openai",
    api_key="0jxRzr6VTMJsMSnR2NomXgP0PKDkEEw5"
)

def search_documents(query: str, limit: int = 5, score_threshold: float = 0.5, chapter_filter: str = None, source_filter: str = None):
    """
    Search for documents relevant to the query text.
    
    Args:
        query: The search query text
        limit: Maximum number of results to return
        score_threshold: Minimum similarity score (0-1) to include in results
        chapter_filter: Only return results from the specified chapter
        source_filter: Only return results from the specified source file
        
    Returns:
        List of matching documents with their metadata
    """
    print(f"Searching for: '{query}' with limit={limit} and score_threshold={score_threshold}")
    if chapter_filter:
        print(f"Filtering by chapter: {chapter_filter}")
    if source_filter:
        print(f"Filtering by source: {source_filter}")
    
    # Generate embedding with BGE-specific query prefix
    query_embedding = deepinfra_client.embeddings.create(
        model="BAAI/bge-base-en-v1.5",
        input=f"query: {query}",
        encoding_format="float"
    ).data[0].embedding
    
    # Build filter conditions if needed
    search_args = {
        "collection_name": COLLECTION_NAME,
        "query_vector": query_embedding,
        "limit": limit,
        "score_threshold": score_threshold,
        "with_payload": True
    }
    
    if chapter_filter or source_filter:
        must_conditions = []
        
        if chapter_filter:
            # Check if a parent title contains the chapter name
            must_conditions.append(
                FieldCondition(
                    key="parent_titles",
                    match=MatchText(text=chapter_filter)
                )
            )
        
        if source_filter:
            # Filter by source file
            must_conditions.append(
                FieldCondition(
                    key="source_json",
                    match=MatchText(text=source_filter)
                )
            )
        
        search_args["query_filter"] = Filter(must=must_conditions)
    
    # Note: 'search' is deprecated but works for our use case
    # TODO: Migrate to newer API methods when they're stabilized in future versions
    results = qdrant_client.search(**search_args)
    
    # Debug the results structure
    print(f"Debug - Total results returned: {len(results)}")
    if results:
        print(f"Debug - Result type: {type(results)}")
        print(f"Debug - First result type: {type(results[0])}")
        if len(results) > 1:
            print(f"Debug - Score range: {results[-1].score:.4f} to {results[0].score:.4f}")
        else:
            print(f"Debug - Score: {results[0].score:.4f}")
    
    return results

def list_chapters():
    """List all available chapters in the collection"""
    # Get a sample of points to extract unique chapters
    results = [] # Initialize results
    try:
        print("DEBUG: Attempting qdrant_client.scroll in list_chapters...")
        scroll_result = qdrant_client.scroll(
            collection_name=COLLECTION_NAME,
            limit=1000,
            with_payload=True
        )
        # scroll returns a tuple: (list[Record], Optional[str | int])
        results = scroll_result[0]
        print(f"DEBUG: qdrant_client.scroll returned {len(results)} points.")
        if results:
            print(f"DEBUG: First point payload sample: {results[0].payload}")
        else:
            print("DEBUG: qdrant_client.scroll returned an empty list of points.")
            
    except Exception as e:
        print(f"ERROR in list_chapters during qdrant_client.scroll: {e}")
        import traceback
        traceback.print_exc() # Print detailed traceback
        return [] # Return empty on error
    
    # Collect all titles and determine which are at the chapter level
    chapters = set()
    for point in results:
        # Level 1 is typically a chapter
        if 'level' in point.payload and point.payload['level'] == 1:
            chapters.add(point.payload.get('title', 'Unknown'))
        # As a fallback, look for items that appear to be chapter titles based on position
        elif 'parent_titles' in point.payload and point.payload['parent_titles']:
            if len(point.payload['parent_titles']) >= 2:
                # The title immediately after the root is usually the chapter
                chapters.add(point.payload['parent_titles'][0])
    
    # For source-based navigation, extract unique sources
    sources = set()
    for point in results:
        if 'source_json' in point.payload and point.payload['source_json']:
            sources.add(point.payload['source_json'])
    
    print("\nAvailable chapters:")
    for chapter in sorted(chapters):
        print(f" - {chapter}")
    
    print("\nAvailable sources:")
    for source in sorted(sources):
        print(f" - {source}")
    print()

def print_results(results, show_full_content: bool = False):
    """Pretty print the search results"""
    if not results:
        print("No matching documents found.")
        return
        
    print(f"\n{'=' * 80}\n")
    print(f"Found {len(results)} relevant documents:\n")
    
    for i, result in enumerate(results, 1):
        # Assuming result is a ScoredPoint object with id, score, and payload attributes
        print(f"\033[1m{i}. {result.payload.get('title', 'No title')}\033[0m")
        print(f"   Relevance: {result.score:.4f}")
        print(f"   Source: {result.payload.get('source_json', 'Unknown source')}")
        print(f"   Hierarchy: {' → '.join(result.payload.get('parent_titles', ['No hierarchy']))}")
        
        # Format and print content with wrapping
        content = result.payload.get('content', 'No content available')
        if not show_full_content and len(content) > 300:
            content = content[:300] + "..."
            
        wrapped_content = textwrap.fill(content, width=80, initial_indent="   ", subsequent_indent="   ")
        print(f"\n{wrapped_content}\n")
        print(f"{'-' * 80}\n")

def main():
    parser = argparse.ArgumentParser(description="Search research documents using semantic similarity")
    parser.add_argument("query", nargs="?", help="The search query (if not provided, will prompt)")
    parser.add_argument("-n", "--num-results", type=int, default=5, help="Number of results to return")
    parser.add_argument("-t", "--threshold", type=float, default=0.5, help="Minimum similarity score (0-1)")
    parser.add_argument("-f", "--full-content", action="store_true", help="Show full content instead of truncating")
    parser.add_argument("-c", "--chapter", type=str, help="Filter results to a specific chapter")
    parser.add_argument("-s", "--source", type=str, help="Filter results to a specific source file")
    parser.add_argument("--list-chapters", action="store_true", help="List all available chapters and exit")
    
    args = parser.parse_args()
    
    # List chapters if requested
    if args.list_chapters:
        list_chapters()
        return
    
    # Get query from command line args or prompt
    query = args.query
    if not query:
        query = input("Enter your search query: ")
    
    # Perform search
    results = search_documents(
        query, 
        limit=args.num_results, 
        score_threshold=args.threshold,
        chapter_filter=args.chapter,
        source_filter=args.source
    )
    
    # Display results
    print_results(results, show_full_content=args.full_content)

if __name__ == "__main__":
    main() 