# north-star-kiosk

## Volunteer Hours (Google Sheets)

The kiosk can write logs to Google Sheets via Apps Script (`doPost`). To read totals back into the kiosk (so the "Volunteer Hours" screen works across devices), your Apps Script must also implement a `doGet` JSONP endpoint.

The kiosk will try (in order):

- Preferred: `GET ?action=list-sessions&callback=...`
  - Response: `{ ok: true, sessions: [ { user, loginAt, logoutAt, durationMinutes, duty? }, ... ] }`
- Fallback: `GET ?action=list-volunteer-logs&callback=...`
  - Response: `{ ok: true, logs: [ { timestamp, name, type: "volunteer", duty, action }, ... ] }`

See `apps-script-readme.md` for a starter `doGet`.

## Build (precompiled kiosk)

The kiosk now ships with precompiled JS for faster mobile load.

```bash
npm.cmd install
npm.cmd run build
```
