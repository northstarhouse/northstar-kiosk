## Apps Script: Enable Reading Hours (JSONP)

Your existing Web App supports `doPost` (writes). To let the kiosk *read* logs for the “Volunteer Hours” screen, add a `doGet` that returns JSONP.

In your Google Sheet: `Extensions → Apps Script`, add something like:

```js
function doGet(e) {
  var action = (e && e.parameter && e.parameter.action) || '';
  var callback = (e && e.parameter && e.parameter.callback) || '';

  if (!callback) {
    return ContentService
      .createTextOutput('Missing callback')
      .setMimeType(ContentService.MimeType.TEXT);
  }

  if (action !== 'list-volunteer-logs') {
    return ContentService
      .createTextOutput(callback + '(' + JSON.stringify({ ok: false, error: 'Unknown action' }) + ');')
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }

  var ss = SpreadsheetApp.getActive();
  var sheet = ss.getSheetByName('Sessions'); // change if your tab name differs
  var values = sheet.getDataRange().getValues();

  // Expected columns in Sessions:
  // [timestamp, name, type, duty, action] or similar.
  // If your columns differ, map accordingly.
  var logs = [];
  for (var i = 1; i < values.length; i++) {
    var row = values[i];
    logs.push({
      timestamp: row[0],
      name: row[1],
      type: row[2] || 'volunteer',
      duty: row[3] || '',
      action: row[4] || ''
    });
  }

  var payload = { ok: true, logs: logs };
  return ContentService
    .createTextOutput(callback + '(' + JSON.stringify(payload) + ');')
    .setMimeType(ContentService.MimeType.JAVASCRIPT);
}
```

Re-deploy the web app after saving.
