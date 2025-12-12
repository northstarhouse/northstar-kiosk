## Apps Script: Enable Reading Hours (JSONP)

Your web app currently supports `doPost` (writes). To let the kiosk read hours back from Google Sheets, add a `doGet` that returns JSONP and redeploy the web app.

The kiosk calls these endpoints:

- `GET ?action=list-sessions&callback=...` (preferred for month + year totals)
- `GET ?action=list-volunteer-logs&callback=...` (fallback)

Starter implementation (adjust tab names + column mapping to match your sheet):

```js
const VOLUNTEER_LOG_SHEET = 'VolunteerLogs'; // columns: timestamp, name, type, duty, action
const SESSIONS_SHEET = 'Sessions';           // columns: user, loginAt, logoutAt, durationMinutes, duty?

function doGet(e) {
  var action = (e && e.parameter && e.parameter.action) || '';
  var callback = (e && e.parameter && e.parameter.callback) || '';

  if (!callback) {
    return ContentService.createTextOutput('Missing callback').setMimeType(ContentService.MimeType.TEXT);
  }

  try {
    if (action === 'list-volunteer-logs') {
      return jsonp_(callback, { ok: true, logs: readRows_(VOLUNTEER_LOG_SHEET, mapVolunteerLogRow_) });
    }

    if (action === 'list-sessions') {
      return jsonp_(callback, { ok: true, sessions: readRows_(SESSIONS_SHEET, mapSessionRow_) });
    }

    return jsonp_(callback, { ok: false, error: 'Unknown action' });
  } catch (err) {
    return jsonp_(callback, { ok: false, error: String(err) });
  }
}

function readRows_(sheetName, mapper) {
  var ss = SpreadsheetApp.getActive();
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) return [];
  var values = sheet.getDataRange().getValues();
  var rows = [];
  for (var i = 1; i < values.length; i++) rows.push(mapper(values[i]));
  return rows;
}

function mapVolunteerLogRow_(row) {
  return {
    timestamp: row[0],
    name: row[1],
    type: row[2] || 'volunteer',
    duty: row[3] || '',
    action: row[4] || ''
  };
}

function mapSessionRow_(row) {
  return {
    user: row[0],
    loginAt: row[1],
    logoutAt: row[2],
    durationMinutes: row[3],
    duty: row[4] || ''
  };
}

function jsonp_(callback, obj) {
  return ContentService
    .createTextOutput(callback + '(' + JSON.stringify(obj) + ');')
    .setMimeType(ContentService.MimeType.JAVASCRIPT);
}
```

After saving: `Deploy → Manage deployments → Edit` (or New deployment) → Web app → Deploy.
