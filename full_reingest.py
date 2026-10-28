#!/usr/bin/env python3
"""
Full re-ingestion: delete all data and re-ingest with 1536-dim CLIP
"""

from qdrant_client import QdrantClient
from qdrant_client.http import models
from Ingestion.ingest_v2 import ingest_folder
import os

OCR_COLLECTION = "Agentic_RAGv2"
CLIP_COLLECTION = "Agentic_RAGv2_CLIP"
OCR_DIM = 1536
CLIP_DIM = 1536

# Directory containing all your documents/images
DATA_DIR = "rag_frontend/pdf"


def main():
    print("\n🚨 Deleting existing Qdrant collections...")
    client = QdrantClient(url="http://localhost:6333")
    for col in [OCR_COLLECTION, CLIP_COLLECTION]:
        try:
            client.delete_collection(col)
            print(f"   ✅ Deleted collection: {col}")
        except Exception as e:
            print(f"   ⚠️  Could not delete {col}: {e}")

    print("\n🆕 Recreating collections with correct dimensions...")
    client.create_collection(
        collection_name=OCR_COLLECTION,
        vectors_config=models.VectorParams(size=OCR_DIM, distance=models.Distance.COSINE)
    )
    print(f"   ✅ Created {OCR_COLLECTION} with {OCR_DIM} dimensions")
    client.create_collection(
        collection_name=CLIP_COLLECTION,
        vectors_config=models.VectorParams(size=CLIP_DIM, distance=models.Distance.COSINE)
    )
    print(f"   ✅ Created {CLIP_COLLECTION} with {CLIP_DIM} dimensions")

    print(f"\n📥 Re-ingesting all files from: {DATA_DIR}")
    ingest_folder(DATA_DIR, collection_name=OCR_COLLECTION, embedding_dim=OCR_DIM, batch_size=100)
    print("\n🎉 Re-ingestion complete!")

if __name__ == "__main__":
    main() 