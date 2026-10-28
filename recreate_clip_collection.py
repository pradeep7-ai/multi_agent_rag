#!/usr/bin/env python3
"""
Recreate CLIP collection with 1536 dimensions
"""

from qdrant_client import QdrantClient
from qdrant_client.http import models
from Ingestion.clip_embedder import embed_image_clip, get_clip_dimension
import os

def recreate_clip_collection():
    """Recreate CLIP collection with 1536 dimensions"""
    
    print("🔄 Recreating CLIP Collection with 1536 Dimensions")
    print("=" * 60)
    
    # Check CLIP dimension
    print("\n1. Verifying CLIP dimension...")
    clip_dim = get_clip_dimension()
    print(f"   ✅ CLIP dimension: {clip_dim}")
    
    if clip_dim != 1536:
        print("   ❌ CLIP not configured for 1536 dimensions")
        return
    
    # Connect to Qdrant
    print("\n2. Connecting to Qdrant...")
    try:
        client = QdrantClient(url="http://localhost:6333")
        print("   ✅ Connected to Qdrant")
    except Exception as e:
        print(f"   ❌ Failed to connect to Qdrant: {e}")
        return
    
    # Delete existing CLIP collection
    print("\n3. Deleting existing CLIP collection...")
    try:
        client.delete_collection("Agentic_RAGv2_CLIP")
        print("   ✅ Deleted existing CLIP collection")
    except Exception as e:
        print(f"   ⚠️  Could not delete CLIP collection: {e}")
    
    # Create new CLIP collection with 1536 dimensions
    print("\n4. Creating new CLIP collection with 1536 dimensions...")
    try:
        client.create_collection(
            collection_name="Agentic_RAGv2_CLIP",
            vectors_config=models.VectorParams(size=1536, distance=models.Distance.COSINE)
        )
        print("   ✅ Created new CLIP collection with 1536 dimensions")
    except Exception as e:
        print(f"   ❌ Failed to create CLIP collection: {e}")
        return
    
    # Verify the collection
    print("\n5. Verifying new CLIP collection...")
    try:
        clip_info = client.get_collection("Agentic_RAGv2_CLIP")
        print(f"   ✅ CLIP collection created successfully")
        print(f"   📊 Points: {clip_info.points_count}")
        print(f"   📏 Vector size: {clip_info.config.params.vectors.size}")
        
        if clip_info.config.params.vectors.size == 1536:
            print("   🎉 CLIP collection has correct 1536 dimensions!")
        else:
            print(f"   ⚠️  Expected 1536, got {clip_info.config.params.vectors.size}")
            
    except Exception as e:
        print(f"   ❌ Failed to verify collection: {e}")
        return
    
    # Test with a sample image
    print("\n6. Testing with sample image...")
    try:
        # Find a test image
        test_images = []
        pdf_dir = "rag_frontend/pdf"
        
        for root, dirs, files in os.walk(pdf_dir):
            for file in files:
                if file.lower().endswith(('.png', '.jpg', '.jpeg')):
                    test_images.append(os.path.join(root, file))
                    if len(test_images) >= 1:
                        break
            if len(test_images) >= 1:
                break
        
        if test_images:
            img_path = test_images[0]
            print(f"   📸 Testing with: {os.path.basename(img_path)}")
            
            # Generate 1536-dim embedding
            img_emb = embed_image_clip(img_path)
            print(f"   ✅ Generated 1536-dim embedding")
            
            # Add to collection
            point = models.PointStruct(
                id=1,
                vector=img_emb,
                payload={
                    "text": f"Test image: {os.path.basename(img_path)}",
                    "file_name": os.path.basename(img_path),
                    "vector_type": "clip",
                    "content_type": "image"
                }
            )
            
            client.upsert(collection_name="Agentic_RAGv2_CLIP", points=[point])
            print(f"   ✅ Added test point to CLIP collection")
            
            # Verify the point was added
            clip_info = client.get_collection("Agentic_RAGv2_CLIP")
            print(f"   📊 Points in collection: {clip_info.points_count}")
            
        else:
            print("   ⚠️  No test images found")
            
    except Exception as e:
        print(f"   ❌ Test failed: {e}")
        return
    
    print("\n🎉 CLIP collection successfully recreated with 1536 dimensions!")
    print("   You can now re-ingest your documents to populate the collection.")

if __name__ == "__main__":
    recreate_clip_collection() 