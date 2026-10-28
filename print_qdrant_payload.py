from tools.retriever import Retriever
import json

r = Retriever()
scroll = r.client.scroll(collection_name=r.collection_name, limit=1, with_payload=True)
with open('first_chunk_payload.txt', 'w', encoding='utf-8') as f:
    for point in scroll[0]:
        json.dump(point.payload, f, indent=2, ensure_ascii=False)
        f.write('\n')
        print('Payload written to first_chunk_payload.txt') 