#!/usr/bin/env python3
"""
Script to fix image payload structure in Qdrant collections
"""

from qdrant_client import QdrantClient
from qdrant_client.http import models
import os
from PIL import Image

def fix_image_payloads():
    """Fix the payload structure for image points in both collections"""
    
    client = QdrantClient(url="http://localhost:6333")
    
    print("🔧 Fixing image payload structure...")
    
    # 1. Fix CLIP collection payloads
    print("\n=== Fixing CLIP Collection ===")
    try:
        clip_points = client.scroll(
            collection_name="Agentic_RAGv2_CLIP",
            limit=100,
            with_payload=True,
            with_vectors=False
        )
        
        for point in clip_points[0]:
            if point.payload and point.payload.get('file_type') in ['png', 'jpg', 'jpeg', 'bmp', 'tiff']:
                # Add missing fields to CLIP payload
                updated_payload = point.payload.copy()
                
                # Add source field (what check_collections.py expects)
                if 'source' not in updated_payload:
                    updated_payload['source'] = updated_payload.get('file_name', 'Unknown')
                
                # Add image-specific metadata
                if 'image_metadata' not in updated_payload:
                    updated_payload['image_metadata'] = {
                        'type': 'clip_embedding',
                        'dimensions': '512',  # CLIP embedding dimension
                        'content_type': 'visual_embedding'
                    }
                
                # Add descriptive text
                if updated_payload.get('text') == '[CLIP image embedding]':
                    updated_payload['text'] = f"Visual embedding for image: {updated_payload.get('file_name', 'Unknown')}"
                
                # Update the point
                client.set_payload(
                    collection_name="Agentic_RAGv2_CLIP",
                    payload=updated_payload,
                    points=[point.id]
                )
                print(f"✅ Fixed CLIP point {point.id}: {updated_payload.get('file_name')}")
                
    except Exception as e:
        print(f"Error fixing CLIP collection: {e}")
    
    # 2. Fix OCR collection payloads for images
    print("\n=== Fixing OCR Collection (Image Points) ===")
    try:
        ocr_points = client.scroll(
            collection_name="Agentic_RAGv2",
            limit=100,
            with_payload=True,
            with_vectors=False
        )
        
        for point in ocr_points[0]:
            if point.payload and point.payload.get('file_type') in ['png', 'jpg', 'jpeg', 'bmp', 'tiff']:
                # Add missing fields to OCR payload
                updated_payload = point.payload.copy()
                
                # Add source field if missing
                if 'source' not in updated_payload:
                    updated_payload['source'] = updated_payload.get('file_name', 'Unknown')
                
                # Add image-specific metadata
                if 'image_metadata' not in updated_payload:
                    updated_payload['image_metadata'] = {
                        'type': 'ocr_text',
                        'content_type': 'extracted_text',
                        'has_visual_embedding': True  # Indicates there's a corresponding CLIP embedding
                    }
                
                # Update the point
                client.set_payload(
                    collection_name="Agentic_RAGv2",
                    payload=updated_payload,
                    points=[point.id]
                )
                print(f"✅ Fixed OCR point {point.id}: {updated_payload.get('file_name')}")
                
    except Exception as e:
        print(f"Error fixing OCR collection: {e}")
    
    print("\n✅ Image payload fixes completed!")

def verify_fixes():
    """Verify that the fixes worked"""
    
    client = QdrantClient(url="http://localhost:6333")
    
    print("\n🔍 Verifying fixes...")
    
    # Check CLIP collection
    print("\n=== CLIP Collection Verification ===")
    try:
        clip_points = client.scroll(
            collection_name="Agentic_RAGv2_CLIP",
            limit=3,
            with_payload=True,
            with_vectors=False
        )
        
        for i, point in enumerate(clip_points[0]):
            print(f"\n  CLIP Point {i+1} (ID: {point.id}):")
            if point.payload:
                print(f"    Source: {point.payload.get('source', 'Missing')}")
                print(f"    File: {point.payload.get('file_name', 'Missing')}")
                print(f"    Text: {point.payload.get('text', 'Missing')[:50]}...")
                print(f"    Image Metadata: {point.payload.get('image_metadata', 'Missing')}")
            else:
                print("    Payload: None")
                
    except Exception as e:
        print(f"Error verifying CLIP collection: {e}")
    
    # Check OCR collection for images
    print("\n=== OCR Collection Verification (Image Points) ===")
    try:
        ocr_points = client.scroll(
            collection_name="Agentic_RAGv2",
            limit=10,
            with_payload=True,
            with_vectors=False
        )
        
        image_points = [p for p in ocr_points[0] if p.payload and p.payload.get('file_type') in ['png', 'jpg', 'jpeg', 'bmp', 'tiff']]
        
        for i, point in enumerate(image_points[:3]):
            print(f"\n  OCR Image Point {i+1} (ID: {point.id}):")
            if point.payload:
                print(f"    Source: {point.payload.get('source', 'Missing')}")
                print(f"    File: {point.payload.get('file_name', 'Missing')}")
                print(f"    Text: {point.payload.get('text', 'Missing')[:50]}...")
                print(f"    Image Metadata: {point.payload.get('image_metadata', 'Missing')}")
            else:
                print("    Payload: None")
                
    except Exception as e:
        print(f"Error verifying OCR collection: {e}")

if __name__ == "__main__":
    fix_image_payloads()
    verify_fixes() 