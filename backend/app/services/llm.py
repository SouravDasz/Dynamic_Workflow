import os
from pathlib import Path

from dotenv import load_dotenv
from langchain_groq import ChatGroq


from app.schemas.workflow_schema import WorkflowResponse

load_dotenv(Path(__file__).resolve().parents[2] / ".env")

llm = ChatGroq(
    groq_api_key=os.getenv("GROQ_API_KEY"),
    model="openai/gpt-oss-120b",
    temperature=0,
)


structured_llm = llm.with_structured_output(
    WorkflowResponse
)
