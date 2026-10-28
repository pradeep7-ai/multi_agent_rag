from crewai import Agent, Task, Crew
from agents.query_analyzer_agent import QueryAnalyzerAgent
from agents.query_splitter_agent import QuerySplitterAgent
from agents.context_analyst_agent import ContextAnalystAgent
from agents.query_rephrase_agent import QueryRephraseAgent
from agents.answer_validator_agent import AnswerValidatorAgent
from agents.answer_synthesizer_agent import AnswerSynthesizerAgent
from agents.context_validator_agent import ContextValidatorAgent
from tools.embedder import embed_query
from tools.retriever import Retriever
from tools.new_llamaparse import extract_keywords
from Ingestion.clip_embedder import embed_text_clip
from llm import generate_response

retriever = Retriever()

# CrewAI agent wrappers
class AnalyzerAgent(Agent):
    def run(self, query):
        analyzer = QueryAnalyzerAgent()
        return analyzer.is_query_clear(query)

class SplitterAgent(Agent):
    def run(self, query):
        splitter = QuerySplitterAgent()
        return splitter.split(query)

class RewriterAgent(Agent):
    def run(self, sub_q, context):
        analyst = ContextAnalystAgent()
        return analyst.rewrite(sub_q, context=context)

class RetrieverAgent(Agent):
    def run(self, query, top_k=5):
        query_emb = embed_query(query)
        semantic_results = retriever.search(query_emb, top_k=top_k, search_both_collections=False)
        return semantic_results

class ValidatorAgent(Agent):
    def run(self, query, chunks, scores):
        context_validator = ContextValidatorAgent()
        return context_validator.validate_context(query, chunks, scores)

class SynthesizerAgent(Agent):
    def run(self, query, sub_questions, sub_answers):
        synthesizer = AnswerSynthesizerAgent()
        return synthesizer.summarize(query, sub_questions, sub_answers)

# Orchestrator function
def orchestrate_agentic_pipeline(query, top_k=3):
    # 1. Analyze query
    analyzer_task = Task(
        agent=AnalyzerAgent(name="Analyzer", description="Checks query clarity"),
        input={"query": query},
        description="Analyze query clarity"
    )
    # 2. Split query
    splitter_task = Task(
        agent=SplitterAgent(name="Splitter", description="Splits query into sub-questions"),
        input={"query": query},
        description="Split query"
    )
    # 3. Rewrite sub-questions
    rewriter_task = Task(
        agent=RewriterAgent(name="Rewriter", description="Rewrite sub-question for context"),
        input={"sub_q": splitter_task, "context": query},
        description="Rewrite sub-question"
    )
    # 4. Retrieve chunks
    retriever_task = Task(
        agent=RetrieverAgent(name="Retriever", description="Retrieve relevant chunks"),
        input={"query": rewriter_task, "top_k": top_k},
        description="Retrieve chunks"
    )
    # 5. Validate context
    validator_task = Task(
        agent=ValidatorAgent(name="Validator", description="Validate context sufficiency"),
        input={"query": rewriter_task, "chunks": retriever_task, "scores": []},
        description="Validate context"
    )
    # 6. Synthesize answer
    synthesizer_task = Task(
        agent=SynthesizerAgent(name="Synthesizer", description="Synthesize final answer"),
        input={"query": query, "sub_questions": splitter_task, "sub_answers": [retriever_task]},
        description="Synthesize answer"
    )

    crew = Crew(tasks=[
        analyzer_task,
        splitter_task,
        rewriter_task,
        retriever_task,
        validator_task,
        synthesizer_task
    ])
    result = crew.run()
    return result["Synthesizer"]