# import json

# with open('gateway.json', 'r', encoding='utf-8') as f:
#     data = json.load(f)
#     print(data['gateway'])

VALID_BSSID = ["C4-03-A8-A6-D3-26"]

def request_mac(request):
    data = json.loads(request.body)
    bssid = data.get("bssid")
    