/**
 * Google Apps Script for North Star Kiosk — Open Tasks
 *
 * Sheet columns (Sheet1):
 *   A: Task Name | B: Lead | C: Type
 *
 * Type values: "Ongoing Need" or "One-off Need"
 * Ongoing tasks always show. One-off tasks are hidden once logged as done.
 *
 * Task Log columns (Task Log tab — auto-created):
 *   A: Timestamp | B: Task Name | C: Volunteer | D: Action | E: Type
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
var LOG_SHEET_NAME = 'Sheet2';

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
      getOrCreateLogSheet_();
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
  if (data.length < 2) return [];

  // Check the log to find which one-off tasks have been marked done today
  var doneOneOffs = getDoneOneOffsToday_();

  var tasks = [];
  for (var i = 1; i < data.length; i++) {
    var taskName = (data[i][0] || '').toString().trim();
    var lead     = (data[i][1] || '').toString().trim();
    var type     = (data[i][2] || '').toString().trim();

    if (!taskName) continue;

    // Hide one-off tasks that were completed today
    if (type === 'One-off Need' && doneOneOffs[taskName]) continue;

    tasks.push({
      row:      i + 1,
      taskName: taskName,
      lead:     lead,
      type:     type
    });
  }
  return tasks;
}

/**
 * Checks today's log entries to find one-off tasks marked as "done".
 */
function getDoneOneOffsToday_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var logSheet = ss.getSheetByName(LOG_SHEET_NAME);
  if (!logSheet) return {};

  var data = logSheet.getDataRange().getValues();
  var today = new Date();
  today.setHours(0, 0, 0, 0);

  var done = {};
  for (var i = 1; i < data.length; i++) {
    var ts = new Date(data[i][0]);
    if (ts >= today) {
      var action = (data[i][3] || '').toString().trim().toLowerCase();
      var type   = (data[i][4] || '').toString().trim();
      if (action === 'done' && type === 'One-off Need') {
        done[(data[i][1] || '').toString().trim()] = true;
      }
    }
  }
  return done;
}

/* ── POST: log a task action ─────────────────────────────── */

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);

    if (data.action === 'update-task') {
      // Read the task row to get type
      var ss    = SpreadsheetApp.getActiveSpreadsheet();
      var sheet = ss.getSheetByName(SHEET_NAME);
      var rowData = sheet.getRange(data.row, 1, 1, 3).getValues()[0];
      var taskName = (rowData[0] || '').toString();
      var type     = (rowData[2] || '').toString();

      logTaskChange_(taskName, data.volunteer || '', data.status || '', type);

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

/* ── Task Log ────────────────────────────────────────────── */

function getOrCreateLogSheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var logSheet = ss.getSheetByName(LOG_SHEET_NAME);
  if (!logSheet) {
    logSheet = ss.insertSheet(LOG_SHEET_NAME);
    logSheet.appendRow(['Timestamp', 'Task Name', 'Volunteer', 'Action', 'Type']);
    logSheet.getRange(1, 1, 1, 5).setFontWeight('bold');
  }
  return logSheet;
}

function logTaskChange_(taskName, volunteer, action, type) {
  var logSheet = getOrCreateLogSheet_();
  logSheet.appendRow([
    new Date(),
    taskName,
    volunteer,
    action,
    type
  ]);
}

/* ── Helpers ─────────────────────────────────────────────── */

function jsonp_(callback, obj) {
  return ContentService
    .createTextOutput(callback + '(' + JSON.stringify(obj) + ');')
    .setMimeType(ContentService.MimeType.JAVASCRIPT);
}
