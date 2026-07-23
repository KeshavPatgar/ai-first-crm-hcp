import requests

url = "http://localhost:8000/api/complaints/chat"
payload = {
    "message": "Is this product expired?",
    "current_form": {
        "expiry_date": "10/2027",
        "product_name": "Tylenol"
    }
}
res = requests.post(url, json=payload)
print(res.json())
