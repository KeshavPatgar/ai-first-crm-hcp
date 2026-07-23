import requests

url = "http://localhost:8000/api/complaints/extract"
payload = {
    "text": "The packaging was fully crushed, indicating a transit issue.",
    "current_form": {}
}
res = requests.post(url, json=payload)
print(res.json())
