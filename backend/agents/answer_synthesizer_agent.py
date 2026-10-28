# agents/answer_synthesizer_agent.py
import os
import openai

client = openai.OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

class AnswerSynthesizerAgent:
    def summarize(self, original_query: str, sub_questions: list[str], answers: list[str]) -> str:
        # Check if all answers are insufficient context responses
        insufficient_indicators = ["don't have enough relevant context", "insufficient context", "No relevant information found"]
        all_insufficient = all(
            any(indicator in answer.lower() for indicator in insufficient_indicators)
            for answer in answers
        )
        
        if all_insufficient:
            return f"I apologize, but I don't have enough relevant context in the available documents to provide a comprehensive answer to your query: '{original_query}'. The information you're looking for appears to be outside the scope of the documents I have access to. Please try rephrasing your question or ask about a different topic that might be covered in the available materials."
        
        # Check if some answers are insufficient
        insufficient_count = sum(
            1 for answer in answers 
            if any(indicator in answer.lower() for indicator in insufficient_indicators)
        )
        
        if insufficient_count > 0:
            system_prompt = (
                "You are an expert summarizer. You will receive an original complex query, "
                "a set of sub-questions and their answers. Some answers may indicate insufficient context. "
                "Your job is to synthesize the available information into a final answer, clearly indicating "
                "which parts of the query could be answered and which parts lack sufficient context. "
                "Be honest about limitations while providing what information is available."
            )
        else:
            system_prompt = (
                "You are an expert summarizer. You will receive an original complex query, "
                "a set of sub-questions and their answers. Your job is to synthesize these into a final, well-structured, "
                "concise answer that addresses the original query clearly. Use inline references if present in the answers."
            )

        sub_answer_block = "\n\n".join(
            f"Q{sub+1}: {q}\nA{sub+1}: {a}" for sub, (q, a) in enumerate(zip(sub_questions, answers))
        )

        user_prompt = f"Original query:\n{original_query}\n\nSub-answers:\n{sub_answer_block}\n\nSynthesize a complete final answer:"

        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            temperature=0.5,
            max_tokens=800
        )

        result = response.choices[0].message.content
        return result if result else "Unable to synthesize answer from available information."
