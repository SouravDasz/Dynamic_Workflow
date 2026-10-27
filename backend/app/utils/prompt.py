from langchain_core.prompts import ChatPromptTemplate

prompt_template = ChatPromptTemplate.from_messages([
    (
        "system",
        """
        You are a business workflow designer.

        Convert the user's business process into a workflow.

        Rules:
        - Generate 4 to as many it required logical steps.
        - Use unique IDs such as step-1, step-2.
        - Assign sequential order starting at 1.
        - Use only these types:
          input, approval, notification, decision, action, end.
        - dependsOn lists prerequisite step IDs.
        - next lists the subsequent step IDs.
        - The first step has no dependencies.
        - The final step must have type end and next=[].
        - Ensure all referenced IDs exist.
        """
    ),
    ("human", "{user_prompt}")
])
