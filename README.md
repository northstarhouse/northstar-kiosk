# north-star-kiosk

## Volunteer Hours (Google Sheets)

The kiosk can *write* logs to Google Sheets via Apps Script (`doPost`). To *read* totals back into the kiosk (so the “Total Hours” view works across devices), your Apps Script must also implement a `doGet` read endpoint.

This kiosk expects a JSONP endpoint at the same Apps Script URL:

- `GET ?action=list-volunteer-logs&callback=...`
- Response shape: `{ ok: true, logs: [ { timestamp, name, type: "volunteer", duty, action }, ... ] }`
