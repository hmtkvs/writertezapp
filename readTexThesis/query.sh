#!/bin/bash

# Activate conda environment
if conda env list | grep -q "^thesis "; then
    echo "Activating conda environment 'thesis'..."
    source "$(conda info --base)/etc/profile.d/conda.sh"
    conda activate thesis
else
    echo "WARNING: conda environment 'thesis' not found. Using system Python."
fi

# Parse command line arguments
QUERY="$1"
CHAPTER="$2"
LIMIT="${3:-5}"
THRESHOLD="${4:-0.5}"

# Show usage if query is not provided
if [ -z "$QUERY" ]; then
    echo "Usage: ./query.sh \"query text\" [chapter_name] [limit=5] [threshold=0.5]"
    echo ""
    echo "Examples:"
    echo "  ./query.sh \"ESCO taxonomy\"                      # Basic search"
    echo "  ./query.sh \"neural networks\" \"Introduction\"     # Filter by chapter"
    echo "  ./query.sh \"embeddings\" \"\" 10                   # Return 10 results"
    echo "  ./query.sh \"vector database\" \"\" 5 0.7          # Set threshold to 0.7"
    echo ""
    echo "Available chapters:"
    python qdrant_retriever.py --list-chapters
    exit 1
fi

# Run the query with appropriate parameters
if [ -n "$CHAPTER" ]; then
    # Search with chapter filter
    echo "Searching for \"$QUERY\" in chapter \"$CHAPTER\" (limit: $LIMIT, threshold: $THRESHOLD)"
    python qdrant_retriever.py "$QUERY" -c "$CHAPTER" -n "$LIMIT" -t "$THRESHOLD" -f
else
    # Search without chapter filter
    echo "Searching for \"$QUERY\" (limit: $LIMIT, threshold: $THRESHOLD)"
    python qdrant_retriever.py "$QUERY" -n "$LIMIT" -t "$THRESHOLD" -f
fi 