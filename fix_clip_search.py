#!/usr/bin/env python3
"""
Fix the CLIP search logic in rag_toolkit.py
"""

def fix_clip_search():
    """Fix the CLIP search logic to properly handle different collection dimensions"""
    
    # Read the current rag_toolkit.py
    with open('rag_toolkit.py', 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Find the problematic CLIP search section
    old_code = '''    # Also try CLIP search for image-related queries
    try:
        clip_query_emb = embed_text_clip(query)
        clip_results = retriever.search(clip_query_emb, top_k=top_k, search_both_collections=False)
        clip_confident_chunks = [(chunk, src) for chunk, src, score, vector_type in clip_results if score >= CONFIDENCE_THRESHOLD]
        clip_retrieval_scores = [score for _, _, score, _ in clip_results]
        
        # Combine results from both searches
        all_confident_chunks = confident_chunks + clip_confident_chunks
        all_retrieval_scores = retrieval_scores + clip_retrieval_scores
        
        # Remove duplicates while preserving order
        seen = set()
        unique_chunks = []
        unique_scores = []
        for i, (chunk, src) in enumerate(all_confident_chunks):
            if (chunk, src) not in seen:
                seen.add((chunk, src))
                unique_chunks.append((chunk, src))
                if i < len(all_retrieval_scores):
                    unique_scores.append(all_retrieval_scores[i])
        
        confident_chunks = unique_chunks
        retrieval_scores = unique_scores
        
    except Exception as e:
        print(f"CLIP search failed: {e}")
        # Continue with only OCR results'''
    
    new_code = '''    # Also try CLIP search for image-related queries
    try:
        clip_query_emb = embed_text_clip(query)
        # Search CLIP collection specifically (512-dim vectors)
        clip_results = retriever.search_single_collection(clip_query_emb, top_k=top_k, filters=None, collection_name="Agentic_RAGv2_CLIP")
        clip_confident_chunks = [(chunk, src) for chunk, src, score, vector_type in clip_results if score >= CONFIDENCE_THRESHOLD]
        clip_retrieval_scores = [score for _, _, score, _ in clip_results]
        
        # Combine results from both searches
        all_confident_chunks = confident_chunks + clip_confident_chunks
        all_retrieval_scores = retrieval_scores + clip_retrieval_scores
        
        # Remove duplicates while preserving order
        seen = set()
        unique_chunks = []
        unique_scores = []
        for i, (chunk, src) in enumerate(all_confident_chunks):
            if (chunk, src) not in seen:
                seen.add((chunk, src))
                unique_chunks.append((chunk, src))
                if i < len(all_retrieval_scores):
                    unique_scores.append(all_retrieval_scores[i])
        
        confident_chunks = unique_chunks
        retrieval_scores = unique_scores
        
    except Exception as e:
        print(f"CLIP search failed: {e}")
        # Continue with only OCR results'''
    
    # Replace the old code with new code
    if old_code in content:
        content = content.replace(old_code, new_code)
        
        # Write the fixed content back
        with open('rag_toolkit.py', 'w', encoding='utf-8') as f:
            f.write(content)
        
        print("✅ Fixed CLIP search logic in rag_toolkit.py")
        print("   - Now searches CLIP collection specifically for 512-dim vectors")
        print("   - Avoids dimension mismatch errors")
    else:
        print("❌ Could not find the CLIP search code to fix")

if __name__ == "__main__":
    fix_clip_search() 