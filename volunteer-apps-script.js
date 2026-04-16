/**
 * Google Apps Script for North Star Kiosk — Volunteer Log
 *
 * Sheet tab: "VolunteerLogs"
 *   Columns: A=timestamp | B=name | C=type | D=duty | E=action | F=source
 *
 * Deploy as a Web App:
 *   - Execute as: Me
 *   - Who has access: Anyone
 *
 * ALL requests use doGet (JSONP) — this avoids the Apps Script redirect
 * that silently drops POST bodies before doPost fires.
 *
 * Endpoints (all GET with ?callback=...):
 *   ?action=write&data={json}&callback=...   — append a log entry
 *   ?action=list-volunteer-logs&callback=... — read all log rows
 *   ?action=list-sessions&callback=...       — read completed sessions
 */

var SHEET_NAME = 'VolunteerLogs';

function doGet(e) {
  var callback = (e && e.parameter && e.parameter.callback) || '';
  var action   = (e && e.parameter && e.parameter.action)   || '';

  if (!callback) {
    return ContentService.createTextOutput('Missing callback')
      .setMimeType(ContentService.MimeType.TEXT);
  }

  try {
    if (action === 'write') {
      var raw = (e && e.parameter && e.parameter.data) || '';
      if (!raw) return jsonp_(callback, { ok: false, error: 'No data' });
      var entry = JSON.parse(raw);
      appendLog_(entry);
      return jsonp_(callback, { ok: true });
    }

    if (action === 'list-volunteer-logs') {
      return jsonp_(callback, { ok: true, logs: readLogs_() });
    }

    if (action === 'list-sessions') {
      return jsonp_(callback, { ok: true, sessions: buildSessions_() });
    }

    return jsonp_(callback, { ok: false, error: 'Unknown action' });
  } catch (err) {
    return jsonp_(callback, { ok: false, error: String(err) });
  }
}

/* ── Write ─────────────────────────────────────────────────── */

function appendLog_(entry) {
  var ss    = SpreadsheetApp.getActive();
  var sheet = getOrCreateSheet_(ss);
  sheet.appendRow([
    entry.timestamp || new Date().toISOString(),
    (entry.name    || '').toString(),
    (entry.type    || 'volunteer').toString(),
    (entry.duty    || '').toString(),
    (entry.action  || '').toString(),
    (entry.source  || '').toString()
  ]);
}

/* ── Read: raw logs ────────────────────────────────────────── */

function readLogs_() {
  var ss    = SpreadsheetApp.getActive();
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) return [];
  var values = sheet.getDataRange().getValues();
  var rows = [];
  for (var i = 1; i < values.length; i++) {
    var row = values[i];
    if (!row[0]) continue;
    rows.push({
      timestamp: row[0] ? row[0].toString() : '',
      name:      (row[1] || '').toString(),
      type:      (row[2] || 'volunteer').toString(),
      duty:      (row[3] || '').toString(),
      action:    (row[4] || '').toString()
    });
  }
  return rows;
}

/* ── Read: completed sessions ──────────────────────────────── */

function buildSessions_() {
  var logs = readLogs_();
  // Group by name, pair check-ins with check-outs chronologically
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
        var durationMinutes = Math.round((logoutAt - loginAt) / 60000);
        sessions.push({
          user:            name,
          loginAt:         pendingCheckIn.timestamp,
          logoutAt:        log.timestamp,
          durationMinutes: durationMinutes,
          duty:            pendingCheckIn.duty || ''
        });
        pendingCheckIn = null;
      }
    });
  });

  return sessions;
}

/* ── Helpers ───────────────────────────────────────────────── */

function getOrCreateSheet_(ss) {
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(['timestamp', 'name', 'type', 'duty', 'action', 'source']);
    sheet.getRange(1, 1, 1, 6).setFontWeight('bold');
  }
  return sheet;
}

function jsonp_(callback, obj) {
  return ContentService
    .createTextOutput(callback + '(' + JSON.stringify(obj) + ');')
    .setMimeType(ContentService.MimeType.JAVASCRIPT);
}
