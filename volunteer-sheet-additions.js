/**
 * ADDITIONS TO YOUR APPS SCRIPT
 *
 * Three places to edit:
 *   1. Add constants (after existing HOURS_ constants)
 *   2. Add helper functions (before doGet)
 *   3. Add cases to doPost switch (inside the switch block)
 *   4. Add read actions to doGet (inside the try block)
 */


// ─────────────────────────────────────────────
// 1. ADD THESE CONSTANTS (after HOURS_SHEET_NAME)
// ─────────────────────────────────────────────

const VOLUNTEER_LOGS_SHEET_NAME = 'VolunteerLogs';


// ─────────────────────────────────────────────
// 2. ADD THESE FUNCTIONS (before doGet)
// ─────────────────────────────────────────────

function getVolunteerLogsSheet() {
  var ss = SpreadsheetApp.openById(HOURS_SHEET_ID);
  var sheet = ss.getSheetByName(VOLUNTEER_LOGS_SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(VOLUNTEER_LOGS_SHEET_NAME);
    sheet.appendRow(['timestamp', 'name', 'type', 'duty', 'action', 'source']);
    sheet.getRange(1, 1, 1, 6).setFontWeight('bold');
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function appendVolunteerLog(entry) {
  var sheet = getVolunteerLogsSheet();
  sheet.appendRow([
    entry.timestamp || new Date().toISOString(),
    (entry.name   || '').toString(),
    (entry.type   || 'volunteer').toString(),
    (entry.duty   || '').toString(),
    (entry.action || '').toString(),
    (entry.source || '').toString()
  ]);
  return { saved: true };
}

function readVolunteerLogs() {
  var sheet = getVolunteerLogsSheet();
  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];
  var rows = [];
  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    if (!row[0]) continue;
    rows.push({
      timestamp: row[0].toString(),
      name:      (row[1] || '').toString(),
      type:      (row[2] || 'volunteer').toString(),
      duty:      (row[3] || '').toString(),
      action:    (row[4] || '').toString()
    });
  }
  return rows;
}

function buildVolunteerSessions() {
  var logs = readVolunteerLogs();
  var byName = {};
  logs.forEach(function(log) {
    if (log.type !== 'volunteer') return;
    var name = (log.name || '').trim();
    if (!name) return;
    if (!byName[name]) byName[name] = [];
    byName[name].push(log);
  });
  var sessions = [];
  Object.keys(byName).forEach(function(name) {
    var entries = byName[name].slice().sort(function(a, b) {
      return new Date(a.timestamp) - new Date(b.timestamp);
    });
    var pendingCheckIn = null;
    entries.forEach(function(log) {
      if (log.action === 'check-in') {
        pendingCheckIn = log;
      } else if (log.action === 'check-out' && pendingCheckIn) {
        var loginAt  = new Date(pendingCheckIn.timestamp);
        var logoutAt = new Date(log.timestamp);
        sessions.push({
          user:            name,
          loginAt:         pendingCheckIn.timestamp,
          logoutAt:        log.timestamp,
          durationMinutes: Math.round((logoutAt - loginAt) / 60000),
          duty:            pendingCheckIn.duty || ''
        });
        pendingCheckIn = null;
      }
    });
  });
  return sessions;
}


// ─────────────────────────────────────────────
// 3. ADD THESE CASES TO doPost SWITCH
//    (inside the switch(action) block, before default:)
// ─────────────────────────────────────────────

/*
      case 'check-in':
      case 'check-out':
        result = appendVolunteerLog(data);
        break;
*/


// ─────────────────────────────────────────────
// 4. ADD THESE ACTIONS TO doGet
//    (inside the try block, before the final unknown-action return)
//    These use JSONP so the kiosk can read them cross-origin.
// ─────────────────────────────────────────────

/*
    if (action === 'list-volunteer-logs') {
      const callback = e.parameter.callback || '';
      const payload = JSON.stringify({ ok: true, logs: readVolunteerLogs() });
      if (callback) {
        return ContentService.createTextOutput(callback + '(' + payload + ');')
          .setMimeType(ContentService.MimeType.JAVASCRIPT);
      }
      return ContentService.createTextOutput(payload).setMimeType(ContentService.MimeType.JSON);
    }

    if (action === 'list-sessions') {
      const callback = e.parameter.callback || '';
      const payload = JSON.stringify({ ok: true, sessions: buildVolunteerSessions() });
      if (callback) {
        return ContentService.createTextOutput(callback + '(' + payload + ');')
          .setMimeType(ContentService.MimeType.JAVASCRIPT);
      }
      return ContentService.createTextOutput(payload).setMimeType(ContentService.MimeType.JSON);
    }
*/
