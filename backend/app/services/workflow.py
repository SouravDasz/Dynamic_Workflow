from app.utils.prompt import prompt_template
from app.schemas.workflow_schema import WorkflowResponse
from app.services.llm import structured_llm


chain = prompt_template | structured_llm


async def generate_workflow(user_prompt: str):
    result = await chain.ainvoke({
        "user_prompt": user_prompt
    })

    return result.model_dump(by_alias=True)


