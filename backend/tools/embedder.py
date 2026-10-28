import os
import openai
client = openai.OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def embed_chunks(chunk):
    response = client.embeddings.create(
        model="text-embedding-3-small",
        input=chunk
    )
    return response.data[0].embedding

def embed_query(query):
    response = client.embeddings.create(
        model="text-embedding-3-small",
        input=query
    )
    return response.data[0].embedding
