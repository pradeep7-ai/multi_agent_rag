# agents/query_rephrase_agent.py
import os
import openai

client = openai.OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

class QueryRephraseAgent:
    def rephrase(self, query: str, context_hint: str = "") -> str:
        prompt = f"""
        You are a helpful assistant. A user asked the following unclear question.
        Rephrase it into a more specific and detailed query.

        Original Question: {query}

        Context Hint: {context_hint}

        Rephrased Question:
        """

        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are a query refinement assistant."},
                {"role": "user", "content": prompt.strip()}
            ],
            temperature=0.3,
            max_tokens=100
        )

        return response.choices[0].message.content.strip()
