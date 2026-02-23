/**
 * Google Apps Script for North Star Kiosk — Open Tasks
 *
 * Sheet columns:
 *   A: Task Name | B: Lead | C: Duration | D: Volunteer Signed Up | E: Date | F: Status
 *
 * SETUP:
 * 1. In your Google Sheet, open Extensions → Apps Script
 * 2. Paste this code and click Deploy → New deployment → Web app
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 3. Copy the deployment URL and paste it as OPEN_TASKS_SHEET_URL in app.jsx
 *
 * The sheet tab name must match SHEET_NAME below.
 */

var SHEET_NAME = 'Sheet1';

/* ── GET: read tasks ─────────────────────────────────────── */

function doGet(e) {
  var callback = (e && e.parameter && e.parameter.callback) || '';
  var action   = (e && e.parameter && e.parameter.action)   || '';

  if (!callback) {
    return ContentService.createTextOutput('Missing callback')
      .setMimeType(ContentService.MimeType.TEXT);
  }

  try {
    if (action === 'list-tasks') {
      var tasks = readTasks_();
      return jsonp_(callback, { ok: true, tasks: tasks });
    }
    return jsonp_(callback, { ok: false, error: 'Unknown action' });
  } catch (err) {
    return jsonp_(callback, { ok: false, error: String(err) });
  }
}

function readTasks_() {
  var ss    = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) return [];

  var data = sheet.getDataRange().getValues();
  if (data.length < 2) return [];          // header only

  var tasks = [];
  for (var i = 1; i < data.length; i++) {  // skip header row
    var status = (data[i][5] || '').toString().trim().toLowerCase();
    if (status === 'done') continue;       // hide completed tasks

    tasks.push({
      row:        i + 1,                   // 1-based sheet row (for updates)
      taskName:   (data[i][0] || '').toString(),
      lead:       (data[i][1] || '').toString(),
      duration:   (data[i][2] || '').toString(),
      assignedTo: (data[i][3] || '').toString(),
      date:       (data[i][4] || '').toString(),
      status:     status || 'open'
    });
  }
  return tasks;
}

/* ── POST: update a task ─────────────────────────────────── */

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);

    if (data.action === 'update-task') {
      updateTask_(data);
      return ContentService.createTextOutput(
        JSON.stringify({ ok: true })
      ).setMimeType(ContentService.MimeType.JSON);
    }

    return ContentService.createTextOutput(
      JSON.stringify({ ok: false, error: 'Unknown action' })
    ).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(
      JSON.stringify({ ok: false, error: String(err) })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

function updateTask_(data) {
  var ss    = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) throw new Error('Sheet not found: ' + SHEET_NAME);

  var row = data.row;
  if (!row || row < 2) throw new Error('Invalid row: ' + row);

  // Update Volunteer Signed Up (column D = 4)
  if (data.assignedTo !== undefined) {
    sheet.getRange(row, 4).setValue(data.assignedTo);
  }

  // Update Status (column F = 6)
  if (data.status !== undefined) {
    sheet.getRange(row, 6).setValue(data.status);
  }
}

/* ── Helpers ─────────────────────────────────────────────── */

function jsonp_(callback, obj) {
  return ContentService
    .createTextOutput(callback + '(' + JSON.stringify(obj) + ');')
    .setMimeType(ContentService.MimeType.JAVASCRIPT);
}
