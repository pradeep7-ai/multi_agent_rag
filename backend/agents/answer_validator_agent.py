import os
import openai

client = openai.OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

class AnswerValidatorAgent:
    def validate(self, answer: str, context_chunks: list, query: str) -> bool:
        # Handle None or empty answers
        if answer is None or (isinstance(answer, str) and answer.strip() == ""):
            return False
            
        # Check if answer indicates insufficient context
        insufficient_indicators = ["don't have enough relevant context", "insufficient context", "No relevant information found"]
        if any(indicator in answer.lower() for indicator in insufficient_indicators):
            return True  # These are valid responses for insufficient context
            
        if not context_chunks:
            return False
            
        context_text = "\n".join([f"Chunk: {chunk}" for chunk, _ in context_chunks])

        prompt = f"""
        Given the following user query and an answer, determine if the answer is accurate and supported
        by the provided document context. Return only 'YES' or 'NO'.

        Query: {query}
        Answer: {answer}

        Context:
        {context_text}

        Is the answer valid and contextually supported?
        """

        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are a fact-checking assistant."},
                {"role": "user", "content": prompt.strip()}
            ],
            temperature=0,
            max_tokens=10
        )

        content = response.choices[0].message.content
        if content is None:
            return False
            
        reply = content.strip().upper()
        return "YES" in reply
