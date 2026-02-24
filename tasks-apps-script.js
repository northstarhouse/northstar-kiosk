/**
 * Google Apps Script for North Star Kiosk — Open Tasks
 *
 * Sheet columns (Sheet1):
 *   A: Task Name | B: Lead | C: Duration | D: Volunteer Signed Up | E: Date | F: Status | G: Type
 *
 * Task Log columns (Task Log tab — auto-created):
 *   A: Timestamp | B: Task Name | C: Volunteer | D: Status | E: Type
 *
 * Type column (G): "daily" or "one-off" (blank defaults to one-off)
 * Daily tasks auto-reset to open each morning.
 * All status changes are logged to the "Task Log" tab.
 *
 * SETUP:
 * 1. In your Google Sheet, open Extensions → Apps Script
 * 2. Paste this code and click Deploy → New deployment → Web app
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 3. Copy the deployment URL and paste it as OPEN_TASKS_SHEET_URL in app.jsx
 * 4. Set up a daily trigger: Run resetDailyTasks_ once per day (e.g. midnight)
 *    - In Apps Script, go to Triggers (clock icon) → Add Trigger
 *    - Function: resetDailyTasks_, Event: Time-driven, Day timer, Midnight to 1am
 *
 * The sheet tab name must match SHEET_NAME below.
 */

var SHEET_NAME = 'Sheet1';
var LOG_SHEET_NAME = 'Task Log';

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
      getOrCreateLogSheet_();  // ensure Task Log tab exists
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
    var type   = (data[i][6] || '').toString().trim().toLowerCase() || 'one-off';

    // Hide completed one-off tasks; show daily tasks regardless of status
    if (status === 'done' && type !== 'daily') continue;

    tasks.push({
      row:        i + 1,                   // 1-based sheet row (for updates)
      taskName:   (data[i][0] || '').toString(),
      lead:       (data[i][1] || '').toString(),
      duration:   (data[i][2] || '').toString(),
      assignedTo: (data[i][3] || '').toString(),
      date:       (data[i][4] || '').toString(),
      status:     status || 'open',
      type:       type
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

  // Read the current row to get task name and type for logging
  var rowData = sheet.getRange(row, 1, 1, 7).getValues()[0];
  var taskName = (rowData[0] || '').toString();
  var type     = (rowData[6] || '').toString().trim().toLowerCase() || 'one-off';

  // Update Volunteer Signed Up (column D = 4)
  if (data.assignedTo !== undefined) {
    sheet.getRange(row, 4).setValue(data.assignedTo);
  }

  // Update Status (column F = 6)
  if (data.status !== undefined) {
    sheet.getRange(row, 6).setValue(data.status);
  }

  // Log the change
  var volunteer = data.assignedTo || (rowData[3] || '').toString();
  var status    = data.status || (rowData[5] || '').toString();
  logTaskChange_(taskName, volunteer, status, type);
}

/* ── Task Log ────────────────────────────────────────────── */

function getOrCreateLogSheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var logSheet = ss.getSheetByName(LOG_SHEET_NAME);
  if (!logSheet) {
    logSheet = ss.insertSheet(LOG_SHEET_NAME);
    logSheet.appendRow(['Timestamp', 'Task Name', 'Volunteer', 'Status', 'Type']);
    logSheet.getRange(1, 1, 1, 5).setFontWeight('bold');
  }
  return logSheet;
}

function logTaskChange_(taskName, volunteer, status, type) {
  var logSheet = getOrCreateLogSheet_();

  logSheet.appendRow([
    new Date(),
    taskName,
    volunteer,
    status,
    type
  ]);
}

/* ── Daily reset ─────────────────────────────────────────── */

/**
 * Resets all "daily" tasks: clears Volunteer Signed Up (D) and sets Status (F) to "open".
 * Logs completed daily tasks before resetting.
 * Set up a time-driven trigger to run this once per day.
 */
function resetDailyTasks_() {
  var ss    = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) return;

  var data = sheet.getDataRange().getValues();

  for (var i = 1; i < data.length; i++) {
    var type   = (data[i][6] || '').toString().trim().toLowerCase();
    var status = (data[i][5] || '').toString().trim().toLowerCase();
    if (type === 'daily') {
      var row      = i + 1;
      var taskName = (data[i][0] || '').toString();
      var volunteer = (data[i][3] || '').toString();

      // Log if it was completed or in-progress before resetting
      if (status === 'done' || status === 'in-progress') {
        logTaskChange_(taskName, volunteer, status + ' (daily reset)', type);
      }

      sheet.getRange(row, 4).setValue('');      // Clear Volunteer Signed Up
      sheet.getRange(row, 6).setValue('open');  // Reset Status
    }
  }
}

/* ── Helpers ─────────────────────────────────────────────── */

function jsonp_(callback, obj) {
  return ContentService
    .createTextOutput(callback + '(' + JSON.stringify(obj) + ');')
    .setMimeType(ContentService.MimeType.JAVASCRIPT);
}
