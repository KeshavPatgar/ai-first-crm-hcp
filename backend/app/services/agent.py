import json
from typing import TypedDict, Annotated, Sequence
from langchain_core.messages import BaseMessage, HumanMessage, AIMessage
from langgraph.graph import StateGraph, END
from langchain_groq import ChatGroq
from app.core.config import settings

# State definition
class AgentState(TypedDict):
    messages: Sequence[BaseMessage]
    current_form: dict
    extracted_data: dict
    intent: str
    reply: str

# LLM Setup
llm = ChatGroq(temperature=0, model_name="llama-3.1-8b-instant", groq_api_key=settings.GROQ_API_KEY)

# 1. Intent Detection
def detect_intent(state: AgentState):
    user_message = state["messages"][-1].content
    prompt = f"""
    Determine the intent of the following message from a pharma rep.
    Choose exactly one intent from this list:
    - log_interaction
    - edit_interaction
    - generate_actions
    - generate_summary
    - generate_email
    - clear_interaction

    Message: {user_message}
    Output only the exact intent string, nothing else.
    """
    response = llm.invoke([HumanMessage(content=prompt)])
    intent = response.content.strip().lower()
    if intent not in ["log_interaction", "edit_interaction", "generate_actions", "generate_summary", "generate_email", "clear_interaction"]:
        intent = "log_interaction" # fallback
    return {"intent": intent}

# 2. Tool Execution functions
def tool_log_interaction(state: AgentState):
    user_message = state["messages"][-1].content
    prompt = f"""
    Extract the following entities from the message:
    - hcp_name
    - hospital
    - speciality
    - topics_discussed
    - sentiment (Positive, Neutral, Negative)
    - materials_shared
    - samples_distributed
    - interaction_date
    - followup_date
    - outcomes
    - followup_actions

    Message: {user_message}
    
    Return ONLY a valid JSON object. Do not include markdown formatting or explanations.
    """
    response = llm.invoke([HumanMessage(content=prompt)])
    try:
        data = json.loads(response.content.replace("```json", "").replace("```", "").strip())
    except:
        data = {}
    
    updated_form = {**state.get("current_form", {}), **data}
    reply = "**Interaction logged successfully!** The details have been automatically populated based on your summary. Would you like me to suggest a specific follow-up action?"
    return {"current_form": updated_form, "reply": reply}

def tool_edit_interaction(state: AgentState):
    user_message = state["messages"][-1].content
    current_form = state.get("current_form", {})
    prompt = f"""
    The user wants to edit the current form. 
    User message: {user_message}
    Current form keys: hcp_name, hospital, speciality, topics_discussed, sentiment, materials_shared, samples_distributed, interaction_date, followup_date, outcomes, followup_actions
    
    Identify which fields need to be updated and their new values.
    Return ONLY a valid JSON object with the fields to update.
    """
    response = llm.invoke([HumanMessage(content=prompt)])
    try:
        data = json.loads(response.content.replace("```json", "").replace("```", "").strip())
    except:
        data = {}
    
    updated_form = {**current_form, **data}
    reply = "I've updated those specific fields. The rest of the form remains untouched."
    return {"current_form": updated_form, "reply": reply}

def tool_generate_actions(state: AgentState):
    user_message = state["messages"][-1].content
    current_form = state.get("current_form", {})
    prompt = f"""
    Based on the interaction details:
    {json.dumps(current_form)}
    
    Suggest professional follow-up actions for this HCP.
    Return a concise numbered list (1., 2., 3.) of 3 actionable items.
    """
    response = llm.invoke([HumanMessage(content=prompt)])
    reply = response.content
    return {"reply": reply}

def tool_generate_summary(state: AgentState):
    user_message = state["messages"][-1].content
    current_form = state.get("current_form", {})
    prompt = f"""
    Summarize today's interaction professionally based on these details:
    {json.dumps(current_form)}
    
    Return a concise numbered list (1., 2., 3.) summarizing the key points.
    """
    response = llm.invoke([HumanMessage(content=prompt)])
    reply = response.content
    return {"reply": reply}

def tool_generate_email(state: AgentState):
    current_form = state.get("current_form", {})
    prompt = f"""
    Write a professional follow-up email from a pharma rep to the HCP based on:
    {json.dumps(current_form)}
    
    Please use the following template and replace all bracketed placeholders with actual information from the details above. If any detail is missing, omit that part smoothly or use a generic term, but DO NOT output bracketed placeholders like [HCP Name].
    
    Template:
    Subject: Follow-up on Our Recent Meeting
    
    Dear [HCP Name],
    
    I hope this email finds you well. I am writing to follow up on our meeting that took place on [Interaction Date] regarding [Topic(s) Discussed]. I wanted to express my gratitude for the opportunity to discuss [Topic(s) Discussed] with you and explore how our product can benefit your patients.
    
    As a reminder, we discussed [Specific Topics Discussed, e.g., product efficacy, clinical trials, and potential patient benefits]. I believe our conversation was productive, and I would like to reiterate that our team is committed to supporting you and your patients.
    
    If you have any further questions or would like to schedule a follow-up meeting, please do not hesitate to contact me. I would be more than happy to assist you.
    
    Thank you for your time, and I look forward to hearing from you soon.
    
    Best regards,
    Pharma Representative
    """
    response = llm.invoke([HumanMessage(content=prompt)])
    reply = response.content
    return {"reply": reply}

def tool_clear_interaction(state: AgentState):
    empty_form = {
        "hcp_name": "",
        "hospital": "",
        "speciality": "",
        "interaction_date": "",
        "interaction_type": "Meeting",
        "topics_discussed": "",
        "materials_shared": "",
        "samples_distributed": "",
        "sentiment": "",
        "outcomes": "",
        "followup_actions": "",
        "followup_date": "",
        "priority": "",
        "attachments": "",
        "save_status": ""
    }
    return {"current_form": empty_form, "reply": "The interaction details have been cleared."}

# Routing function
def route_intent(state: AgentState):
    intent = state.get("intent")
    if intent == "edit_interaction": return "tool_edit_interaction"
    if intent == "generate_actions": return "tool_generate_actions"
    if intent == "generate_summary": return "tool_generate_summary"
    if intent == "generate_email": return "tool_generate_email"
    if intent == "clear_interaction": return "tool_clear_interaction"
    return "tool_log_interaction"

# Build Graph
workflow = StateGraph(AgentState)

workflow.add_node("detect_intent", detect_intent)
workflow.add_node("tool_log_interaction", tool_log_interaction)
workflow.add_node("tool_edit_interaction", tool_edit_interaction)
workflow.add_node("tool_generate_actions", tool_generate_actions)
workflow.add_node("tool_generate_summary", tool_generate_summary)
workflow.add_node("tool_generate_email", tool_generate_email)
workflow.add_node("tool_clear_interaction", tool_clear_interaction)

workflow.set_entry_point("detect_intent")
workflow.add_conditional_edges("detect_intent", route_intent)

workflow.add_edge("tool_log_interaction", END)
workflow.add_edge("tool_edit_interaction", END)
workflow.add_edge("tool_generate_actions", END)
workflow.add_edge("tool_generate_summary", END)
workflow.add_edge("tool_generate_email", END)
workflow.add_edge("tool_clear_interaction", END)

agent_app = workflow.compile()

def process_chat(message: str, current_form: dict):
    # Dummy mock fallback if GROQ_API_KEY is missing
    if not settings.GROQ_API_KEY or settings.GROQ_API_KEY == "":
        text = message.lower()
        if "dr." in text or "met" in text:
            return {
                "reply": "**Interaction logged successfully!** (Mocked: Please set GROQ_API_KEY)",
                "form_data": {**current_form, "hcp_name": "Dr. Smith", "sentiment": "Positive", "topics_discussed": "Product X efficiency"}
            }
        elif "actually" in text or "sorry" in text:
            return {
                "reply": "Updated fields based on your correction. (Mocked)",
                "form_data": {**current_form, "hcp_name": "Dr. John", "sentiment": "Negative"}
            }
        elif "action" in text or "follow-up" in text or "follow up" in text:
            return {
                "reply": "Here are 3 suggested follow-up actions:\n1. Send product literature.\n2. Schedule a follow-up call next week.\n3. Verify sample inventory. (Mocked)",
                "form_data": current_form
            }
        elif "summary" in text:
            return {
                "reply": "1. Met with HCP to discuss product efficacy.\n2. HCP showed positive sentiment.\n3. Requested more samples. (Mocked)",
                "form_data": current_form
            }
        elif "email" in text or "draft" in text:
            hcp_name = current_form.get("hcp_name", "Doctor")
            interaction_date = current_form.get("interaction_date", "our recent meeting")
            topics = current_form.get("topics_discussed", "the topics we discussed")
            
            email_body = f"Subject: Follow-up on Our Recent Meeting\n\nDear {hcp_name},\n\nI hope this email finds you well. I am writing to follow up on our meeting that took place on {interaction_date} regarding {topics}. I wanted to express my gratitude for the opportunity to discuss {topics} with you and explore how our product can benefit your patients.\n\nAs a reminder, we discussed {topics}. I believe our conversation was productive, and I would like to reiterate that our team is committed to supporting you and your patients.\n\nIf you have any further questions or would like to schedule a follow-up meeting, please do not hesitate to contact me. I would be more than happy to assist you.\n\nThank you for your time, and I look forward to hearing from you soon.\n\nBest regards,\nPharma Representative\n\n(Mocked)"
            return {
                "reply": email_body,
                "form_data": current_form
            }
        elif "clear" in text:
            empty_form = {
                "hcp_name": "",
                "hospital": "",
                "speciality": "",
                "interaction_date": "",
                "interaction_type": "Meeting",
                "topics_discussed": "",
                "materials_shared": "",
                "samples_distributed": "",
                "sentiment": "",
                "outcomes": "",
                "followup_actions": "",
                "followup_date": "",
                "priority": "",
                "attachments": "",
                "save_status": ""
            }
            return {
                "reply": "The interaction details have been cleared. (Mocked)",
                "form_data": empty_form
            }
        return {"reply": "I understand. (Mocked)", "form_data": current_form}

    # Execute LangGraph
    try:
        state = {
            "messages": [HumanMessage(content=message)],
            "current_form": current_form
        }
        result = agent_app.invoke(state)
        return {
            "reply": result.get("reply", "Done."),
            "form_data": result.get("current_form", current_form)
        }
    except Exception as e:
        return {
            "reply": f"An error occurred: {str(e)}",
            "form_data": current_form
        }
