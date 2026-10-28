#!/usr/bin/env python3
"""
Script to re-ingest documents with fixed page number preservation.
"""

import os
from qdrant_client import QdrantClient
from qdrant_client.http import models
from tools.ingest_v2 import ingest_folder

def clear_collection(collection_name="Agentic_RAGv2"):
    """Clear the existing collection to re-ingest with fixed page numbers."""
    client = QdrantClient(url="http://localhost:6333")
    
    try:
        # Delete the existing collection
        client.delete_collection(collection_name=collection_name)
        print(f"✅ Deleted existing collection: {collection_name}")
    except Exception as e:
        print(f"⚠️ Could not delete collection (might not exist): {e}")
    
    return client

def reingest_documents():
    """Re-ingest documents with fixed page number preservation."""
    print("🔄 Re-ingesting documents with page number preservation...")
    
    # Clear existing collection
    client = clear_collection()
    
    # Re-ingest documents
    folder_path = r"B:\lama_parse_and_ingest\lama_parse_and_ingest\pdf"  # Update this path to your PDF folder
    collection_name = "Agentic_RAGv2"
    
    print(f"📁 Ingesting from: {folder_path}")
    print(f"🗂️ Collection name: {collection_name}")
    
    try:
        ingest_folder(folder_path, collection_name)
        print("✅ Document re-ingestion completed successfully!")
        print("🔍 Page numbers should now be preserved in chunk sources.")
    except Exception as e:
        print(f"❌ Error during re-ingestion: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    reingest_documents() 