import requests

def dustbins():
    CHANNEL_ID = "2512051"
    API_KEY = "YVZ6OA3560DAGJTP"

    # Fetch the latest data
    response = requests.get(f"https://api.thingspeak.com/channels/{CHANNEL_ID}/fields/1/last.json?api_key={API_KEY}")
    dustbin_capacity = (response.json()["field1"])

    # Fetch the channel location
    response = requests.get(f"https://api.thingspeak.com/channels/{CHANNEL_ID}.json?api_key={API_KEY}")

    try:
        channel_info = response.json()
        print(channel_info)
        latitude = channel_info["latitude"]
        longitude = channel_info["longitude"]
    except KeyError:
        print("Error: Unable to fetch the channel location information.")
        latitude = None
        longitude = None
    
    return str(latitude), str(longitude),float(dustbin_capacity)
