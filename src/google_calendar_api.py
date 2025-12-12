import datetime
import os.path
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
from datetime import datetime, timedelta, timezone
import json

# Define the scope required for creating/editing events
# https://www.googleapis.com/auth/calendar.events is the recommended scope
SCOPES = ["https://www.googleapis.com/auth/calendar.events", "https://www.googleapis.com/auth/calendar.readonly"]

def authenticate_google_calendar():
    """Shows how to set up the Google API credentials using the downloaded client_secret.json."""
    creds = None
    # The file token.json stores the user's access and refresh tokens, 
    # and is created automatically when the authorization flow completes for the first time.
  


    if os.path.exists("token.json"):
        creds = Credentials.from_authorized_user_file("token.json", SCOPES)
    
    # If there are no (valid) credentials available, let the user log in.
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            # Refresh the token if it's expired
            creds.refresh(Request())
        else:
            print("right here")

            REDIRECT_URI = "http://localhost:9090/oauth2callback"

            # Start the OAuth flow
            # The flow will automatically use the Authorized Redirect URIs defined 
            # in your client_secret.json (like http://localhost:8080/oauth2callback)
            flow = InstalledAppFlow.from_client_secrets_file(
                "client_secret_588465002822-qd2mph5ci7utptfs4073p9vc0sldihqm.apps.googleusercontent.com.json", SCOPES
            )


            # flow = InstalledAppFlow.from_client_config(client_config, SCOPES)
            
            # This line will open the browser for user consent
            # creds = flow.run_local_server(port=8080)
            creds = flow.run_local_server(port=9090)
            
        # Save the credentials for the next run
        with open("token.json", "w") as token:
            token.write(creds.to_json())

    return creds

def list_user_calendars(service):
    """Fetches and prints the list of calendars accessible by the user."""
    try:
        # Call the Calendar API's calendarList.list method
        print("Fetching user calendar list...")
        
        calendar_list = service.calendarList().list().execute()
        
        calendars = calendar_list.get('items', [])
        
        if not calendars:
            print("No calendars found.")
            return

        print("\n--- User Calendars ---")
        print("{:<45} {:<50}".format("Calendar ID (Use this for events)", "Summary/Name"))
        print("-" * 95)
        
        for calendar in calendars:
            calendar_id = calendar['id']
            summary = calendar.get('summary', 'No Name')
            
            print(f"{calendar_id:<45} {summary:<50}")
            
    except HttpError as error:
        print(f"An error occurred: {error}")

def get_calendar_events(service, calendar_id='primary'):
    """
    Fetches events from the specified calendar for a defined time range.

    Args:
        service: The authenticated Google Calendar API service object.
        calendar_id: The ID of the calendar to query (e.g., 'primary').
    """
    try:
        # Define the time range for the query
        
        # 1. Get current UTC time
        now = datetime.now(timezone.utc)

        # 2. Set start time to *today at 00:00 UTC*
        start_of_today = now.replace(hour=0, minute=0, second=0, microsecond=0)
        time_min = start_of_today.isoformat().replace("+00:00", "Z")

        # 3. Set end time to 7 days from now
        future = start_of_today + timedelta(days=7)
        time_max = future.isoformat().replace("+00:00", "Z")

        print(f"\nFetching events for Calendar ID: {calendar_id}")
        print(f"Time Range: {now.date()} to {future.date()}")
        
        # --- Make the API Call: events.list() ---
        events_result = service.events().list(
            calendarId=calendar_id,
            timeMin=time_min,
            timeMax=time_max,
            maxResults=10,  # Limit to 10 events for testing
            singleEvents=True, # Expand recurring events into individual instances
            orderBy='startTime' # Sort by start time
        ).execute()
        
        events = events_result.get('items', [])

        time_ranges = []

        for event in events:
            start = event.get("start", {}).get("dateTime")
            end = event.get("end", {}).get("dateTime")
            time_ranges.append({"start": start, "end": end})

        print("\n--- Upcoming Events ---")

        print(time_ranges)
        
        # pretty_json_string = json.dumps(events,indent=4,sort_keys=True )
        # print(pretty_json_string)
        # if not events:
        #     print("No upcoming events found in this range.")
        #     return

        # print("-" * 50)
        # print("Upcoming Events (Next 7 Days):")
        
        # for event in events:
        #     start = event['start'].get('dateTime', event['start'].get('date'))
        #     summary = event.get('summary', 'No Title')
            
        #     print(f"- {start} | {summary}")
            
        # print("-" * 50)
        return time_ranges

    except HttpError as error:
        print(f"An error occurred while fetching events: {error}")


def create_calendar_event(service, item: dict):
    """Creates a simple 1-hour event on the user's primary calendar."""
    
    # --- 1. Define the Event Details ---
    
    # Define start and end times in RFC 3339 format


    event_body = {
        'summary': item['summary'],
        'location': 'Created by Zone',     # or item.get("location")
        'description': item['description'],

        'start': {
            'dateTime': item['start_iso'],
            'timeZone': 'America/New_York',
        },
        'end': {
            'dateTime': item['end_iso'],
            'timeZone': 'America/New_York',
        }
    }
    # Include optional colorId if provided (Google Calendar accepts '1'..'11')
    if item.get('colorId'):
        event_body['colorId'] = str(item.get('colorId'))
    
    # start_time = datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(hours=1)
    # end_time = start_time + datetime.timedelta(hours=1)
    # event_body = {
    #     'summary': 'Team Sync-Up Meeting (Python API Test)',
    #     'location': 'Online via Google Meet',
    #     'description': 'A quick test event created using the Google Calendar Python API.',
        
    #     # Date/Time details must include the timezone
    #     'start': {
    #         'dateTime': start_time.isoformat(),
    #         'timeZone': 'America/New_York', # Use your preferred timezone
    #     },
    #     'end': {
    #         'dateTime': end_time.isoformat(),
    #         'timeZone': 'America/New_York',
    #     },
        
    #     # Optional: Add attendees
    #     'attendees': [
    #         {'email': 'pavithra.rajan01@gmail.com'}, # Replace with actual emails
    #         {'email': 'annasusanc@gmail.com'},
    #     ],
        
    #     # Optional: Add a conference link (e.g., Google Meet)
    #     'conferenceData': {
    #         'createRequest': {
    #             'requestId': 'meeting-request-123',
    #             'conferenceSolutionKey': {'type': 'hangoutsMeet'}
    #         }
    #     }
    # }

    # --- 2. Make the API Call ---
    try:
        # The 'primary' ID refers to the user's main calendar
        event = service.events().insert(
            calendarId='primary',
            sendUpdates='all', # Controls email notifications to guests
            body=event_body,
            conferenceDataVersion=1 # Required for creating a Meet link
        ).execute()
        
        print("-" * 50)
        print(f"Event created successfully!")
        print(f"Summary: {event.get('summary')}")
        print(f"Event ID: {event.get('id')}")
        print(f"Link: {event.get('htmlLink')}")
        print("-" * 50)

    except HttpError as error:
        print(f"An error occurred: {error}")


def gcal_events():
        creds = authenticate_google_calendar()
        
        service = build("calendar", "v3", credentials=creds)

        return get_calendar_events(service, calendar_id='primary')
        
# --- Main Execution ---
# def main():
#     try:
#         # 1. Authenticate and get credentials
#         creds = authenticate_google_calendar()
        
#         # 2. Build the service object
#         service = build("calendar", "v3", credentials=creds)
        
#         # 3. Create the event
#         # create_calendar_event(service)

#         # 4. List user calendars
#         # list_user_calendars(service)

#         # 5. Fetch and print events from the primary calendar
#         get_calendar_events(service, calendar_id='primary')
        
#     except Exception as e:
#         print(f"A critical error occurred in main: {e}")

# if __name__ == "__main__":
#     main()



