import json
from pathlib import Path
import hashlib
import time
from datetime import datetime
from typing import Dict, Any
import json
from pathlib import Path
from qdrant_client import QdrantClient
from qdrant_client.http import models
from openai import OpenAI
import hashlib
import sys
import os

# Configuration
QDRANT_PATH = os.getenv('QDRANT_STORAGE_PATH', "./qdrant_storage2")  # Persistent storage path
COLLECTION_NAME = "research_papers"
BATCH_SIZE = 32  # Optimized for embedding API limits

print(f"Using Qdrant storage at: {QDRANT_PATH}")

# Initialize clients with persistence
deepinfra_client = OpenAI(
    base_url="https://api.deepinfra.com/v1/openai",
    api_key="0jxRzr6VTMJsMSnR2NomXgP0PKDkEEw5"
)

class VectorStoreManager:
    def __init__(self, qdrant_path: str = "./qdrant_storage2"):
        self.qdrant_client = QdrantClient(path=qdrant_path)
        self.metadata_path = Path(qdrant_path) / "processing_metadata.json"
        self.file_metadata = self._load_metadata()
        
    def _load_metadata(self) -> Dict[str, Dict[str, Any]]:
        try:
            with open(self.metadata_path) as f:
                return json.load(f)
        except (FileNotFoundError, json.JSONDecodeError):
            return {}

    def _save_metadata(self):
        with open(self.metadata_path, 'w') as f:
            json.dump(self.file_metadata, f)

    def get_file_state(self, file_path: Path) -> Dict[str, Any]:
        stat = file_path.stat()
        return {
            "mtime": stat.st_mtime,
            "size": stat.st_size,
            "hash": self._calculate_file_hash(file_path)
        }

    def _calculate_file_hash(self, file_path: Path) -> str:
        hash_md5 = hashlib.md5()
        with open(file_path, "rb") as f:
            for chunk in iter(lambda: f.read(4096), b""):
                hash_md5.update(chunk)
        return hash_md5.hexdigest()

    def has_file_changed(self, file_path: Path) -> bool:
        str_path = str(file_path)
        if str_path not in self.file_metadata:
            return True
            
        old_state = self.file_metadata[str_path]
        new_state = self.get_file_state(file_path)
        
        return not (
            new_state["mtime"] == old_state["mtime"] and
            new_state["size"] == old_state["size"] and
            new_state["hash"] == old_state["hash"]
        )
    
    def close(self):
        """Close the qdrant client connection to release resources"""
        if hasattr(self, 'qdrant_client'):
            self.qdrant_client.close()
            
def hash_id(text: str) -> int:
    return int(hashlib.md5(text.encode()).hexdigest()[:16], 16)

    
def process_section(section: dict, parent_titles: list, file_path: Path):
    """Recursively process sections with hierarchy awareness"""
    # Generate unique ID based on content path
    content_id = hash_id(f"{file_path.stem}-{'-'.join(parent_titles)}-{section['title']}")
    
    # Create payload with metadata
    payload = {
        "title": section["title"],
        "level": section["level"],
        "content": section["content"],
        "source_json": str(file_path),
        "source_txt": str(file_path.with_suffix(".txt")),
        "parent_titles": parent_titles,
        "hierarchy_level": len(parent_titles)
    }
    
    # Generate embedding with BGE prefix
    embedding = deepinfra_client.embeddings.create(
        model="BAAI/bge-base-en-v1.5",
        input=f"passage: {section['content']}",  # BGE recommendation
        encoding_format="float"
    ).data[0].embedding

    return models.PointStruct(
        id=content_id,
        vector=embedding,
        payload=payload
    )

def process_directory(directory: str, vs_manager: VectorStoreManager):
    processed_files = set()
    
    for json_path in Path(directory).glob("**/*.json"):
        str_path = str(json_path)
        processed_files.add(str_path)
        
        if not vs_manager.has_file_changed(json_path):
            continue

        try:
            # Delete existing vectors for this file
            vs_manager.qdrant_client.delete(
                collection_name=COLLECTION_NAME,
                points_selector=models.FilterSelector(
                    filter=models.Filter(
                        must=[models.FieldCondition(
                            key="source_json",
                            match=models.MatchValue(value=str_path)
                        )]
                    )
                )
            )

            # Process new content
            with open(json_path) as f:
                chapter = json.load(f)
            
            points = []
            stack = [(chapter, [chapter["title"]])]
            while stack:
                section, hierarchy = stack.pop()
                points.append(process_section(section, hierarchy, json_path))
                stack.extend((sub, hierarchy + [sub["title"]]) 
                           for sub in section.get("sections", []))
                
                if len(points) >= BATCH_SIZE:
                    vs_manager.qdrant_client.upsert(
                        collection_name=COLLECTION_NAME,
                        points=points
                    )
                    points = []
            
            if points:
                vs_manager.qdrant_client.upsert(
                    collection_name=COLLECTION_NAME,
                    points=points
                )

            # Update metadata after successful processing
            vs_manager.file_metadata[str_path] = vs_manager.get_file_state(json_path)
            
        except Exception as e:
            print(f"Error processing {json_path}: {e}")
            continue
            
        finally:
            vs_manager._save_metadata()
    
    # Cleanup deleted files from metadata
    for existing_path in list(vs_manager.file_metadata.keys()):
        if existing_path not in processed_files:
            del vs_manager.file_metadata[existing_path]
    vs_manager._save_metadata()

def create_collection(vs_manager: VectorStoreManager):
    try:
        # Try to get the collection - this will raise an exception if it doesn't exist
        vs_manager.qdrant_client.get_collection(COLLECTION_NAME)
        print(f"Collection {COLLECTION_NAME} already exists")
    except Exception:
        # Collection doesn't exist, create it
        print(f"Creating collection {COLLECTION_NAME}")
        vs_manager.qdrant_client.create_collection(
            collection_name=COLLECTION_NAME,
            vectors_config=models.VectorParams(
                size=768,
                distance=models.Distance.COSINE,
            )
        )

if __name__ == "__main__":
    try:
        vs_manager = VectorStoreManager()
        create_collection(vs_manager)
        
        # Get input directory from command line args, stdin, or user input
        input_dir = None
        
        # Check if directory is provided as command line argument
        if len(sys.argv) > 1:
            input_dir = sys.argv[1]
        else:
            # Check if there's input from stdin (non-interactive)
            import select
            if select.select([sys.stdin,],[],[],0.0)[0]:
                input_dir = sys.stdin.readline().strip()
        
        # If no input yet, ask user
        if not input_dir:
            input_dir = input("Enter directory path to process: ").strip()
        
        print(f"Processing directory: {input_dir}")
        process_directory(input_dir, vs_manager)
    finally:
        # Ensure the Qdrant client is properly closed, even if an exception occurs
        if 'vs_manager' in locals():
            vs_manager.close()
            print("Qdrant client closed successfully.")