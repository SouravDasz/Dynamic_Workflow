from pydantic import BaseModel,Field
from typing import Literal


class Workflow_reqeust(BaseModel):
    prompt:str=Field(
        min_length=5,
        description="Natural language description of the business process"
    )

class WorkflowStep(BaseModel):
    id: str
    name: str
    type: Literal[
        "input", "approval", "notification",
        "decision", "action", "end"
    ]
    order: int
    dependsOn: list[str] = Field(default_factory=list)
    next: list[str] = Field(default_factory=list)


class WorkflowResponse(BaseModel):
    title: str
    steps: list[WorkflowStep]