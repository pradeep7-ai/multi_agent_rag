#!/usr/bin/env python3
"""
Simple test for image-related queries
"""

from rag_toolkit import answer_query

def test_simple_image_queries():
    """Test a few simple image-related queries"""
    
    queries = [
        "What images are in the documents?",
        "What is in sample.png?",
        "What does safety report.png show?"
    ]
    
    for i, query in enumerate(queries, 1):
        print(f"\n🔍 Test {i}: {query}")
        print("-" * 50)
        
        try:
            chunks, mode, answer = answer_query(query, top_k=3)
            
            print(f"Mode: {mode}")
            print(f"Chunks: {len(chunks)}")
            print(f"Answer: {answer}")
            
            if chunks:
                print("Sources:")
                for chunk, source in chunks:
                    print(f"  - {source}")
            
        except Exception as e:
            print(f"Error: {e}")
        
        print("=" * 50)

if __name__ == "__main__":
    test_simple_image_queries() 