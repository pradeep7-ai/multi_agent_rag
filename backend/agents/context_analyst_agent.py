# agents/context_analyst_agent.py
import os
import openai
import json
import tiktoken

client = openai.OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

class ContextAnalystAgent:
    def __init__(self):
        self.tokens_used = 0
        self.encoding = tiktoken.get_encoding("cl100k_base")

    def rewrite(self, sub_question: str, context: str) -> str:
        system_prompt = (
            "You are a helpful assistant that improves the clarity of sub-questions.\n"
            "Given a sub-question and the original user query as context, rewrite the sub-question to be clearer and more self-contained.\n"
            "Return only the rewritten question as plain text."
        )

        user_prompt = (
            f"Original user query:\n{context}\n\n"
            f"Sub-question to rewrite:\n{sub_question}\n\n"
            f"Rewrite the sub-question clearly. Don't include any explanation."
        )

        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            temperature=0.3,
            max_tokens=100
        )

        result = response.choices[0].message.content.strip()
        self.tokens_used += len(self.encoding.encode(result))
        return result
