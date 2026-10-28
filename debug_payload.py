#!/usr/bin/env python3
"""
Script to debug payload structure in Qdrant collections
"""

from qdrant_client import QdrantClient
from qdrant_client.http import models
import json

def debug_collections():
    """Debug the payload structure in both collections"""
    
    client = QdrantClient(url="http://localhost:6333")
    
    # Check OCR collection
    print("=== OCR Collection (Agentic_RAGv2) ===")
    try:
        ocr_info = client.get_collection("Agentic_RAGv2")
        print(f"Points count: {ocr_info.points_count}")
        print(f"Vector size: {ocr_info.config.params.vectors.size}")
        
        # Get sample points with full payload
        ocr_points = client.scroll(
            collection_name="Agentic_RAGv2",
            limit=3,
            with_payload=True,
            with_vectors=False
        )
        print(f"Sample points: {len(ocr_points[0])}")
        for i, point in enumerate(ocr_points[0]):
            print(f"\n  Point {i+1} (ID: {point.id}):")
            print(f"    Payload keys: {list(point.payload.keys()) if point.payload else 'None'}")
            if point.payload:
                for key, value in point.payload.items():
                    if key == 'text':
                        # Truncate text for readability
                        text_preview = str(value)[:100] + "..." if len(str(value)) > 100 else str(value)
                        print(f"    {key}: {text_preview}")
                    else:
                        print(f"    {key}: {value}")
            else:
                print("    Payload: None or empty")
            
    except Exception as e:
        print(f"Error with OCR collection: {e}")
    
    print("\n" + "="*50)
    print("=== CLIP Collection (Agentic_RAGv2_CLIP) ===")
    try:
        clip_info = client.get_collection("Agentic_RAGv2_CLIP")
        print(f"Points count: {clip_info.points_count}")
        print(f"Vector size: {clip_info.config.params.vectors.size}")
        
        # Get sample points with full payload
        clip_points = client.scroll(
            collection_name="Agentic_RAGv2_CLIP",
            limit=3,
            with_payload=True,
            with_vectors=False
        )
        print(f"Sample points: {len(clip_points[0])}")
        for i, point in enumerate(clip_points[0]):
            print(f"\n  Point {i+1} (ID: {point.id}):")
            print(f"    Payload keys: {list(point.payload.keys()) if point.payload else 'None'}")
            if point.payload:
                for key, value in point.payload.items():
                    print(f"    {key}: {value}")
            else:
                print("    Payload: None or empty")
            
    except Exception as e:
        print(f"Error with CLIP collection: {e}")

if __name__ == "__main__":
    debug_collections() 