import json
from typing import TypedDict, Sequence
from langchain_core.messages import BaseMessage, HumanMessage
from langgraph.graph import StateGraph, END
from langchain_groq import ChatGroq
from app.core.config import settings

# State definition
class ComplaintAgentState(TypedDict):
    messages: Sequence[BaseMessage]
    current_form: dict
    intent: str
    reply: str

# LLM Setup
llm = ChatGroq(temperature=0.1, model_name="llama-3.1-8b-instant", groq_api_key=settings.GROQ_API_KEY)

# 1. Intent Detection
def detect_intent(state: ComplaintAgentState):
    user_message = state["messages"][-1].content
    if "clear" in user_message.lower() and len(user_message.strip()) < 30:
        return {"intent": "clear_complaint"}

    prompt = f"""
    Determine the intent of the following message from a quality assurance agent handling a complaint.
    Choose exactly one intent from this list:
    - log_complaint (extracting complaint details from text or a document)
    - edit_complaint (modifying or adding specific details to the complaint)
    - check_completeness (checking if any required fields are missing)
    - recommend_root_cause (suggesting root causes for the issue)
    - recommend_capa (suggesting Corrective and Preventive Actions)
    - summarize_complaint (generating a brief summary of the complaint)
    - clear_complaint (resetting or clearing the form)
    - duplicate_check (check for duplicate complaints)

    Message: {user_message}
    Output only the exact intent string, nothing else.
    """
    response = llm.invoke([HumanMessage(content=prompt)])
    intent = response.content.strip().lower()
    
    valid_intents = [
        "log_complaint", "edit_complaint", "check_completeness", 
        "recommend_root_cause", "recommend_capa", "summarize_complaint", 
        "clear_complaint", "duplicate_check", "generate_risk"
    ]
    for v_intent in valid_intents:
        if v_intent in intent:
            return {"intent": v_intent}
            
    return {"intent": "log_complaint"}

import re

def parse_json_response(content: str) -> dict:
    # Try finding markdown json block
    match = re.search(r'```(?:json)?\s*(\{.*?\})\s*```', content, re.DOTALL)
    if match:
        try:
            return json.loads(match.group(1))
        except:
            pass
    # Fallback to finding first { ... }
    match = re.search(r'\{.*\}', content, re.DOTALL)
    if match:
        try:
            return json.loads(match.group(0))
        except:
            pass
    return {}

# 2. Tool Execution functions
def tool_log_complaint(state: ComplaintAgentState):
    user_message = state["messages"][-1].content
    prompt = f"""
    Extract the following entities from the customer complaint message:
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
    
    Also, generate an AI Risk Assessment based on the severity of the issue:
    - severity (Minor, Major, Critical)
    - risk_summary (A brief 1 sentence summary of the risk)
    - suggested_action (What to do immediately)
    - confidence_score (Float between 0.0 and 1.0)

    Message: {user_message}
    
    Return ONLY a valid JSON object. Do not include markdown formatting or explanations.
    Ensure keys match the requested fields exactly.
    """
    response = llm.invoke([HumanMessage(content=prompt)])
    data = parse_json_response(response.content)
    
    updated_form = {**state.get("current_form", {}), **data}
    reply = "Complaint details extracted and logged successfully. AI Risk Assessment generated."
    return {"current_form": updated_form, "reply": reply}

def tool_edit_complaint(state: ComplaintAgentState):
    user_message = state["messages"][-1].content
    current_form = state.get("current_form", {})
    prompt = f"""
    The user wants to edit the current complaint form. 
    User message: {user_message}
    Current form keys: customer_name, organization, product_name, strength, batch_number, manufacturing_date, expiry_date, complaint_category, description, quantity, packaging, manufacturing_site, severity, risk_summary, suggested_action, confidence_score, root_cause, capa
    
    Identify which fields need to be updated and their new values based ONLY on the user's message.
    Return ONLY a valid JSON object with the fields to update. Do not change unmentioned fields.
    """
    response = llm.invoke([HumanMessage(content=prompt)])
    data = parse_json_response(response.content)
    
    updated_form = {**current_form, **data}
    reply = "I've updated the specific fields you mentioned. The rest of the form remains untouched."
    return {"current_form": updated_form, "reply": reply}

def tool_check_completeness(state: ComplaintAgentState):
    current_form = state.get("current_form", {})
    missing_fields = [k for k, v in current_form.items() if not v and k not in ["confidence_score", "id", "created_at", "updated_at", "severity", "risk_summary", "suggested_action", "root_cause", "capa"]]
    
    if missing_fields:
        reply = f"The following fields are missing and require your attention: **{', '.join(missing_fields)}**."
    else:
        reply = "The complaint form looks complete! No required fields are missing."
    return {"reply": reply}

def tool_generate_risk(state: ComplaintAgentState):
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
    reply = "Risk Assessment successfully generated."
    return {"current_form": updated_form, "reply": reply}

def tool_recommend_root_cause(state: ComplaintAgentState):
    current_form = state.get("current_form", {})
    prompt = f"""
    Based on the complaint details:
    {json.dumps(current_form)}
    
    Suggest 3 likely root causes for this manufacturing/product defect.
    Return a concise numbered list.
    """
    response = llm.invoke([HumanMessage(content=prompt)])
    
    updated_form = {**current_form, "root_cause": response.content}
    return {"current_form": updated_form, "reply": "I've generated a few potential root causes based on the provided details."}

def tool_recommend_capa(state: ComplaintAgentState):
    current_form = state.get("current_form", {})
    prompt = f"""
    Based on the complaint details and root cause:
    {json.dumps(current_form)}
    
    Suggest Corrective and Preventive Actions (CAPA) to address this issue.
    Return a concise numbered list.
    """
    response = llm.invoke([HumanMessage(content=prompt)])
    
    updated_form = {**current_form, "capa": response.content}
    return {"current_form": updated_form, "reply": "I've drafted some recommended CAPA (Corrective and Preventive Actions) steps."}

def tool_summarize_complaint(state: ComplaintAgentState):
    current_form = state.get("current_form", {})
    prompt = f"""
    Summarize this customer complaint professionally based on these details:
    {json.dumps(current_form)}
    
    Return a brief, formal overview paragraph.
    """
    response = llm.invoke([HumanMessage(content=prompt)])
    return {"reply": f"**Complaint Summary:**\n\n{response.content}"}
    
def tool_duplicate_check(state: ComplaintAgentState):
    current_form = state.get("current_form", {})
    batch = current_form.get("batch_number", "Unknown")
    product = current_form.get("product_name", "Unknown")
    
    # In a real scenario, this queries the DB. We simulate finding a similar one.
    if batch and batch != "Unknown":
        reply = f"⚠️ **Duplicate Warning:** Found similar previous complaints for Product '{product}' with Batch Number '{batch}'. Please verify before finalizing."
    else:
        reply = "No duplicate complaints detected."
    return {"reply": reply}

def tool_clear_complaint(state: ComplaintAgentState):
    empty_form = {
        "customer_name": "", "organization": "", "product_name": "",
        "strength": "", "batch_number": "", "manufacturing_date": "",
        "expiry_date": "", "complaint_category": "", "description": "",
        "quantity": "", "packaging": "", "manufacturing_site": "",
        "severity": "", "risk_summary": "", "suggested_action": "",
        "confidence_score": 0.0, "root_cause": "", "capa": ""
    }
    return {"current_form": empty_form, "reply": "The complaint form has been cleared."}

# Routing function
def route_intent(state: ComplaintAgentState):
    intent = state.get("intent")
    routes = {
        "edit_complaint": "tool_edit_complaint",
        "check_completeness": "tool_check_completeness",
        "recommend_root_cause": "tool_recommend_root_cause",
        "recommend_capa": "tool_recommend_capa",
        "summarize_complaint": "tool_summarize_complaint",
        "duplicate_check": "tool_duplicate_check",
        "clear_complaint": "tool_clear_complaint",
        "generate_risk": "tool_generate_risk"
    }
    return routes.get(intent, "tool_log_complaint")

# Build Graph
workflow = StateGraph(ComplaintAgentState)

workflow.add_node("detect_intent", detect_intent)
workflow.add_node("tool_log_complaint", tool_log_complaint)
workflow.add_node("tool_edit_complaint", tool_edit_complaint)
workflow.add_node("tool_check_completeness", tool_check_completeness)
workflow.add_node("tool_recommend_root_cause", tool_recommend_root_cause)
workflow.add_node("tool_recommend_capa", tool_recommend_capa)
workflow.add_node("tool_summarize_complaint", tool_summarize_complaint)
workflow.add_node("tool_duplicate_check", tool_duplicate_check)
workflow.add_node("tool_clear_complaint", tool_clear_complaint)
workflow.add_node("tool_generate_risk", tool_generate_risk)

workflow.set_entry_point("detect_intent")
workflow.add_conditional_edges("detect_intent", route_intent)

for node in ["tool_log_complaint", "tool_edit_complaint", "tool_check_completeness", 
             "tool_recommend_root_cause", "tool_recommend_capa", "tool_summarize_complaint", 
             "tool_duplicate_check", "tool_clear_complaint", "tool_generate_risk"]:
    workflow.add_edge(node, END)

complaint_app = workflow.compile()

def process_complaint_chat(message: str, current_form: dict):
    # Mock fallback if GROQ_API_KEY is missing
    if not settings.GROQ_API_KEY or settings.GROQ_API_KEY == "":
        return {
            "reply": "API Key is missing. Returning mocked response.",
            "form_data": current_form
        }

    try:
        state = {
            "messages": [HumanMessage(content=message)],
            "current_form": current_form
        }
        result = complaint_app.invoke(state)
        return {
            "reply": result.get("reply", "Done."),
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
