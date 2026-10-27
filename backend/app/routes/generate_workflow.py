from fastapi import APIRouter,HTTPException



from app.schemas.workflow_schema import Workflow_reqeust
from app.services.workflow import generate_workflow



router=APIRouter()


@router.post("/generate-workflow")
async def create_workflow(request: Workflow_reqeust):
    try:
        return await generate_workflow(request.prompt)
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail="Failed to generate workflow"
        )