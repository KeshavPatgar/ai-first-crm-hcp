import json
import re
from app.core.config import settings
from langchain_groq import ChatGroq
from langchain_core.messages import HumanMessage

llm = ChatGroq(temperature=0.0, model_name="llama-3.1-8b-instant", groq_api_key=settings.GROQ_API_KEY)

prompt = """
    Based on the following complaint details:
    {"description": "The tablets were broken.", "product_name": "Tylenol"}
    
    Suggest the following:
    - root_cause (3 likely root causes)
    - capa (Suggested Corrective and Preventive Actions)
    
    Return ONLY a valid JSON object with keys "root_cause" and "capa". Do not include markdown formatting, code blocks, or explanations.
"""

res = llm.invoke([HumanMessage(content=prompt)])
print("RAW RESPONSE:")
print(repr(res.content))

def parse_json_response(content: str) -> dict:
    match = re.search(r'```(?:json)?\s*(\{.*?\})\s*```', content, re.DOTALL)
    if match:
        try: return json.loads(match.group(1))
        except Exception as e: print("Regex 1 Error:", e)
    match = re.search(r'\{.*\}', content, re.DOTALL)
    if match:
        try: return json.loads(match.group(0))
        except Exception as e: print("Regex 2 Error:", e)
    return {}

print("PARSED RESPONSE:")
print(parse_json_response(res.content))
