# agents/query_analyzer_agent.py
import os
import openai

client = openai.OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

class QueryAnalyzerAgent:
    def is_query_clear(self, query: str) -> bool:
        prompt = f"""
        You are a query classification assistant. Determine if the following user query is **clear and specific** or **vague and ambiguous**.

        Query: "{query}"

        Respond with only one word: "CLEAR" or "VAGUE".
        """

        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are a helpful assistant that classifies query clarity."},
                {"role": "user", "content": prompt.strip()}
            ],
            temperature=0,
            max_tokens=10
        )

        reply = response.choices[0].message.content.strip().upper()
        return "CLEAR" in reply
