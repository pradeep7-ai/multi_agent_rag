#!/usr/bin/env python3
"""
Script to debug source fields in OCR collection
"""

from qdrant_client import QdrantClient
from qdrant_client.http import models

def debug_ocr_sources():
    """Debug the source fields in OCR collection"""
    
    client = QdrantClient(url="http://localhost:6333")
    
    print("=== OCR Collection Source Field Debug ===")
    try:
        ocr_points = client.scroll(
            collection_name="Agentic_RAGv2",
            limit=10,
            with_payload=True,
            with_vectors=False
        )
        
        print(f"Sample points: {len(ocr_points[0])}")
        for i, point in enumerate(ocr_points[0]):
            print(f"\n  Point {i+1} (ID: {point.id}):")
            if point.payload:
                # Check for source field
                source = point.payload.get('source', 'MISSING')
                file_name = point.payload.get('file_name', 'MISSING')
                file_type = point.payload.get('file_type', 'MISSING')
                
                print(f"    Source field: {source}")
                print(f"    File name: {file_name}")
                print(f"    File type: {file_type}")
                
                # Show all available fields
                print(f"    All fields: {list(point.payload.keys())}")
            else:
                print("    Payload: None")
                
    except Exception as e:
        print(f"Error with OCR collection: {e}")

if __name__ == "__main__":
    debug_ocr_sources() 