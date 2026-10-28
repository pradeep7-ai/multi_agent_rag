#!/usr/bin/env python3
"""
Re-ingest test images with enhanced CLIP payloads
"""

import os
from Ingestion.ingest_v2 import ingest_folder
from qdrant_client import QdrantClient
from qdrant_client.http import models

def reingest_test_images():
    """Re-ingest test images with enhanced CLIP payloads"""
    
    print("🔄 Re-ingesting test images with enhanced CLIP payloads")
    print("=" * 60)
    
    # First, let's clear the existing CLIP collection
    print("\n1. Clearing existing CLIP collection...")
    try:
        client = QdrantClient(url="http://localhost:6333")
        
        # Delete existing CLIP collection
        try:
            client.delete_collection("Agentic_RAGv2_CLIP")
            print("   ✅ Deleted existing CLIP collection")
        except:
            print("   ⚠️  CLIP collection didn't exist or couldn't be deleted")
        
        # Recreate CLIP collection
        client.create_collection(
            collection_name="Agentic_RAGv2_CLIP",
            vectors_config=models.VectorParams(size=512, distance=models.Distance.COSINE)
        )
        print("   ✅ Recreated CLIP collection")
        
    except Exception as e:
        print(f"   ❌ Failed to clear CLIP collection: {e}")
        return
    
    # Find test images
    print("\n2. Finding test images...")
    test_images = []
    pdf_dir = "rag_frontend/pdf"
    
    for root, dirs, files in os.walk(pdf_dir):
        for file in files:
            if file.lower().endswith(('.png', '.jpg', '.jpeg')):
                test_images.append(os.path.join(root, file))
                if len(test_images) >= 3:  # Just test 3 images
                    break
        if len(test_images) >= 3:
            break
    
    if not test_images:
        print("   ❌ No test images found")
        return
    
    print(f"   📸 Found {len(test_images)} test images:")
    for img in test_images:
        print(f"      - {os.path.basename(img)}")
    
    # Create a temporary directory for test images
    print("\n3. Creating temporary test directory...")
    import tempfile
    import shutil
    
    with tempfile.TemporaryDirectory() as temp_dir:
        # Copy test images to temp directory
        for img_path in test_images:
            dest_path = os.path.join(temp_dir, os.path.basename(img_path))
            shutil.copy2(img_path, dest_path)
            print(f"   📋 Copied {os.path.basename(img_path)} to temp directory")
        
        # Re-ingest the images
        print("\n4. Re-ingesting images with enhanced CLIP payloads...")
        try:
            ingest_folder(temp_dir, collection_name="Agentic_RAGv2", embedding_dim=1536, batch_size=100)
            print("   ✅ Successfully re-ingested images")
        except Exception as e:
            print(f"   ❌ Failed to re-ingest images: {e}")
            return
    
    # Verify the enhanced payloads
    print("\n5. Verifying enhanced CLIP payloads...")
    try:
        sample_points = client.scroll(
            collection_name="Agentic_RAGv2_CLIP",
            limit=5,
            with_payload=True,
            with_vectors=False
        )
        
        print(f"   📊 Found {len(sample_points[0])} CLIP points")
        for i, point in enumerate(sample_points[0]):
            print(f"   Point {i+1}:")
            print(f"      File: {point.payload.get('file_name', 'Unknown')}")
            print(f"      Text: {point.payload.get('text', 'No text')[:100]}...")
            print(f"      Has OCR: {point.payload.get('has_ocr', False)}")
            print(f"      Content type: {point.payload.get('content_type', 'Unknown')}")
            print(f"      OCR text: {point.payload.get('ocr_text', 'No OCR')[:50]}...")
            
    except Exception as e:
        print(f"   ❌ Failed to verify payloads: {e}")

if __name__ == "__main__":
    reingest_test_images() 