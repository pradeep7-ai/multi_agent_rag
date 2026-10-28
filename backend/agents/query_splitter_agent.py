# agents/query_splitter_agent.py
import os
import json
import openai

client = openai.OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

class QuerySplitterAgent:
    def split(self, query: str) -> list[str]:
        system_prompt = (
            "You are a helpful assistant that breaks down complex or multi-entity questions "
            "into multiple simple sub-questions. If a query contains multiple parts joined by 'and', 'or', or commas, "
            "split them appropriately. Return the result as a JSON list of strings only.\n\n"
            "Examples:\n"
            "Query: What are the financials of Apple and Microsoft?\n"
            "Output: [\"What are the financials of Apple?\", \"What are the financials of Microsoft?\"]\n\n"
            "Query: What is the mission and vision of Tesla?\n"
            "Output: [\"What is the mission of Tesla?\", \"What is the vision of Tesla?\"]"
        )

        user_prompt = f"Split the following query into simpler sub-questions:\n\n{query}\n\nReturn only a JSON list."

        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            temperature=0.3,
            max_tokens=300
        )

        raw = response.choices[0].message.content
        try:
            sub_questions = json.loads(raw)
            assert isinstance(sub_questions, list)
            return sub_questions
        except:
            return [query]  # fallback if parsing fails
