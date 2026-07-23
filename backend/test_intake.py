import requests

url = "http://localhost:8000/api/complaints/chat"
payload = {
    "message": "The tablets were broken in the bottle.",
    "current_form": {}
}

res = requests.post(url, json=payload)
print(res.json())
