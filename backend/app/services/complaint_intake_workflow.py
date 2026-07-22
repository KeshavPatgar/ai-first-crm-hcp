import json
import re
from typing import TypedDict
from langchain_core.messages import HumanMessage
from langgraph.graph import StateGraph, END
from langchain_groq import ChatGroq
from app.core.config import settings

# State definition for the extraction pipeline
class IntakeState(TypedDict):
    raw_text: str
    current_form: dict
    reply: str

# Use the requested model (switched to llama-3.1-8b-instant as previous models were decommissioned)
llm = ChatGroq(temperature=0.0, model_name="llama-3.1-8b-instant", groq_api_key=settings.GROQ_API_KEY)

def parse_json_response(content: str) -> dict:
    match = re.search(r'```(?:json)?\s*(\{.*?\})\s*```', content, re.DOTALL)
    if match:
        try: return json.loads(match.group(1))
        except: pass
    match = re.search(r'\{.*\}', content, re.DOTALL)
    if match:
        try: return json.loads(match.group(0))
        except: pass
    return {}

def node_extract_details(state: IntakeState):
    raw_text = state["raw_text"]
    prompt = f"""
    Extract the following entities from the customer complaint text or email:
    - customer_name
    - organization
    - product_name
    - strength
    - batch_number
    - manufacturing_date
    - expiry_date
    - complaint_category
    - description
    - quantity
    - packaging
    - manufacturing_site
    
    Document text:
    {raw_text}
    
    Return ONLY a valid JSON object. Do not include markdown formatting or explanations.
    Ensure keys match the requested fields exactly.
    """
    response = llm.invoke([HumanMessage(content=prompt)])
    data = parse_json_response(response.content)
    
    updated_form = {**state.get("current_form", {}), **data}
    return {"current_form": updated_form}

def node_risk_assessment(state: IntakeState):
    current_form = state.get("current_form", {})
    prompt = f"""
    Based on the following complaint details:
    {json.dumps(current_form)}

    Generate an AI Risk Assessment:
    - severity (Minor, Major, Critical)
    - risk_summary (A brief 1 sentence summary of the risk)
    - suggested_action (What to do immediately)
    - confidence_score (Float between 0.0 and 1.0)
    
    Return ONLY a valid JSON object.
    """
    response = llm.invoke([HumanMessage(content=prompt)])
    data = parse_json_response(response.content)
    
    updated_form = {**current_form, **data}
    return {"current_form": updated_form}

def node_summary_capa(state: IntakeState):
    current_form = state["current_form"]
    prompt = f"""
    Based on the following complaint details:
    {json.dumps(current_form)}
    
    Suggest the following:
    - root_cause (3 likely root causes)
    - capa (Suggested Corrective and Preventive Actions)
    
    Return ONLY a valid JSON object with keys "root_cause" and "capa".
    """
    response = llm.invoke([HumanMessage(content=prompt)])
    try:
        data = json.loads(response.content.replace("```json", "").replace("```", "").strip())
    except:
        data = {}
    
    updated_form = {**current_form, **data}
    
    # Final reply message for the chat interface
    reply = "I have successfully extracted the complaint details, generated the risk assessment, and populated the form."
    return {"current_form": updated_form, "reply": reply}

# Build Pipeline Graph
intake_workflow = StateGraph(IntakeState)

intake_workflow.add_node("extract_details", node_extract_details)
intake_workflow.add_node("risk_assessment", node_risk_assessment)
intake_workflow.add_node("summary_capa", node_summary_capa)

intake_workflow.set_entry_point("extract_details")
intake_workflow.add_edge("extract_details", "risk_assessment")
intake_workflow.add_edge("risk_assessment", "summary_capa")
intake_workflow.add_edge("summary_capa", END)

intake_app = intake_workflow.compile()

def process_intake(text: str, current_form: dict):
    if not settings.GROQ_API_KEY or settings.GROQ_API_KEY == "":
        return {
            "reply": "API Key is missing.",
            "form_data": current_form
        }

    try:
        state = {
            "raw_text": text,
            "current_form": current_form
        }
        result = intake_app.invoke(state)
        return {
            "reply": result.get("reply", "Extraction complete."),
            "form_data": result.get("current_form", current_form)
        }
    except Exception as e:
        error_msg = str(e)
        if "model_decommissioned" in error_msg or "400" in error_msg:
            friendly_msg = "Oops! Our AI assistant is currently undergoing an upgrade and the model is temporarily unavailable. Please try again in a few moments."
        else:
            friendly_msg = "We encountered a temporary connection issue. Please try again later."
        return {
            "reply": friendly_msg,
            "form_data": current_form
        }
