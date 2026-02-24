const { useState, useEffect } = React;

    // Icon components
    const ArrowLeft = () => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="19" y1="12" x2="5" y2="12"></line>
        <polyline points="12 19 5 12 12 5"></polyline>
      </svg>
    );

    const Clock = ({ size = 24 }) => (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10"></circle>
        <polyline points="12 6 12 12 16 14"></polyline>
      </svg>
    );

    const Users = ({ size = 24 }) => (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
        <circle cx="9" cy="7" r="4"></circle>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
      </svg>
    );

    const Pen = ({ size = 24 }) => (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 20h9"></path>
        <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"></path>
      </svg>
    );

    const ClipboardList = ({ size = 24 }) => (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="8" y="2" width="8" height="4" rx="1"></rect>
        <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
      </svg>
    );

    const CalendarIcon = ({ size = 24 }) => (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
        <line x1="16" y1="2" x2="16" y2="6"></line>
        <line x1="8" y1="2" x2="8" y2="6"></line>
        <line x1="3" y1="10" x2="21" y2="10"></line>
      </svg>
    );

    const NorthStarKiosk = () => {
      const [screen, setScreen] = useState('main');
      const [selectedDuty, setSelectedDuty] = useState(null);
      const [selectedVolunteer, setSelectedVolunteer] = useState(null);
      const [actionSelectBackScreen, setActionSelectBackScreen] = useState('volunteer-select');
      const [customName, setCustomName] = useState('');
      const [manualHoursData, setManualHoursData] = useState({
        name: '',
        duty: 'other',
        date: '',
        useSpecificTimes: false,
        hours: '',
        startTime: '',
        endTime: ''
      });
      const [guestData, setGuestData] = useState({ name: '', guests: 1, email: '', joinList: false });
      const [outOfTownData, setOutOfTownData] = useState({
        name: '',
        startDate: '',
        endDate: '',
        notes: ''
      });
      const [wishListData, setWishListData] = useState({
        itemName: '',
        areaSupported: 'construction',
        itemLink: '',
        estimatedCost: '',
        quantity: '1'
      });
      const [lastConfirmation, setLastConfirmation] = useState(null);
      const [showCustomCheckInTime, setShowCustomCheckInTime] = useState(false);
      const [customCheckInHour, setCustomCheckInHour] = useState('');
      const [customCheckInMinute, setCustomCheckInMinute] = useState('');
      const [customCheckInMeridiem, setCustomCheckInMeridiem] = useState('AM');
      const [hoursDataSource, setHoursDataSource] = useState('local'); // local | sheets
      const [sheetLogs, setSheetLogs] = useState([]);
      const [sheetSessions, setSheetSessions] = useState([]);
      const [sheetLogsLoading, setSheetLogsLoading] = useState(false);
      const [sheetLogsError, setSheetLogsError] = useState('');
      const LOG_STORAGE_KEY = 'volunteer-logs';
      const LEGACY_LOG_STORAGE_KEY = 'volunteerLogs';
      const MAX_SHIFT_HOURS = 24;

      const [logs, setLogs] = useState(() => {
        if (typeof window === 'undefined') return [];
        const saved =
          localStorage.getItem(LOG_STORAGE_KEY) ?? localStorage.getItem(LEGACY_LOG_STORAGE_KEY);

        if (saved && !localStorage.getItem(LOG_STORAGE_KEY)) {
          try {
            localStorage.setItem(LOG_STORAGE_KEY, saved);
          } catch (error) {
            console.error('Error migrating logs:', error);
          }
        }
        return saved ? JSON.parse(saved) : [];
      });

      useEffect(() => {
        try {
          localStorage.setItem(LOG_STORAGE_KEY, JSON.stringify(logs));
        } catch (error) {
          console.error('Error saving logs:', error);
        }
      }, [logs]);

      const [selectedVolunteerForHours, setSelectedVolunteerForHours] = useState(null);
      const [commentText, setCommentText] = useState('');
      const TASKS_CACHE_KEY = 'open-tasks-cache';
      const [tasks, setTasks] = useState(() => {
        if (typeof window === 'undefined') return [];
        try {
          const raw = localStorage.getItem(TASKS_CACHE_KEY);
          if (!raw) return [];
          const parsed = JSON.parse(raw);
          return Array.isArray(parsed?.tasks) ? parsed.tasks : [];
        } catch {
          return [];
        }
      });
      const [tasksLoading, setTasksLoading] = useState(false);
      const [tasksError, setTasksError] = useState('');
      const [lastTasksSyncAt, setLastTasksSyncAt] = useState(() => {
        if (typeof window === 'undefined') return 0;
        try {
          const raw = localStorage.getItem(TASKS_CACHE_KEY);
          if (!raw) return 0;
          const parsed = JSON.parse(raw);
          return Number(parsed?.syncedAt) || 0;
        } catch {
          return 0;
        }
      });
      const [selectedTask, setSelectedTask] = useState(null);
      const [taskSignupName, setTaskSignupName] = useState('');
      const TASK_ASSIGNMENTS_STORAGE_KEY = 'task-assignments';
      const [taskAssignments, setTaskAssignments] = useState(() => {
        if (typeof window === 'undefined') return [];
        try {
          const raw = localStorage.getItem(TASK_ASSIGNMENTS_STORAGE_KEY);
          if (!raw) return [];
          const parsed = JSON.parse(raw);
          return Array.isArray(parsed) ? parsed : [];
        } catch {
          return [];
        }
      });
      const [checkoutPendingTasks, setCheckoutPendingTasks] = useState([]);

      useEffect(() => {
        try {
          localStorage.setItem(TASK_ASSIGNMENTS_STORAGE_KEY, JSON.stringify(taskAssignments));
        } catch (error) {
          console.error('Error saving task assignments:', error);
        }
      }, [taskAssignments]);

      const VOLUNTEER_SHEET_URL = 'https://script.google.com/macros/s/AKfycbwbVk0SB6geUv4xcbxkps06qXwkggMfrD59GMlC_0gRRjQ8p4rr4FNCqgEeY04RrAU_/exec';
      const GUEST_FEEDBACK_SHEET_URL = 'https://script.google.com/macros/s/AKfycbzcjKJHX7g_NSx9yHgF3hTr3qUNfQJ0xSjJEqRXEUc7SqtKBsNvsMW7cOC3qcawRbdx/exec';
      const OOT_NOTICE_SHEET_URL = 'https://script.google.com/macros/s/AKfycbzcuMhZ1h15zP7IgYhyCBChgkx_mbe23G6756V2_lHNT1grfgKR-AuZxbHt3t806h8-/exec';
      const OPEN_TASKS_SHEET_URL = 'https://script.google.com/macros/s/AKfycby3eHEUf-azuXfXgzyytQSdxgegin6ObbUzjTQ4FjfshrptAtYVz3Hs7rwV8-VHB-IQ/exec';

      const dutyAreas = {
        construction: ['Bec Freeman', 'Tom Milam', 'Andy Wright', 'Gary Emanuel', 'Mike French', 'Desert Powell', 'Dennis Westcot', 'Jim Borrelli', 'Mark Hermes', 'Chuck Carroll', 'Mike Frasu', 'Larry Joseph', 'Louis Vianni', 'Bob Parker', 'Vince LoFranco', 'Kenneth Hunter', 'Frank Robinson'],
        board: ['Paula Campbell', 'Wyn Spiller', 'Ken Underwood', 'Rick Panos', 'Jeff Cereghino', 'Rich Hill'],
        landscape: ['Mike Frasu', 'Nadine Kapper', 'Deanna Bloom', 'Bob Parker', 'Mark Hermes'],
        docents: ['Rich', 'Susan', 'Tony', 'Gailynne', 'Zoe Toffaleti'],
        interiors: ['Bec Freeman', 'Lois Hensel', 'Lisa Robinson'],
        events: ['Gerrie Kopec', 'Barb Kusha', 'Derek Cheeseman', 'Vince LoFranco'],
        volunteerExchange: ['Vince LoFranco', 'Diana Cushway', 'Other']
      };

      const dutyLabels = {
        construction: 'Construction',
        board: 'Board Member',
        landscape: 'Grounds',
        docents: 'Docent',
        interiors: 'Interiors',
        events: 'Events Team',
        volunteerExchange: 'Volunteer Exchange',
        other: 'Other'
      };

      useEffect(() => {
        loadLogs();
      }, []);

      const loadLogs = async () => {
        // First load from localStorage for instant display
        try {
          const stored =
            localStorage.getItem(LOG_STORAGE_KEY) ?? localStorage.getItem(LEGACY_LOG_STORAGE_KEY);
          if (stored) {
            setLogs(JSON.parse(stored));
          }
        } catch (error) {
          console.log('No existing logs found');
        }

        // Then sync from Google Sheets to get latest data from all devices
        try {
          const remoteLogs = await fetchVolunteerLogsFromSheet();
          if (remoteLogs && remoteLogs.length > 0) {
            setLogs(remoteLogs);
            localStorage.setItem(LOG_STORAGE_KEY, JSON.stringify(remoteLogs));
          }
        } catch (error) {
          console.log('Could not sync from Google Sheets, using local data:', error);
        }
      };

      const saveLogs = (newLogs) => {
        try {
          setLogs(newLogs);
        } catch (error) {
          console.error('Error saving logs:', error);
        }
      };

      const getShiftStatus = (volunteerName) => {
        const volunteerLogs = logs
          .filter((log) => log.name === volunteerName && log.type === 'volunteer')
          .slice()
          .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

        let lastCheckIn = null;
        let lastCheckInDuty = '';
        let lastCheckOut = null;

        for (const log of volunteerLogs) {
          const ts = new Date(log.timestamp);
          if (Number.isNaN(ts.getTime())) continue;

          if (log.action === 'check-in') {
            lastCheckIn = ts;
            lastCheckInDuty = log.duty || '';
          }
          if (log.action === 'check-out') lastCheckOut = ts;
        }

        const maxShiftMs = MAX_SHIFT_HOURS * 60 * 60 * 1000;
        const isCheckedIn =
          !!lastCheckIn &&
          (!lastCheckOut || lastCheckIn > lastCheckOut) &&
          Date.now() - lastCheckIn.getTime() <= maxShiftMs;

        return { isCheckedIn, lastCheckIn, lastCheckInDuty };
      };

      const getOnSiteVolunteers = () => {
        const names = new Set(
          logs
            .filter((log) => log.type === 'volunteer' && typeof log.name === 'string' && log.name.trim())
            .map((log) => log.name)
        );

        return Array.from(names)
          .map((name) => {
            const status = getShiftStatus(name);
            if (!status.isCheckedIn || !status.lastCheckIn) return null;
            return { name, duty: status.lastCheckInDuty, since: status.lastCheckIn };
          })
          .filter(Boolean)
          .sort((a, b) => a.since - b.since);
      };

      const sendToGoogleSheet = async (entry) => {
        try {
          let url = '';
          if (entry.type === 'volunteer') {
            url = VOLUNTEER_SHEET_URL;
          } else if (entry.type === 'guest' || entry.type === 'comment' || entry.type === 'wish-list') {
            url = GUEST_FEEDBACK_SHEET_URL;
          } else if (entry.type === 'out-of-town') {
            url = OOT_NOTICE_SHEET_URL;
          }

          if (url) {
            await fetch(url, {
              redirect: 'follow',
              method: 'POST',
              mode: 'no-cors',
              headers: {
                'Content-Type': 'text/plain;charset=utf-8',
              },
              body: JSON.stringify(entry)
            });
          }
        } catch (error) {
          console.error('Error sending to Google Sheets:', error);
        }
      };

      const jsonp = (url, timeoutMs = 12000) => {
        return new Promise((resolve, reject) => {
          const callbackName = `__jsonp_cb_${Date.now()}_${Math.random().toString(16).slice(2)}`;
          const script = document.createElement('script');
          const timeout = setTimeout(() => {
            cleanup();
            reject(new Error('Request timed out'));
          }, timeoutMs);

          const cleanup = () => {
            clearTimeout(timeout);
            try {
              delete window[callbackName];
            } catch (e) {
              window[callbackName] = undefined;
            }
            if (script.parentNode) script.parentNode.removeChild(script);
          };

          window[callbackName] = (data) => {
            cleanup();
            resolve(data);
          };

          script.onerror = () => {
            cleanup();
            reject(new Error('Failed to load script'));
          };

          const sep = url.includes('?') ? '&' : '?';
          script.src = `${url}${sep}callback=${callbackName}`;
          document.head.appendChild(script);
        });
      };

      const fetchVolunteerLogsFromSheet = async () => {
        const result = await jsonp(`${VOLUNTEER_SHEET_URL}?action=list-volunteer-logs`);
        if (!result || result.ok !== true || !Array.isArray(result.logs)) {
          throw new Error('Unexpected response from Sheets endpoint');
        }
        return result.logs;
      };

      const fetchVolunteerSessionsFromSheet = async () => {
        const result = await jsonp(`${VOLUNTEER_SHEET_URL}?action=list-sessions`);
        if (!result || result.ok !== true || !Array.isArray(result.sessions)) {
          throw new Error('Unexpected response from Sheets sessions endpoint');
        }
        return result.sessions;
      };

      const fetchTasksFromSheet = async () => {
        if (!OPEN_TASKS_SHEET_URL) return [];
        const result = await jsonp(`${OPEN_TASKS_SHEET_URL}?action=list-tasks`);
        if (!result || result.ok !== true || !Array.isArray(result.tasks)) {
          throw new Error('Unexpected response from Tasks endpoint');
        }
        return result.tasks;
      };

      const updateTaskOnSheet = async (task) => {
        if (!OPEN_TASKS_SHEET_URL) return;
        try {
          await fetch(OPEN_TASKS_SHEET_URL, {
            redirect: 'follow',
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify(task)
          });
        } catch (error) {
          console.error('Error updating task on sheet:', error);
        }
      };

      const upsertTaskAssignment = (task, volunteer, status = 'in-progress') => {
        const name = (volunteer || '').trim();
        const nameKey = name.toLowerCase();
        if (!task || !nameKey) return;
        const now = new Date().toISOString();
        setTaskAssignments((prev) => {
          const idx = prev.findIndex((entry) => {
            const entryKey = (entry.volunteerKey || (entry.volunteer || '').trim().toLowerCase());
            return entry.row === task.row && entryKey === nameKey;
          });
          const next = {
            row: task.row,
            taskName: task.taskName,
            type: task.type || '',
            volunteer: name,
            volunteerKey: nameKey,
            status,
            updatedAt: now
          };
          if (idx >= 0) {
            return prev.map((entry, i) => (i === idx ? { ...entry, ...next } : entry));
          }
          return [...prev, next];
        });
      };

      const clearTaskAssignment = (taskRow, volunteer) => {
        const name = (volunteer || '').trim();
        const nameKey = name.toLowerCase();
        if (!nameKey) return;
        setTaskAssignments((prev) =>
          prev.filter((entry) => {
            const entryKey = (entry.volunteerKey || (entry.volunteer || '').trim().toLowerCase());
            return !(entry.row === taskRow && entryKey === nameKey);
          })
        );
      };

      const getActiveAssignmentsForVolunteer = (volunteerName) => {
        const name = (volunteerName || '').trim();
        const nameKey = name.toLowerCase();
        if (!nameKey) return [];
        return taskAssignments.filter(
          (entry) => {
            const entryKey = (entry.volunteerKey || (entry.volunteer || '').trim().toLowerCase());
            return entryKey === nameKey && entry.status === 'in-progress';
          }
        );
      };

      useEffect(() => {
        if (screen !== 'hours-view' || !selectedVolunteerForHours) return;

        let cancelled = false;
        (async () => {
          setSheetLogsError('');
          setSheetLogs([]);
          setSheetSessions([]);
          setHoursDataSource('local');

          setSheetLogsLoading(true);
          try {
            const remoteSessions = await fetchVolunteerSessionsFromSheet();
            if (cancelled) return;
            setSheetSessions(remoteSessions);
            setHoursDataSource('sheets');
          } catch (error) {
            try {
              const remoteLogs = await fetchVolunteerLogsFromSheet();
              if (cancelled) return;
              setSheetLogs(remoteLogs);
              setHoursDataSource('sheets');
            } catch (error2) {
              if (cancelled) return;
              setSheetLogsError(
                "Couldn't load hours from Google Sheets (read endpoint not enabled yet). Showing local kiosk data."
              );
            }
          } finally {
            if (!cancelled) setSheetLogsLoading(false);
          }
        })();

        return () => {
          cancelled = true;
        };
      }, [screen, selectedVolunteerForHours]);

      const loadTasks = ({ background = false } = {}) => {
        let cancelled = false;
        const shouldShowBlockingLoader = !background || tasks.length === 0;
        if (shouldShowBlockingLoader) setTasksLoading(true);
        setTasksError('');
        fetchTasksFromSheet()
          .then((result) => {
            if (!cancelled) {
              setTasks(result);
              const syncedAt = Date.now();
              setLastTasksSyncAt(syncedAt);
              try {
                localStorage.setItem(
                  TASKS_CACHE_KEY,
                  JSON.stringify({ syncedAt, tasks: result })
                );
              } catch (error) {
                console.error('Error caching tasks:', error);
              }
            }
          })
          .catch((err) => {
            if (!cancelled) setTasksError('Could not load tasks. Please try again.');
            console.error('Error fetching tasks:', err);
          })
          .finally(() => {
            if (!cancelled && shouldShowBlockingLoader) setTasksLoading(false);
          });
        return () => { cancelled = true; };
      };

      // Preload tasks on app startup
      useEffect(() => {
        loadTasks();
      }, []);

      // Refresh when navigating to open-tasks screen
      useEffect(() => {
        if (screen === 'open-tasks') {
          const isFresh = Date.now() - lastTasksSyncAt < 60 * 1000;
          if (!isFresh) loadTasks({ background: true });
        }
      }, [screen, lastTasksSyncAt]);

      const addLog = (entry) => {
        const newLogs = [...logs, entry];
        saveLogs(newLogs);
        sendToGoogleSheet(entry);
      };

      const openActionSelect = (volunteer, backScreen = 'volunteer-select') => {
        setSelectedVolunteer(volunteer);
        setActionSelectBackScreen(backScreen);
        setScreen('action-select');
      };

      const handleVolunteerAction = (action, timestampOverride = null) => {
        const name = selectedVolunteer === 'other' ? customName : selectedVolunteer;
        const timestamp = timestampOverride || new Date().toISOString();
        const fallbackDuty = getShiftStatus(name).lastCheckInDuty;
        
        const entry = {
          timestamp,
          name,
          type: 'volunteer',
          duty: dutyLabels[selectedDuty] || fallbackDuty || dutyLabels.other,
          action
        };
        
        addLog(entry);
        setLastConfirmation({ type: 'volunteer', action, name });
        setShowCustomCheckInTime(false);
        setCustomCheckInHour('');
        setCustomCheckInMinute('');
        setCustomCheckInMeridiem('AM');
        
        if (action === 'check-out') {
          setScreen('checkout-confirmation');
        } else {
          setScreen('confirmation');
        }
        
        setTimeout(() => {
          resetToMain();
        }, 3000);
      };

      const handleGuestSubmit = () => {
        const timestamp = new Date().toISOString();
        
        const entry = {
          timestamp,
          name: guestData.name,
          type: 'guest',
          guests: guestData.guests,
          email: guestData.email,
          joinList: guestData.joinList,
          action: 'visit'
        };
        
        addLog(entry);
        setLastConfirmation({ type: 'guest' });
        setScreen('confirmation');
        setTimeout(() => {
          resetToMain();
        }, 2000);
      };

      const handleCommentSubmit = async () => {
        if (!commentText.trim()) return;
        
        const timestamp = new Date().toISOString();
        const entry = {
          timestamp,
          type: 'comment',
          comment: commentText,
          action: 'submitted'
        };
        
        addLog(entry);
        setLastConfirmation({ type: 'comment' });
        setScreen('confirmation');
        setTimeout(() => {
          resetToMain();
        }, 2000);
      };

      const handleOutOfTownSubmit = async () => {
        if (!outOfTownData.name.trim() || !outOfTownData.startDate || !outOfTownData.endDate) return;

        const entry = {
          timestamp: new Date().toISOString(),
          type: 'out-of-town',
          action: 'oot_notice',
          entry: {
            name: outOfTownData.name,
            date1: outOfTownData.startDate,
            date2: outOfTownData.endDate,
            notes: outOfTownData.notes
          }
        };

        addLog(entry);
        setLastConfirmation({ type: 'out-of-town' });
        setScreen('confirmation');
        setTimeout(() => {
          resetToMain();
        }, 2000);
      };

      const handleWishListSubmit = () => {
        const itemName = wishListData.itemName.trim();
        const itemLink = wishListData.itemLink.trim();
        const estimatedCost = wishListData.estimatedCost.toString().trim();
        const quantity = wishListData.quantity.toString().trim();

        const entry = {
          timestamp: new Date().toISOString(),
          type: 'wish-list',
          action: 'wishlist-item',
          entry: {
            itemName,
            areaSupported: dutyLabels[wishListData.areaSupported] || dutyLabels.other,
            itemLink,
            estimatedCost,
            quantity
          }
        };

        addLog(entry);
        setLastConfirmation({ type: 'wish-list', itemName });
        setScreen('confirmation');
        setTimeout(() => {
          resetToMain();
        }, 2000);
      };

      const buildLocalIso = (dateStr, timeStr) => {
        const value = new Date(`${dateStr}T${timeStr}:00`);
        return Number.isNaN(value.getTime()) ? null : value.toISOString();
      };

      const handleManualHoursSubmit = () => {
        const name = manualHoursData.name.trim();
        if (!name || !manualHoursData.date) return;

        const duty = dutyLabels[manualHoursData.duty] || dutyLabels.other;
        let checkInIso = null;
        let checkOutIso = null;

        if (manualHoursData.useSpecificTimes) {
          if (!manualHoursData.startTime || !manualHoursData.endTime) return;
          checkInIso = buildLocalIso(manualHoursData.date, manualHoursData.startTime);
          checkOutIso = buildLocalIso(manualHoursData.date, manualHoursData.endTime);
          if (!checkInIso || !checkOutIso) return;
          if (new Date(checkOutIso) <= new Date(checkInIso)) return;
        } else {
          const enteredHours = Number(manualHoursData.hours);
          if (!Number.isFinite(enteredHours) || enteredHours <= 0 || enteredHours > 12) return;

          checkInIso = buildLocalIso(manualHoursData.date, '09:00');
          if (!checkInIso) return;
          checkOutIso = new Date(new Date(checkInIso).getTime() + enteredHours * 60 * 60 * 1000).toISOString();
        }

        addLog({
          timestamp: checkInIso,
          name,
          type: 'volunteer',
          duty,
          action: 'check-in',
          source: 'manual-hours'
        });
        addLog({
          timestamp: checkOutIso,
          name,
          type: 'volunteer',
          duty,
          action: 'check-out',
          source: 'manual-hours'
        });

        setLastConfirmation({ type: 'manual-hours', name });
        setScreen('confirmation');
        setTimeout(() => {
          resetToMain();
        }, 2000);
      };

      const resetToMain = () => {
        setScreen('main');
        setSelectedDuty(null);
        setSelectedVolunteer(null);
        setActionSelectBackScreen('volunteer-select');
        setCustomName('');
        setGuestData({ name: '', guests: 1, email: '', joinList: false });
        setOutOfTownData({ name: '', startDate: '', endDate: '', notes: '' });
        setWishListData({
          itemName: '',
          areaSupported: 'construction',
          itemLink: '',
          estimatedCost: '',
          quantity: '1'
        });
        setSelectedVolunteerForHours(null);
        setCommentText('');
        setLastConfirmation(null);
        setShowCustomCheckInTime(false);
        setCustomCheckInHour('');
        setCustomCheckInMinute('');
        setCustomCheckInMeridiem('AM');
        setSelectedTask(null);
        setTaskSignupName('');
        setCheckoutPendingTasks([]);
        setManualHoursData({
          name: '',
          duty: 'other',
          date: '',
          useSpecificTimes: false,
          hours: '',
          startTime: '',
          endTime: ''
        });
      };

      const calculateMonthlyHours = (volunteerName, sourceLogs = logs) => {
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        
        const volunteerLogs = sourceLogs.filter(log => 
          log.name === volunteerName && 
          log.type === 'volunteer' &&
          new Date(log.timestamp).getMonth() === currentMonth &&
          new Date(log.timestamp).getFullYear() === currentYear
        );

        const entries = [];
        let totalHours = 0;
        
        for (let i = 0; i < volunteerLogs.length; i++) {
          const log = volunteerLogs[i];
          
          if (log.action === 'check-in') {
            const checkOut = volunteerLogs.find((l, idx) => 
              idx > i && l.action === 'check-out' && l.name === volunteerName
            );
            
            const checkInTime = new Date(log.timestamp);
            const checkOutTime = checkOut ? new Date(checkOut.timestamp) : null;
            
            let hours = 0;
            let hoursDisplay = '';
            let checkOutDisplay = '';
            
            if (checkOutTime) {
              hours = (checkOutTime - checkInTime) / (1000 * 60 * 60);
              hoursDisplay = hours.toFixed(1);
              checkOutDisplay = checkOutTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              totalHours += hours;
            } else {
              const today = new Date();
              const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
              const isToday = checkInTime >= todayStart;
              
              if (isToday && (Date.now() - checkInTime.getTime()) < (12 * 60 * 60 * 1000)) {
                hoursDisplay = 'In Progress';
                checkOutDisplay = 'Still Checked In';
              } else {
                hours = 4;
                hoursDisplay = '4.0 (assumed)';
                checkOutDisplay = 'Missing (4hrs assumed)';
                totalHours += hours;
              }
            }
            
            entries.push({
              date: checkInTime.toLocaleDateString(),
              checkIn: checkInTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              checkOut: checkOutDisplay,
              duty: log.duty,
              hours: hoursDisplay
            });
          } else if (log.action === 'check-out') {
            const hasCheckIn = volunteerLogs.find((l, idx) => 
              idx < i && l.action === 'check-in' && l.name === volunteerName
            );
            
            if (!hasCheckIn) {
              const checkOutTime = new Date(log.timestamp);
              totalHours += 4;
              entries.push({
                date: checkOutTime.toLocaleDateString(),
                checkIn: 'Missing',
                checkOut: checkOutTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                duty: log.duty,
                hours: '4.0 (assumed)'
              });
            }
          }
        }
        
        return { totalHours: totalHours.toFixed(1), entries };
      };

      const calculateYearHoursFromLogs = (volunteerName, sourceLogs = logs) => {
        const now = new Date();
        const currentYear = now.getFullYear();

        const volunteerLogs = sourceLogs.filter(
          (log) =>
            log.name === volunteerName &&
            log.type === 'volunteer' &&
            new Date(log.timestamp).getFullYear() === currentYear
        );

        let totalHours = 0;

        for (let i = 0; i < volunteerLogs.length; i++) {
          const log = volunteerLogs[i];
          if (log.action !== 'check-in') continue;

          const checkOut = volunteerLogs.find(
            (l, idx) => idx > i && l.action === 'check-out' && l.name === volunteerName
          );

          if (!checkOut) continue;

          const checkInTime = new Date(log.timestamp);
          const checkOutTime = new Date(checkOut.timestamp);
          if (Number.isNaN(checkInTime.getTime()) || Number.isNaN(checkOutTime.getTime())) continue;

          totalHours += (checkOutTime - checkInTime) / (1000 * 60 * 60);
        }

        return totalHours.toFixed(1);
      };

      const calculateMonthAndYearFromSessions = (volunteerName, sessions) => {
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        const normalized = (sessions || [])
          .filter((s) => (s.user || s.name) === volunteerName)
          .map((s) => {
            const loginAt = new Date(s.loginAt || s.checkInAt || s.startAt);
            const logoutAt = new Date(s.logoutAt || s.checkOutAt || s.endAt);
            const durationMinutes =
              s.durationMinutes != null
                ? Number(s.durationMinutes)
                : Math.max(0, Math.round((logoutAt.getTime() - loginAt.getTime()) / 60000));
            return { loginAt, logoutAt, durationMinutes, duty: s.duty || '' };
          })
          .filter((s) => !Number.isNaN(s.loginAt.getTime()) && !Number.isNaN(s.logoutAt.getTime()));

        const monthSessions = normalized.filter(
          (s) => s.loginAt.getFullYear() === currentYear && s.loginAt.getMonth() === currentMonth
        );
        const yearSessions = normalized.filter((s) => s.loginAt.getFullYear() === currentYear);

        const monthMinutes = monthSessions.reduce((sum, s) => sum + (Number(s.durationMinutes) || 0), 0);
        const yearMinutes = yearSessions.reduce((sum, s) => sum + (Number(s.durationMinutes) || 0), 0);

        const entries = monthSessions
          .slice()
          .sort((a, b) => b.loginAt - a.loginAt)
          .map((s) => ({
            date: s.loginAt.toLocaleDateString(),
            checkIn: s.loginAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            checkOut: s.logoutAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            duty: s.duty,
            hours: (s.durationMinutes / 60).toFixed(1)
          }));

        return {
          monthHours: (monthMinutes / 60).toFixed(1),
          yearHours: (yearMinutes / 60).toFixed(1),
          entries
        };
      };

      const getAllVolunteerNames = () => {
        const allNames = new Set();
        Object.values(dutyAreas).forEach(names => {
          names.forEach(name => {
            if (name !== 'Other') allNames.add(name);
          });
        });
        logs.forEach((log) => {
          if (log?.type === 'volunteer' && typeof log.name === 'string' && log.name.trim()) {
            allNames.add(log.name.trim());
          }
        });
        return Array.from(allNames).sort();
      };

      // Main Menu
      if (screen === 'main') {
        const onSite = getOnSiteVolunteers();
        return (
        <div className="min-h-screen kiosk-screen bg-stone-50 p-3 md:p-8 flex flex-col items-center justify-center pt-20 md:pt-4">
            <div className="max-w-2xl mx-auto w-full">
              <div className="text-center mb-4 md:mb-8">
                <div className="w-12 h-12 md:w-20 md:h-20 mx-auto mb-3 md:mb-8 rounded-full flex items-center justify-center" style={{ backgroundColor: '#886c44' }}>
                  <svg
                    className="w-4 h-4 md:w-7 md:h-7"
                    viewBox="0 0 24 24"
                    fill="white"
                    aria-hidden="true"
                  >
                    <path d="M12 3.5l2.6 5.9L21 12l-6.4 2.6L12 20.5l-2.6-5.9L3 12l6.4-2.6L12 3.5z" />
                  </svg>
                </div>
                <h1 className="text-xl md:text-4xl lg:text-5xl font-serif text-stone-800 mb-2 md:mb-4 font-semibold px-2 leading-tight">Check into the North Star House!</h1>
                <p className="text-sm md:text-xl text-stone-600 px-2">Quick access to all check-in features</p>
              </div>

              <div className="space-y-3 md:space-y-6">
                <button
                  onClick={() => setScreen('duty-select')}
                  className="w-full bg-white hover:bg-stone-100 active:bg-stone-200 text-stone-800 p-3 md:p-8 rounded-3xl md:rounded-full border-2 border-stone-300 text-sm md:text-2xl font-semibold shadow-sm hover:shadow-md transition-all flex items-center gap-2 md:gap-4"
                >
                  <div className="w-8 h-8 md:w-12 md:h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Clock size={16} />
                  </div>
                  <span className="flex-1 text-left">Volunteer Sign In & Out</span>
                </button>

                <button
                  onClick={() => setScreen('on-site')}
                  className="w-full bg-white hover:bg-stone-100 active:bg-stone-200 text-stone-800 p-3 md:p-8 rounded-3xl md:rounded-full border-2 border-stone-300 text-sm md:text-2xl font-semibold shadow-sm hover:shadow-md transition-all flex items-center gap-2 md:gap-4"
                >
                  <div className="w-8 h-8 md:w-12 md:h-12 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Users size={16} />
                  </div>
                  <span className="flex-1 text-left">Who's On Site</span>
                  <span className="text-orange-700 text-sm md:text-xl font-bold">{onSite.length}</span>
                </button>

                <div className="grid grid-cols-3 gap-2 md:gap-4">
                  <button
                    onClick={() => setScreen('open-tasks')}
                    className="bg-white hover:bg-stone-100 active:bg-stone-200 text-stone-800 p-3 md:p-4 py-4 md:py-5 rounded-[2.25rem] border-2 border-stone-300 text-base md:text-2xl font-semibold shadow-sm hover:shadow-md transition-all flex flex-col items-center justify-center gap-1 md:gap-2 h-[112px] md:h-[136px]"
                  >
                    <div className="w-8 h-8 md:w-10 md:h-10 bg-purple-100 rounded-full flex items-center justify-center">
                      <span className="text-purple-600"><ClipboardList size={16} /></span>
                    </div>
                    <span className="h-9 md:h-12 flex items-center justify-center text-center leading-tight">Available Side Jobs</span>
                  </button>

                  <button
                    onClick={() => setScreen('calendar')}
                    className="bg-white hover:bg-stone-100 active:bg-stone-200 text-stone-800 p-3 md:p-4 py-4 md:py-5 rounded-[2.25rem] border-2 border-stone-300 text-base md:text-2xl font-semibold shadow-sm hover:shadow-md transition-all flex flex-col items-center justify-center gap-1 md:gap-2 h-[112px] md:h-[136px]"
                  >
                    <div className="w-8 h-8 md:w-10 md:h-10 bg-sky-100 rounded-full flex items-center justify-center">
                      <span className="text-sky-600"><CalendarIcon size={16} /></span>
                    </div>
                    <span className="h-9 md:h-12 flex items-center justify-center text-center leading-tight">Calendar</span>
                  </button>

                  <button
                    onClick={() => setScreen('other')}
                    className="bg-white hover:bg-stone-100 active:bg-stone-200 text-stone-800 p-3 md:p-4 py-4 md:py-5 rounded-[2.25rem] border-2 border-stone-300 text-base md:text-2xl font-semibold shadow-sm hover:shadow-md transition-all flex flex-col items-center justify-center gap-1 md:gap-2 h-[112px] md:h-[136px]"
                  >
                    <div className="w-8 h-8 md:w-10 md:h-10 bg-amber-100 rounded-full flex items-center justify-center">
                      <span className="text-amber-600"><Pen size={16} /></span>
                    </div>
                    <span className="h-9 md:h-12 flex items-center justify-center text-center leading-tight">Other</span>
                  </button>
                </div>

                <hr className="border-stone-300" />

                <button
                  onClick={() => setScreen('guest')}
                  className="w-full bg-white hover:bg-stone-100 active:bg-stone-200 text-stone-800 p-3 md:p-8 rounded-3xl md:rounded-full border-2 border-stone-300 text-sm md:text-2xl font-semibold shadow-sm hover:shadow-md transition-all flex items-center gap-2 md:gap-4"
                >
                  <div className="w-8 h-8 md:w-12 md:h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Pen size={16} />
                  </div>
                  <span className="flex-1 text-left">Guest Registration</span>
                </button>
              </div>
            </div>
          </div>
        );
      }

      // On-Site View
      if (screen === 'on-site') {
        const onSite = getOnSiteVolunteers();

        return (
          <div className="min-h-screen kiosk-screen bg-stone-50 px-3 sm:px-8 pt-20 sm:pt-4 pb-6 sm:pb-8">
            <div className="max-w-4xl mx-auto">
              <button
                onClick={resetToMain}
                className="mb-3 sm:mb-6 flex items-center text-stone-600 hover:text-stone-800 text-base sm:text-lg font-semibold transition-colors active:text-stone-900"
              >
                <ArrowLeft className="mr-2" /> Back
              </button>

              <h2 className="text-2xl sm:text-4xl font-serif text-stone-800 mb-2 sm:mb-4 text-center font-semibold px-2">Currently On Site</h2>
              <p className="text-base sm:text-xl text-stone-600 mb-4 sm:mb-10 text-center">{onSite.length} checked in</p>

              {onSite.length === 0 ? (
                <div className="bg-white rounded-2xl border-2 border-stone-300 shadow-sm p-8 text-center text-stone-600 text-xl">
                  No one is currently checked in.
                </div>
              ) : (
                <div className="bg-white rounded-2xl border-2 border-stone-300 shadow-sm p-6">
                  <div className="space-y-4">
                    {onSite.map((v) => (
                      <div key={v.name} className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-stone-200 pb-3 sm:pb-4 last:border-0 gap-3">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <span className="text-xl sm:text-2xl font-bold star-gold">&#9733;</span>
                          <div>
                            <div className="text-lg sm:text-xl font-semibold text-stone-800">{v.name}</div>
                            <div className="text-sm sm:text-base text-stone-600">
                              {(v.duty ? v.duty : 'Volunteer')}
                              {' '}
                              &bull; Checked in {v.since.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            openActionSelect(v.name, 'on-site');
                          }}
                          className="bg-stone-100 hover:bg-stone-200 active:bg-stone-300 text-stone-800 px-5 sm:px-6 py-2 sm:py-3 rounded-full border-2 border-stone-300 font-semibold transition-all text-sm sm:text-base w-full sm:w-auto"
                        >
                          View
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      }

      // Duty Selection
      if (screen === 'duty-select') {
        return (
          <div className="min-h-screen kiosk-screen bg-stone-50 px-3 sm:px-8 pt-20 sm:pt-4 pb-6 sm:pb-8">
            <div className="max-w-4xl mx-auto">
              <button
                onClick={resetToMain}
                className="mb-3 sm:mb-6 flex items-center text-stone-600 hover:text-stone-800 text-base sm:text-lg font-semibold transition-colors active:text-stone-900"
              >
                <ArrowLeft className="mr-2" /> Back
              </button>

              <h2 className="text-2xl sm:text-4xl font-serif text-stone-800 mb-4 sm:mb-10 text-center font-semibold px-2">Select Your Area</h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-5">
                {Object.keys(dutyAreas).map(duty => (
                  <button
                    key={duty}
                    onClick={() => {
                      setSelectedDuty(duty);
                      setScreen('volunteer-select');
                    }}
                    className="bg-white hover:bg-stone-100 active:bg-stone-200 text-stone-800 p-4 sm:p-7 rounded-3xl sm:rounded-full border-2 border-stone-300 text-base sm:text-xl font-semibold shadow-sm hover:shadow-md transition-all"
                  >
                    {dutyLabels[duty]}
                  </button>
                ))}
                <button
                  onClick={() => {
                    setSelectedDuty('other');
                    setScreen('volunteer-select');
                  }}
                  className="bg-white hover:bg-stone-100 active:bg-stone-200 text-stone-800 p-4 sm:p-7 rounded-3xl sm:rounded-full border-2 border-stone-300 text-base sm:text-xl font-semibold shadow-sm hover:shadow-md transition-all"
                >
                  Other
                </button>
              </div>
            </div>
          </div>
        );
      }

      // Volunteer Selection
      if (screen === 'volunteer-select') {
        const volunteers = selectedDuty === 'other' ? [] : dutyAreas[selectedDuty] || [];

        return (
          <div className="min-h-screen kiosk-screen bg-stone-50 px-3 sm:px-8 pt-20 sm:pt-4 pb-6 sm:pb-8">
            <div className="max-w-4xl mx-auto">
              <button
                onClick={() => setScreen('duty-select')}
                className="mb-3 sm:mb-6 flex items-center text-stone-600 hover:text-stone-800 text-base sm:text-lg font-semibold transition-colors active:text-stone-900"
              >
                <ArrowLeft className="mr-2" /> Back
              </button>

              <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif text-stone-800 mb-4 sm:mb-10 text-center font-semibold px-2">
                {selectedDuty === 'other' ? 'Enter Your Name' : `Select Volunteer - ${dutyLabels[selectedDuty]}`}
              </h2>
              
              {selectedDuty === 'other' || volunteers.length === 0 ? (
                <div className="space-y-6">
                  <input
                    type="text"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full p-6 text-xl border-2 border-stone-300 rounded-full focus:border-stone-500 focus:ring-2 focus:ring-stone-200 transition-all font-medium"
                  />
                  <button
                    onClick={() => {
                      if (customName.trim()) {
                        openActionSelect('other', 'volunteer-select');
                      }
                    }}
                    disabled={!customName.trim()}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-stone-300 text-white p-6 rounded-full text-xl font-semibold shadow-md hover:shadow-lg transition-all"
                  >
                    Continue
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  {volunteers.map(name => {
                    const isOther = name === 'Other';
                    const { isCheckedIn } = isOther ? { isCheckedIn: false } : getShiftStatus(name);
                    return (
                      <button
                        key={name}
                        onClick={() => {
                          if (isOther) {
                            setSelectedVolunteer('other');
                            setScreen('custom-name');
                            return;
                          }
                          openActionSelect(name, 'volunteer-select');
                        }}
                        className="bg-white hover:bg-stone-100 active:bg-stone-200 text-stone-800 p-5 sm:p-6 rounded-3xl sm:rounded-full border-2 border-stone-300 text-base sm:text-lg font-semibold shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2"
                      >
                        {isCheckedIn && <span className="text-lg sm:text-xl font-bold" style={{ color: '#FFD700' }}>&#9733;</span>}
                        <span>{name}</span>
                      </button>
                    );
                  })}
                  {selectedDuty !== 'volunteerExchange' && (
                    <button
                      onClick={() => {
                        setSelectedVolunteer('other');
                        setScreen('custom-name');
                      }}
                      className="bg-stone-100 hover:bg-stone-200 active:bg-stone-300 text-stone-800 p-5 sm:p-6 rounded-3xl sm:rounded-full border-2 border-stone-300 text-base sm:text-lg font-semibold shadow-sm hover:shadow-md transition-all col-span-1 sm:col-span-2"
                    >
                      Other
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      }

      // Custom Name Entry
      if (screen === 'custom-name') {
        return (
          <div className="min-h-screen kiosk-screen bg-stone-50 px-3 sm:px-8 pt-20 sm:pt-4 pb-6 sm:pb-8">
            <div className="max-w-4xl mx-auto">
              <button
                onClick={() => setScreen(selectedDuty ? 'volunteer-select' : 'on-site')}
                className="mb-6 flex items-center text-stone-600 hover:text-stone-800 text-lg font-semibold transition-colors"
              >
                <ArrowLeft className="mr-2" /> Back
              </button>
              
              <h2 className="text-4xl font-serif text-stone-800 mb-10 text-center font-semibold">Enter Your Name</h2>
              
              <div className="space-y-6">
                <input
                  type="text"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full p-6 text-xl border-2 border-stone-300 rounded-full focus:border-stone-500 focus:ring-2 focus:ring-stone-200 transition-all font-medium"
                />
                <button
                  onClick={() => {
                    if (customName.trim()) {
                      setActionSelectBackScreen(selectedDuty ? 'volunteer-select' : 'on-site');
                      setScreen('action-select');
                    }
                  }}
                  disabled={!customName.trim()}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-stone-300 text-white p-6 rounded-full text-xl font-semibold shadow-md hover:shadow-lg transition-all"
                >
                  Continue
                </button>
              </div>
            </div>
          </div>
        );
      }

      // Check In/Out Action
      if (screen === 'action-select') {
        const volunteerName = selectedVolunteer === 'other' ? customName : selectedVolunteer;
        const displayDuty = dutyLabels[selectedDuty] || getShiftStatus(volunteerName).lastCheckInDuty || dutyLabels.other;
        const now = new Date();

        const today = new Date();
        const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        
        const todayLogs = logs.filter(log => 
          log.name === volunteerName && 
          log.type === 'volunteer' &&
          new Date(log.timestamp) >= todayStart
        );
        
       let todayHours = 0;
for (let i = 0; i < todayLogs.length; i++) {
  const log = todayLogs[i];
  if (log.action === 'check-in') {
    const checkOut = todayLogs.find((l, idx) => 
      idx > i && l.action === 'check-out'
    );
    if (checkOut) {
      const checkInTime = new Date(log.timestamp);
      const checkOutTime = new Date(checkOut.timestamp);
      const milliseconds = checkOutTime - checkInTime;
      const hours = milliseconds / (1000 * 60 * 60);
      todayHours += hours;
    }
  }
}
        
        const { isCheckedIn: isCurrentlyCheckedIn } = getShiftStatus(volunteerName);
        const activeAssignments = getActiveAssignmentsForVolunteer(volunteerName);

        let customCheckInIso = null;
        let customCheckInError = '';
        const hourRaw = customCheckInHour.trim();
        const minuteRaw = customCheckInMinute.trim();
        const hasAnyCustomTimeInput = hourRaw || minuteRaw;
        if (showCustomCheckInTime && hasAnyCustomTimeInput) {
          const hour = Number(hourRaw);
          const minute = Number(minuteRaw);
          const isValid =
            Number.isInteger(hour) &&
            Number.isInteger(minute) &&
            hour >= 1 &&
            hour <= 12 &&
            minute >= 0 &&
            minute <= 59;

          if (!isValid) {
            customCheckInError = 'Enter time as hour (1-12) and minute (00-59).';
          } else {
            const hours24 =
              customCheckInMeridiem === 'PM'
                ? (hour % 12) + 12
                : hour % 12;
            const candidate = new Date(now);
            candidate.setHours(hours24, minute, 0, 0);
            if (candidate.getTime() > now.getTime()) {
              customCheckInError = 'Please choose a time that is not in the future.';
            } else {
              customCheckInIso = candidate.toISOString();
            }
          }
        }
        
        return (
          <div className="min-h-screen kiosk-screen bg-stone-50 px-3 sm:px-8 pt-20 sm:pt-4 pb-6 sm:pb-8">
            <div className="max-w-4xl mx-auto">
              <button
                onClick={() => setScreen(actionSelectBackScreen || 'volunteer-select')}
                className="mb-3 sm:mb-6 flex items-center text-stone-600 hover:text-stone-800 text-base sm:text-lg font-semibold transition-colors active:text-stone-900"
              >
                <ArrowLeft className="mr-2" /> Back
              </button>

              <h2 className="text-2xl sm:text-4xl font-serif text-stone-800 mb-2 sm:mb-4 text-center font-semibold px-2">
                {volunteerName}
              </h2>
              <p className="text-base sm:text-xl text-stone-600 mb-2 text-center px-2">{displayDuty}</p>

              {isCurrentlyCheckedIn && (
                <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-3 sm:p-4 mb-4 sm:mb-6 text-center mx-2">
                  <p className="text-green-700 font-semibold text-base sm:text-lg"><span className="star-gold">?</span> Currently Checked In</p>
                </div>
              )}

              {!isCurrentlyCheckedIn && todayHours > 0 && (
                <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-3 sm:p-4 mb-4 sm:mb-6 text-center mx-2">
                  <p className="text-blue-700 font-semibold text-base sm:text-lg">Today's Hours: {todayHours.toFixed(1)}</p>
                </div>
              )}

              <div className="grid gap-3 sm:gap-6">
                {!isCurrentlyCheckedIn && (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <button
                        onClick={() => handleVolunteerAction('check-in')}
                        className="p-4 sm:p-8 rounded-3xl sm:rounded-full border-2 text-lg sm:text-2xl font-semibold shadow-sm transition-all bg-white hover:bg-stone-100 active:bg-stone-200 text-stone-800 border-stone-300 hover:shadow-md"
                      >
                        Sign In (Now)
                      </button>

                      <button
                        onClick={() => setShowCustomCheckInTime(true)}
                        className="p-4 sm:p-8 rounded-3xl sm:rounded-full border-2 text-lg sm:text-2xl font-semibold shadow-sm transition-all bg-stone-100 hover:bg-stone-200 active:bg-stone-300 text-stone-800 border-stone-300 hover:shadow-md"
                      >
                        Sign In (Different Time)
                      </button>
                    </div>

                    {showCustomCheckInTime && (
                      <div className="bg-white rounded-2xl border-2 border-stone-300 p-6">
                        <div className="space-y-4">
                          <label className="block text-lg font-semibold text-stone-700">
                            Enter check-in time (today)
                          </label>
                          <div className="flex items-center gap-3">
                            <input
                              type="text"
                              inputMode="numeric"
                              maxLength={2}
                              placeholder="H"
                              value={customCheckInHour}
                              onChange={(e) => setCustomCheckInHour(e.target.value.replace(/\D/g, '').slice(0, 2))}
                              className="w-full p-4 text-lg border-2 border-stone-300 rounded-full focus:border-stone-500 focus:ring-2 focus:ring-stone-200 transition-all text-center"
                            />
                            <span className="text-2xl font-semibold text-stone-600">:</span>
                            <input
                              type="text"
                              inputMode="numeric"
                              maxLength={2}
                              placeholder="MM"
                              value={customCheckInMinute}
                              onChange={(e) => setCustomCheckInMinute(e.target.value.replace(/\D/g, '').slice(0, 2))}
                              className="w-full p-4 text-lg border-2 border-stone-300 rounded-full focus:border-stone-500 focus:ring-2 focus:ring-stone-200 transition-all text-center"
                            />
                            <select
                              value={customCheckInMeridiem}
                              onChange={(e) => setCustomCheckInMeridiem(e.target.value)}
                              className="w-28 p-4 text-lg border-2 border-stone-300 rounded-full focus:border-stone-500 focus:ring-2 focus:ring-stone-200 transition-all bg-white"
                            >
                              <option value="AM">AM</option>
                              <option value="PM">PM</option>
                            </select>
                          </div>
                          {customCheckInError && (
                            <div className="text-red-700 font-semibold">{customCheckInError}</div>
                          )}
                          <div className="grid grid-cols-2 gap-4">
                            <button
                              onClick={() => {
                                setShowCustomCheckInTime(false);
                                setCustomCheckInHour('');
                                setCustomCheckInMinute('');
                                setCustomCheckInMeridiem('AM');
                              }}
                              className="w-full bg-stone-100 hover:bg-stone-200 text-stone-800 p-6 rounded-full border-2 border-stone-300 text-xl font-semibold transition-all"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => handleVolunteerAction('check-in', customCheckInIso)}
                              disabled={!customCheckInIso}
                              className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-stone-300 text-white p-6 rounded-full text-xl font-semibold shadow-md hover:shadow-lg transition-all"
                            >
                              Confirm
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}
                
                <button
                  onClick={() => {
                    if (activeAssignments.length > 0) {
                      setCheckoutPendingTasks(activeAssignments);
                      setScreen('checkout-task-status');
                      return;
                    }
                    handleVolunteerAction('check-out');
                  }}
                  disabled={!isCurrentlyCheckedIn}
                  className={`p-4 sm:p-8 rounded-3xl sm:rounded-full border-2 text-lg sm:text-2xl font-semibold shadow-sm transition-all ${
                    !isCurrentlyCheckedIn
                      ? 'bg-gray-100 text-gray-400 border-gray-300 cursor-not-allowed'
                      : 'bg-white hover:bg-stone-100 active:bg-stone-200 text-stone-800 border-stone-300 hover:shadow-md'
                  }`}
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        );
      }

      // Task Status At Sign Out
      if (screen === 'checkout-task-status') {
        const volunteerName = selectedVolunteer === 'other' ? customName : selectedVolunteer;
        const currentTask = checkoutPendingTasks[0];

        const handleCheckoutTaskStatus = (status) => {
          if (!currentTask) {
            handleVolunteerAction('check-out');
            return;
          }

          const volunteer = (volunteerName || '').trim();
          updateTaskOnSheet({
            action: 'update-task',
            row: currentTask.row,
            volunteer,
            completedBy: volunteer,
            name: volunteer,
            status
          });

          if (status === 'done') {
            clearTaskAssignment(currentTask.row, volunteer);
            setTasks((prev) => prev.filter((t) => t.row !== currentTask.row || t.type === 'Ongoing Need'));
          } else {
            upsertTaskAssignment(currentTask, volunteer, 'in-progress');
          }

          setCheckoutPendingTasks((prev) => {
            const remaining = prev.slice(1);
            if (remaining.length === 0) {
              handleVolunteerAction('check-out');
            }
            return remaining;
          });
        };

        if (!currentTask) {
          return (
            <div className="min-h-screen kiosk-screen bg-stone-50 px-3 sm:px-8 pt-20 sm:pt-4 pb-6 sm:pb-8">
              <div className="max-w-4xl mx-auto">
                <button
                  onClick={() => setScreen('action-select')}
                  className="mb-3 sm:mb-6 flex items-center text-stone-600 hover:text-stone-800 text-base sm:text-lg font-semibold transition-colors active:text-stone-900"
                >
                  <ArrowLeft className="mr-2" /> Back
                </button>
                <div className="bg-white rounded-2xl border-2 border-stone-300 shadow-sm p-5 sm:p-8 text-center">
                  <p className="text-lg sm:text-2xl text-stone-700 mb-6">No active task signups found.</p>
                  <button
                    onClick={() => handleVolunteerAction('check-out')}
                    className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-4 rounded-full text-lg font-semibold shadow-md hover:shadow-lg transition-all"
                  >
                    Continue Sign Out
                  </button>
                </div>
              </div>
            </div>
          );
        }

        return (
          <div className="min-h-screen kiosk-screen bg-stone-50 px-3 sm:px-8 pt-20 sm:pt-4 pb-6 sm:pb-8">
            <div className="max-w-4xl mx-auto">
              <button
                onClick={() => setScreen('action-select')}
                className="mb-3 sm:mb-6 flex items-center text-stone-600 hover:text-stone-800 text-base sm:text-lg font-semibold transition-colors active:text-stone-900"
              >
                <ArrowLeft className="mr-2" /> Back
              </button>

              <h2 className="text-2xl sm:text-4xl font-serif text-stone-800 mb-4 sm:mb-8 text-center font-semibold px-2">
                Task Status
              </h2>

              <div className="bg-white rounded-2xl border-2 border-stone-300 shadow-sm p-5 sm:p-8">
                <p className="text-sm sm:text-base text-stone-500 text-center mb-2">
                  {volunteerName}
                </p>
                <p className="text-lg sm:text-2xl text-stone-700 text-center mb-2">
                  "{currentTask.taskName}"
                </p>
                <p className="text-base sm:text-lg text-stone-600 text-center mb-6 sm:mb-8">
                  What's the status of this task?
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <button
                    onClick={() => handleCheckoutTaskStatus('done')}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white p-4 sm:p-6 rounded-full text-lg sm:text-xl font-semibold shadow-md hover:shadow-lg transition-all"
                  >
                    Completed
                  </button>
                  <button
                    onClick={() => handleCheckoutTaskStatus('in-progress')}
                    className="w-full bg-white hover:bg-stone-100 active:bg-stone-200 text-stone-800 p-4 sm:p-6 rounded-full text-lg sm:text-xl font-semibold border-2 border-stone-300 shadow-sm hover:shadow-md transition-all"
                  >
                    Still In Progress
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      }

      // Guest Registration
      if (screen === 'guest') {
        return (
          <div className="min-h-screen kiosk-screen bg-stone-50 px-3 sm:px-8 pt-20 sm:pt-4 pb-6 sm:pb-8">
            <div className="max-w-4xl mx-auto">
              <button
                onClick={resetToMain}
                className="mb-3 sm:mb-6 flex items-center text-stone-600 hover:text-stone-800 text-base sm:text-lg font-semibold transition-colors active:text-stone-900"
              >
                <ArrowLeft className="mr-2" /> Back
              </button>

              <h2 className="text-2xl sm:text-4xl font-serif text-stone-800 mb-4 sm:mb-8 text-center font-semibold px-2">Guest Registration</h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-lg font-semibold text-stone-700 mb-2">Name</label>
                  <input
                    type="text"
                    value={guestData.name}
                    onChange={(e) => setGuestData({ ...guestData, name: e.target.value })}
                    className="w-full p-4 text-lg border-2 border-stone-300 rounded-full focus:border-stone-500 focus:ring-2 focus:ring-stone-200 transition-all"
                    placeholder="Enter name"
                  />
                </div>
                
                <div>
                  <label className="block text-base sm:text-lg font-semibold text-stone-700 mb-2">Number of Guests</label>
                  <div className="grid grid-cols-5 gap-2 sm:gap-3">
                    {[1, 2, 3, 4, 5].map(num => (
                      <button
                        key={num}
                        onClick={() => setGuestData({ ...guestData, guests: num })}
                        className={`p-3 sm:p-4 rounded-full text-lg sm:text-xl font-semibold transition-all border-2 ${
                          guestData.guests === num
                            ? 'bg-emerald-600 text-white border-emerald-600'
                            : 'bg-white hover:bg-stone-100 active:bg-stone-200 text-stone-700 border-stone-300'
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="block text-lg font-semibold text-stone-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={guestData.email}
                    onChange={(e) => setGuestData({ ...guestData, email: e.target.value })}
                    className="w-full p-4 text-lg border-2 border-stone-300 rounded-full focus:border-stone-500 focus:ring-2 focus:ring-stone-200 transition-all"
                    placeholder="Enter email"
                  />
                </div>
                
                <div>
                  <label className="block text-base sm:text-lg font-semibold text-stone-700 mb-3">Join our email list?</label>
                  <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    <button
                      onClick={() => setGuestData({ ...guestData, joinList: true })}
                      className={`p-5 sm:p-6 rounded-3xl sm:rounded-full text-lg sm:text-xl font-semibold transition-all border-2 ${
                        guestData.joinList
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'bg-white hover:bg-stone-100 active:bg-stone-200 text-stone-700 border-stone-300'
                      }`}
                    >
                      Yes
                    </button>
                    <button
                      onClick={() => setGuestData({ ...guestData, joinList: false })}
                      className={`p-5 sm:p-6 rounded-3xl sm:rounded-full text-lg sm:text-xl font-semibold transition-all border-2 ${
                        !guestData.joinList
                          ? 'bg-stone-400 text-white border-stone-400'
                          : 'bg-white hover:bg-stone-100 active:bg-stone-200 text-stone-700 border-stone-300'
                      }`}
                    >
                      No
                    </button>
                  </div>
                </div>
                
                <button
                  onClick={handleGuestSubmit}
                  disabled={!guestData.name.trim()}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-stone-300 text-white p-6 rounded-full text-xl font-semibold shadow-md hover:shadow-lg transition-all mt-8"
                >
                  Submit
                </button>
              </div>
            </div>
          </div>
        );
      }

      // Other Menu
      if (screen === 'other') {
        return (
          <div className="min-h-screen kiosk-screen bg-stone-50 px-3 sm:px-8 pt-20 sm:pt-4 pb-6 sm:pb-8">
            <div className="max-w-4xl mx-auto">
              <button
                onClick={resetToMain}
                className="mb-3 sm:mb-6 flex items-center text-stone-600 hover:text-stone-800 text-base sm:text-lg font-semibold transition-colors active:text-stone-900"
              >
                <ArrowLeft className="mr-2" /> Back
              </button>

              <h2 className="text-2xl sm:text-4xl font-serif text-stone-800 mb-4 sm:mb-8 text-center font-semibold px-2">Other Options</h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-6">
                <button
                  onClick={() => setScreen('manual-hours')}
                  className="w-full bg-white hover:bg-stone-100 active:bg-stone-200 text-stone-800 p-4 sm:p-8 rounded-3xl sm:rounded-full border-2 border-stone-300 text-base sm:text-2xl font-semibold shadow-sm hover:shadow-md transition-all"
                >
                  Add Missed Hours
                </button>
                <button
                  onClick={() => setScreen('hours-select')}
                  className="w-full bg-white hover:bg-stone-100 active:bg-stone-200 text-stone-800 p-4 sm:p-8 rounded-3xl sm:rounded-full border-2 border-stone-300 text-base sm:text-2xl font-semibold shadow-sm hover:shadow-md transition-all"
                >
                  View Volunteer Hours
                </button>
                <button
                  onClick={() => setScreen('out-of-town')}
                  className="w-full bg-white hover:bg-stone-100 active:bg-stone-200 text-stone-800 p-4 sm:p-8 rounded-3xl sm:rounded-full border-2 border-stone-300 text-base sm:text-2xl font-semibold shadow-sm hover:shadow-md transition-all"
                >
                  Out of Town Notice
                </button>
                <button
                  onClick={() => setScreen('forms')}
                  className="w-full bg-white hover:bg-stone-100 active:bg-stone-200 text-stone-800 p-4 sm:p-8 rounded-3xl sm:rounded-full border-2 border-stone-300 text-base sm:text-2xl font-semibold shadow-sm hover:shadow-md transition-all"
                >
                  Fillable Forms
                </button>
                <button
                  onClick={() => setScreen('wish-list')}
                  className="w-full bg-white hover:bg-stone-100 active:bg-stone-200 text-stone-800 p-4 sm:p-8 rounded-3xl sm:rounded-full border-2 border-stone-300 text-base sm:text-2xl font-semibold shadow-sm hover:shadow-md transition-all"
                >
                  Add to Wish List
                </button>
                <button
                  onClick={() => setScreen('comment')}
                  className="w-full bg-white hover:bg-stone-100 active:bg-stone-200 text-stone-800 p-4 sm:p-8 rounded-3xl sm:rounded-full border-2 border-stone-300 text-base sm:text-2xl font-semibold shadow-sm hover:shadow-md transition-all"
                >
                  Anonymous Request / Comment
                </button>
                <a
                  href="https://drive.google.com/drive/folders/1sQmw-Gw65-SSp786cZG9-zNFEsz8jb5e?dmr=1&ec=wgc-drive-globalnav-goto"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full bg-white hover:bg-stone-100 active:bg-stone-200 text-stone-800 p-4 sm:p-8 rounded-3xl sm:rounded-full border-2 border-stone-300 text-base sm:text-2xl font-semibold shadow-sm hover:shadow-md transition-all text-center"
                >
                  Archival Photo Collection
                </a>
                <a
                  href="https://drive.google.com/drive/folders/1RCHJ0EYEOB1Oe5JyGy4podWp0JsWk7YK?usp=drive_link"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full bg-white hover:bg-stone-100 active:bg-stone-200 text-stone-800 p-4 sm:p-8 rounded-3xl sm:rounded-full border-2 border-stone-300 text-base sm:text-2xl font-semibold shadow-sm hover:shadow-md transition-all text-center"
                >
                  Other Volunteer Resources
                </a>
              </div>
            </div>
          </div>
        );
      }

      // Open Tasks Screen
      if (screen === 'open-tasks') {
        return (
          <div className="min-h-screen kiosk-screen bg-stone-50 px-3 sm:px-8 pt-20 sm:pt-4 pb-6 sm:pb-8">
            <div className="max-w-4xl mx-auto">
              <button
                onClick={resetToMain}
                className="mb-3 sm:mb-6 flex items-center text-stone-600 hover:text-stone-800 text-base sm:text-lg font-semibold transition-colors active:text-stone-900"
              >
                <ArrowLeft className="mr-2" /> Back
              </button>

              <h2 className="text-2xl sm:text-4xl font-serif text-stone-800 mb-4 sm:mb-8 text-center font-semibold px-2">Open Tasks</h2>

              {tasksLoading && tasks.length === 0 && (
                <div className="text-center text-stone-600 text-lg py-12">Loading tasks...</div>
              )}

              {tasksLoading && tasks.length > 0 && (
                <div className="text-center text-stone-500 text-sm py-2">Refreshing tasks...</div>
              )}

              {tasksError && (
                <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-4 mb-6 text-center text-amber-800 font-semibold">
                  {tasksError}
                </div>
              )}

              {!tasksError && tasks.length === 0 && (
                <div className="bg-white rounded-2xl border-2 border-stone-300 shadow-sm p-8 text-center text-stone-600 text-xl">
                  No open tasks right now.
                </div>
              )}

              {tasks.length > 0 && (
                <div className="space-y-3 sm:space-y-4">
                  {tasks.map((task, idx) => {
                    const inProgressNames = Array.from(
                      new Set(
                        taskAssignments
                          .filter((entry) => entry.row === task.row && entry.status === 'in-progress')
                          .map((entry) => entry.volunteer)
                      )
                    );

                    return (
                      <button
                        key={idx}
                        onClick={() => {
                          setSelectedTask(task);
                          setTaskSignupName(selectedVolunteer === 'other' ? customName : selectedVolunteer || '');
                          setScreen('task-detail');
                        }}
                        className="w-full bg-white hover:bg-stone-100 active:bg-stone-200 text-stone-800 p-4 sm:p-6 rounded-2xl border-2 border-stone-300 shadow-sm hover:shadow-md transition-all text-left"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <div className="text-lg sm:text-xl font-semibold text-stone-800">{task.taskName}</div>
                            {task.lead && (
                              <div className="text-sm sm:text-base text-stone-600 mt-1">Lead: {task.lead}</div>
                            )}
                            {inProgressNames.length > 0 && (
                              <div className="text-sm sm:text-base text-blue-700 mt-1">
                                In Progress: {inProgressNames.join(', ')}
                              </div>
                            )}
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs sm:text-sm font-semibold flex-shrink-0 ${
                            task.type === 'Ongoing Need' ? 'bg-blue-50 text-blue-700' : 'bg-stone-100 text-stone-600'
                          }`}>
                            {task.type || 'One-off Need'}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              <button
                onClick={resetToMain}
                className="w-full mt-4 sm:mt-6 bg-white hover:bg-stone-100 active:bg-stone-200 text-stone-800 p-4 sm:p-5 rounded-full text-base sm:text-lg font-semibold border-2 border-stone-300 shadow-sm hover:shadow-md transition-all"
              >
                Back
              </button>
            </div>
          </div>
        );
      }

      // Wish List Entry
      if (screen === 'wish-list') {
        return (
          <div className="min-h-screen kiosk-screen bg-stone-50 px-3 sm:px-8 pt-20 sm:pt-4 pb-6 sm:pb-8">
            <div className="max-w-4xl mx-auto">
              <button
                onClick={() => setScreen('other')}
                className="mb-3 sm:mb-6 flex items-center text-stone-600 hover:text-stone-800 text-base sm:text-lg font-semibold transition-colors active:text-stone-900"
              >
                <ArrowLeft className="mr-2" /> Back
              </button>

              <h2 className="text-2xl sm:text-4xl font-serif text-stone-800 mb-2 sm:mb-4 text-center font-semibold px-2">
                Add to Wish List
              </h2>
              <p className="text-base sm:text-lg text-stone-600 text-center mb-4 sm:mb-8 px-2">
                Submit an item to feature in the newsletter and website wish list.
              </p>

              <div className="bg-white rounded-2xl border-2 border-stone-300 shadow-sm p-5 sm:p-8 space-y-5 sm:space-y-6">
                <div>
                  <label className="block text-base sm:text-lg font-semibold text-stone-700 mb-2">Item Name</label>
                  <input
                    type="text"
                    value={wishListData.itemName}
                    onChange={(e) => setWishListData({ ...wishListData, itemName: e.target.value })}
                    className="w-full p-4 text-lg border-2 border-stone-300 rounded-full focus:border-stone-500 focus:ring-2 focus:ring-stone-200 transition-all"
                    placeholder="Enter item name"
                  />
                </div>

                <div>
                  <label className="block text-base sm:text-lg font-semibold text-stone-700 mb-2">Area Supported</label>
                  <select
                    value={wishListData.areaSupported}
                    onChange={(e) => setWishListData({ ...wishListData, areaSupported: e.target.value })}
                    className="w-full p-4 text-lg border-2 border-stone-300 rounded-full focus:border-stone-500 focus:ring-2 focus:ring-stone-200 transition-all bg-white"
                  >
                    {Object.keys(dutyLabels).map((key) => (
                      <option key={key} value={key}>
                        {dutyLabels[key]}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-base sm:text-lg font-semibold text-stone-700 mb-2">Link</label>
                  <input
                    type="url"
                    value={wishListData.itemLink}
                    onChange={(e) => setWishListData({ ...wishListData, itemLink: e.target.value })}
                    className="w-full p-4 text-lg border-2 border-stone-300 rounded-full focus:border-stone-500 focus:ring-2 focus:ring-stone-200 transition-all"
                    placeholder="https://..."
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-base sm:text-lg font-semibold text-stone-700 mb-2">Estimated Cost ($)</label>
                    <input
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={wishListData.estimatedCost}
                      onChange={(e) => setWishListData({ ...wishListData, estimatedCost: e.target.value })}
                      className="w-full p-4 text-lg border-2 border-stone-300 rounded-full focus:border-stone-500 focus:ring-2 focus:ring-stone-200 transition-all"
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <label className="block text-base sm:text-lg font-semibold text-stone-700 mb-2">Quantity</label>
                    <input
                      type="number"
                      min="1"
                      step="1"
                      value={wishListData.quantity}
                      onChange={(e) => setWishListData({ ...wishListData, quantity: e.target.value })}
                      className="w-full p-4 text-lg border-2 border-stone-300 rounded-full focus:border-stone-500 focus:ring-2 focus:ring-stone-200 transition-all"
                    />
                  </div>
                </div>

                <button
                  onClick={handleWishListSubmit}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white p-5 sm:p-6 rounded-full text-lg sm:text-xl font-semibold shadow-md hover:shadow-lg transition-all"
                >
                  Submit Wish List Item
                </button>

                <button
                  onClick={() => setScreen('other')}
                  className="w-full bg-white hover:bg-stone-100 active:bg-stone-200 text-stone-800 p-4 sm:p-5 rounded-full text-base sm:text-lg font-semibold border-2 border-stone-300 shadow-sm hover:shadow-md transition-all"
                >
                  Back
                </button>
              </div>
            </div>
          </div>
        );
      }

      // Manual Hours Entry
      if (screen === 'manual-hours') {
        const manualHoursNameSuggestions = getAllVolunteerNames();
        const canSubmitDateAndHours =
          manualHoursData.name.trim() &&
          manualHoursData.date &&
          Number(manualHoursData.hours) > 0 &&
          Number(manualHoursData.hours) <= 12;
        const canSubmitDateAndTime =
          manualHoursData.name.trim() &&
          manualHoursData.date &&
          manualHoursData.startTime &&
          manualHoursData.endTime &&
          manualHoursData.endTime > manualHoursData.startTime;
        const canSubmit = manualHoursData.useSpecificTimes ? canSubmitDateAndTime : canSubmitDateAndHours;

        return (
          <div className="min-h-screen kiosk-screen bg-stone-50 px-3 sm:px-8 pt-20 sm:pt-4 pb-6 sm:pb-8">
            <div className="max-w-4xl mx-auto">
              <button
                onClick={() => setScreen('other')}
                className="mb-3 sm:mb-6 flex items-center text-stone-600 hover:text-stone-800 text-base sm:text-lg font-semibold transition-colors active:text-stone-900"
              >
                <ArrowLeft className="mr-2" /> Back
              </button>

              <h2 className="text-2xl sm:text-4xl font-serif text-stone-800 mb-2 sm:mb-4 text-center font-semibold px-2">
                Add Missed Volunteer Hours
              </h2>
              <p className="text-base sm:text-lg text-stone-600 text-center mb-4 sm:mb-8 px-2">
                Add hours that were not entered at check-in/check-out time.
              </p>

              <div className="bg-white rounded-2xl border-2 border-stone-300 shadow-sm p-5 sm:p-8 space-y-5 sm:space-y-6">
                <div>
                  <label className="block text-base sm:text-lg font-semibold text-stone-700 mb-2">Volunteer Name</label>
                  <input
                    type="text"
                    value={manualHoursData.name}
                    onChange={(e) => setManualHoursData({ ...manualHoursData, name: e.target.value })}
                    list="manual-hours-volunteer-names"
                    autoComplete="off"
                    className="w-full p-4 text-lg border-2 border-stone-300 rounded-full focus:border-stone-500 focus:ring-2 focus:ring-stone-200 transition-all"
                    placeholder="Enter name"
                  />
                  <datalist id="manual-hours-volunteer-names">
                    {manualHoursNameSuggestions.map((name) => (
                      <option key={name} value={name} />
                    ))}
                  </datalist>
                </div>

                <div>
                  <label className="block text-base sm:text-lg font-semibold text-stone-700 mb-2">Area</label>
                  <select
                    value={manualHoursData.duty}
                    onChange={(e) => setManualHoursData({ ...manualHoursData, duty: e.target.value })}
                    className="w-full p-4 text-lg border-2 border-stone-300 rounded-full focus:border-stone-500 focus:ring-2 focus:ring-stone-200 transition-all bg-white"
                  >
                    {Object.keys(dutyLabels).map((key) => (
                      <option key={key} value={key}>
                        {dutyLabels[key]}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-base sm:text-lg font-semibold text-stone-700 mb-2">Date</label>
                  <input
                    type="date"
                    value={manualHoursData.date}
                    onChange={(e) => setManualHoursData({ ...manualHoursData, date: e.target.value })}
                    className="w-full p-4 text-lg border-2 border-stone-300 rounded-full focus:border-stone-500 focus:ring-2 focus:ring-stone-200 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-base sm:text-lg font-semibold text-stone-700 mb-2">Entry Type</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      onClick={() => setManualHoursData({ ...manualHoursData, useSpecificTimes: false })}
                      className={`w-full p-4 rounded-2xl border-2 text-base sm:text-lg font-semibold transition-all ${
                        !manualHoursData.useSpecificTimes
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'bg-white text-stone-800 border-stone-300 hover:bg-stone-100 active:bg-stone-200'
                      }`}
                    >
                      Date + Hours
                    </button>
                    <button
                      onClick={() => setManualHoursData({ ...manualHoursData, useSpecificTimes: true })}
                      className={`w-full p-4 rounded-2xl border-2 text-base sm:text-lg font-semibold transition-all ${
                        manualHoursData.useSpecificTimes
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'bg-white text-stone-800 border-stone-300 hover:bg-stone-100 active:bg-stone-200'
                      }`}
                    >
                      Date + Time
                    </button>
                  </div>
                </div>

                {manualHoursData.useSpecificTimes ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-base sm:text-lg font-semibold text-stone-700 mb-2">Start Time</label>
                      <input
                        type="time"
                        value={manualHoursData.startTime}
                        onChange={(e) => setManualHoursData({ ...manualHoursData, startTime: e.target.value })}
                        className="w-full p-4 text-lg border-2 border-stone-300 rounded-full focus:border-stone-500 focus:ring-2 focus:ring-stone-200 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-base sm:text-lg font-semibold text-stone-700 mb-2">End Time</label>
                      <input
                        type="time"
                        value={manualHoursData.endTime}
                        onChange={(e) => setManualHoursData({ ...manualHoursData, endTime: e.target.value })}
                        className="w-full p-4 text-lg border-2 border-stone-300 rounded-full focus:border-stone-500 focus:ring-2 focus:ring-stone-200 transition-all"
                      />
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="block text-base sm:text-lg font-semibold text-stone-700 mb-2">Total Hours</label>
                    <input
                      type="number"
                      min="0.5"
                      max="12"
                      step="0.5"
                      value={manualHoursData.hours}
                      onChange={(e) => setManualHoursData({ ...manualHoursData, hours: e.target.value })}
                      className="w-full p-4 text-lg border-2 border-stone-300 rounded-full focus:border-stone-500 focus:ring-2 focus:ring-stone-200 transition-all"
                      placeholder="Example: 3.5"
                    />
                    <p className="text-sm text-stone-500 mt-2">When using Date + Hours, check-in is set to 9:00 AM on that date.</p>
                  </div>
                )}

                <button
                  onClick={handleManualHoursSubmit}
                  disabled={!canSubmit}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-stone-300 text-white p-5 sm:p-6 rounded-full text-lg sm:text-xl font-semibold shadow-md hover:shadow-lg transition-all"
                >
                  Add Hours
                </button>
              </div>
            </div>
          </div>
        );
      }

      // Task Detail Screen
      if (screen === 'task-detail' && selectedTask) {
        const onSiteVolunteers = getOnSiteVolunteers().map((v) => v.name);

        const handleTaskAction = (action) => {
          const volunteer = taskSignupName.trim();
          if (!volunteer) return;
          updateTaskOnSheet({
            action: 'update-task',
            row: selectedTask.row,
            volunteer,
            completedBy: volunteer,
            name: volunteer,
            status: action
          });

          if (action === 'in-progress') {
            upsertTaskAssignment(selectedTask, volunteer, 'in-progress');
            resetToMain();
            return;
          }

          if (action === 'done') {
            clearTaskAssignment(selectedTask.row, volunteer);
            setTasks((prev) => prev.filter((t) => t.row !== selectedTask.row || t.type === 'Ongoing Need'));
          }
          setLastConfirmation({ type: 'task-done', taskName: selectedTask.taskName });
          setScreen('confirmation');
          setTimeout(() => resetToMain(), 2000);
        };

        return (
          <div className="min-h-screen kiosk-screen bg-stone-50 px-3 sm:px-8 pt-20 sm:pt-4 pb-6 sm:pb-8">
            <div className="max-w-4xl mx-auto">
              <button
                onClick={() => {
                  setSelectedTask(null);
                  setScreen('open-tasks');
                }}
                className="mb-3 sm:mb-6 flex items-center text-stone-600 hover:text-stone-800 text-base sm:text-lg font-semibold transition-colors active:text-stone-900"
              >
                <ArrowLeft className="mr-2" /> Back
              </button>

              <h2 className="text-2xl sm:text-4xl font-serif text-stone-800 mb-2 sm:mb-4 text-center font-semibold px-2">
                {selectedTask.taskName}
              </h2>

              <div className="bg-white rounded-2xl border-2 border-stone-300 shadow-sm p-5 sm:p-8 mb-4 sm:mb-6">
                <div className="space-y-3 text-base sm:text-lg">
                  {selectedTask.lead && (
                    <div><span className="font-semibold text-stone-700">Lead:</span> {selectedTask.lead}</div>
                  )}
                  <div>
                    <span className="font-semibold text-stone-700">Type:</span>{' '}
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                      selectedTask.type === 'Ongoing Need' ? 'bg-blue-50 text-blue-700' : 'bg-stone-100 text-stone-600'
                    }`}>
                      {selectedTask.type || 'One-off Need'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl border-2 border-stone-300 shadow-sm p-5 sm:p-8 mb-4 sm:mb-6">
                <h3 className="text-xl sm:text-2xl font-serif text-stone-800 mb-4 font-semibold">Sign Up For This Task</h3>
                {onSiteVolunteers.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 mb-4">
                    {onSiteVolunteers.map((name) => (
                      <button
                        key={name}
                        onClick={() => setTaskSignupName(name)}
                        className={`p-3 sm:p-4 rounded-2xl sm:rounded-full border-2 text-sm sm:text-base font-semibold transition-all ${
                          taskSignupName === name
                            ? 'bg-emerald-600 text-white border-emerald-600'
                            : 'bg-white hover:bg-stone-100 active:bg-stone-200 text-stone-800 border-stone-300'
                        }`}
                      >
                        {name}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="mb-4 text-sm sm:text-base text-stone-600 text-center">
                    No volunteers are currently checked in.
                  </div>
                )}
                <input
                  type="text"
                  value={taskSignupName}
                  onChange={(e) => setTaskSignupName(e.target.value)}
                  placeholder="Or type your name"
                  className="w-full p-4 text-lg border-2 border-stone-300 rounded-full focus:border-stone-500 focus:ring-2 focus:ring-stone-200 transition-all mb-4"
                />
                <button
                  onClick={() => handleTaskAction('in-progress')}
                  disabled={!taskSignupName.trim()}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-stone-300 text-white p-5 sm:p-6 rounded-full text-lg sm:text-xl font-semibold shadow-md hover:shadow-lg transition-all"
                >
                  Sign Up
                </button>
              </div>

              <button
                onClick={() => {
                  setSelectedTask(null);
                  setScreen('open-tasks');
                }}
                className="w-full bg-white hover:bg-stone-100 active:bg-stone-200 text-stone-800 p-4 sm:p-5 rounded-full text-base sm:text-lg font-semibold border-2 border-stone-300 shadow-sm hover:shadow-md transition-all"
              >
                Back
              </button>
            </div>
          </div>
        );
      }

      // Calendar Screen
      if (screen === 'calendar') {
        return (
          <div className="min-h-screen kiosk-screen bg-stone-50 px-3 sm:px-8 pt-20 sm:pt-4 pb-6 sm:pb-8">
            <div className="max-w-4xl mx-auto">
              <button
                onClick={resetToMain}
                className="mb-3 sm:mb-6 flex items-center text-stone-600 hover:text-stone-800 text-base sm:text-lg font-semibold transition-colors active:text-stone-900"
              >
                <ArrowLeft className="mr-2" /> Back
              </button>

              <h2 className="text-2xl sm:text-4xl font-serif text-stone-800 mb-4 sm:mb-8 text-center font-semibold px-2">Calendar</h2>

              <div className="w-full flex justify-center">
                <iframe
                  src="https://calendar.google.com/calendar/embed?src=thenorthstarhouse%40gmail.com&ctz=America%2FLos_Angeles&mode=AGENDA"
                  style={{ border: 0 }}
                  width="800"
                  height="600"
                  frameBorder="0"
                  scrolling="no"
                  className="max-w-full rounded-2xl"
                ></iframe>
              </div>
            </div>
          </div>
        );
      }

      // Comment/Request Screen
      if (screen === 'comment') {
        return (
          <div className="min-h-screen kiosk-screen bg-stone-50 px-3 sm:px-8 pt-20 sm:pt-4 pb-6 sm:pb-8">
            <div className="max-w-4xl mx-auto">
              <button
                onClick={() => setScreen('other')}
                className="mb-3 sm:mb-6 flex items-center text-stone-600 hover:text-stone-800 text-base sm:text-lg font-semibold transition-colors active:text-stone-900"
              >
                <ArrowLeft className="mr-2" /> Back
              </button>

              <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif text-stone-800 mb-2 sm:mb-4 text-center font-semibold px-2">Anonymous Request / Comment</h2>
              <p className="text-base sm:text-lg text-stone-600 text-center mb-4 sm:mb-8 px-2">Your submission will be completely anonymous</p>
              
              <div className="space-y-6">
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Enter your request or comment here..."
                  rows={8}
                  className="w-full p-6 text-lg border-2 border-stone-300 rounded-2xl focus:border-stone-500 focus:ring-2 focus:ring-stone-200 transition-all font-medium resize-none"
                />
                
                <button
                  onClick={handleCommentSubmit}
                  disabled={!commentText.trim()}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-stone-300 text-white p-6 rounded-full text-xl font-semibold shadow-md hover:shadow-lg transition-all"
                >
                  Submit
                </button>
              </div>
            </div>
          </div>
        );
      }

      // Fillable Forms
      if (screen === 'forms') {
        return (
          <div className="min-h-screen kiosk-screen bg-stone-50 px-3 sm:px-8 pt-20 sm:pt-4 pb-6 sm:pb-8">
            <div className="max-w-4xl mx-auto">
              <button
                onClick={() => setScreen('other')}
                className="mb-3 sm:mb-6 flex items-center text-stone-600 hover:text-stone-800 text-base sm:text-lg font-semibold transition-colors active:text-stone-900"
              >
                <ArrowLeft className="mr-2" /> Back
              </button>

              <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif text-stone-800 mb-4 sm:mb-8 text-center font-semibold px-2">Fillable Forms</h2>

              <div className="space-y-3 sm:space-y-6">
                <a
                  href="https://drive.google.com/file/d/1cNGysqW__wS2IEKDaNzG1MPo-5JCE-ay/view?usp=drive_link"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full bg-white hover:bg-stone-100 active:bg-stone-200 text-stone-800 p-4 sm:p-8 rounded-3xl sm:rounded-full border-2 border-stone-300 text-base sm:text-2xl font-semibold shadow-sm hover:shadow-md transition-all text-center"
                >
                  In-Kind Donation Form
                </a>
                <a
                  href="https://drive.google.com/file/d/1Vkfh6Z5eM1RPUtw6j8mQjqKM71-YFPrW/view?usp=drive_link"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full bg-white hover:bg-stone-100 active:bg-stone-200 text-stone-800 p-4 sm:p-8 rounded-3xl sm:rounded-full border-2 border-stone-300 text-base sm:text-2xl font-semibold shadow-sm hover:shadow-md transition-all text-center"
                >
                  Reimbursement Form
                </a>
                <a
                  href="https://drive.google.com/file/d/1_-AcaquXeK-O1x9AOubbQNCwoLWzu3f_/view?usp=drive_link"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full bg-white hover:bg-stone-100 active:bg-stone-200 text-stone-800 p-4 sm:p-8 rounded-3xl sm:rounded-full border-2 border-stone-300 text-base sm:text-2xl font-semibold shadow-sm hover:shadow-md transition-all text-center"
                >
                  Board Submission Form
                </a>
                <a
                  href="https://drive.google.com/file/d/1UNzWO6b_-YbKd_rYUxC5GkA2dRQVfcg-/view?usp=drive_link"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full bg-white hover:bg-stone-100 active:bg-stone-200 text-stone-800 p-4 sm:p-8 rounded-3xl sm:rounded-full border-2 border-stone-300 text-base sm:text-2xl font-semibold shadow-sm hover:shadow-md transition-all text-center"
                >
                  Incident & Injury Form
                </a>
              </div>
            </div>
          </div>
        );
      }

      // Out of Town Notice
      if (screen === 'out-of-town') {
        return (
          <div className="min-h-screen kiosk-screen bg-stone-50 px-3 sm:px-8 pt-20 sm:pt-4 pb-6 sm:pb-8">
            <div className="max-w-4xl mx-auto">
              <button
                onClick={() => setScreen('other')}
                className="mb-3 sm:mb-6 flex items-center text-stone-600 hover:text-stone-800 text-base sm:text-lg font-semibold transition-colors active:text-stone-900"
              >
                <ArrowLeft className="mr-2" /> Back
              </button>

              <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif text-stone-800 mb-2 sm:mb-4 text-center font-semibold px-2">Out of Town Notice</h2>
              <p className="text-base sm:text-lg text-stone-600 text-center mb-4 sm:mb-8 px-2">Let us know when you will be away.</p>

              <div className="space-y-6">
                <div>
                  <label className="block text-lg font-semibold text-stone-700 mb-2">Name</label>
                  <input
                    type="text"
                    value={outOfTownData.name}
                    onChange={(e) => setOutOfTownData({ ...outOfTownData, name: e.target.value })}
                    className="w-full p-4 text-lg border-2 border-stone-300 rounded-full focus:border-stone-500 focus:ring-2 focus:ring-stone-200 transition-all"
                    placeholder="Enter name"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-lg font-semibold text-stone-700 mb-2">Start Date</label>
                    <input
                      type="date"
                      value={outOfTownData.startDate}
                      onChange={(e) => setOutOfTownData({ ...outOfTownData, startDate: e.target.value })}
                      className="w-full p-4 text-lg border-2 border-stone-300 rounded-full focus:border-stone-500 focus:ring-2 focus:ring-stone-200 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-lg font-semibold text-stone-700 mb-2">End Date</label>
                    <input
                      type="date"
                      value={outOfTownData.endDate}
                      onChange={(e) => setOutOfTownData({ ...outOfTownData, endDate: e.target.value })}
                      className="w-full p-4 text-lg border-2 border-stone-300 rounded-full focus:border-stone-500 focus:ring-2 focus:ring-stone-200 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-lg font-semibold text-stone-700 mb-2">Notes (optional)</label>
                  <textarea
                    value={outOfTownData.notes}
                    onChange={(e) => setOutOfTownData({ ...outOfTownData, notes: e.target.value })}
                    placeholder="Add any notes..."
                    rows={6}
                    className="w-full p-4 text-lg border-2 border-stone-300 rounded-2xl focus:border-stone-500 focus:ring-2 focus:ring-stone-200 transition-all font-medium resize-none"
                  />
                </div>

                <button
                  onClick={handleOutOfTownSubmit}
                  disabled={!outOfTownData.name.trim() || !outOfTownData.startDate || !outOfTownData.endDate}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-stone-300 text-white p-6 rounded-full text-xl font-semibold shadow-md hover:shadow-lg transition-all mt-4"
                >
                  Submit
                </button>
              </div>
            </div>
          </div>
        );
      }

      // Hours - Volunteer Selection
      if (screen === 'hours-select') {
        const allVolunteers = getAllVolunteerNames();

        return (
          <div className="min-h-screen kiosk-screen bg-stone-50 px-3 sm:px-8 pt-20 sm:pt-4 pb-6 sm:pb-8">
            <div className="max-w-4xl mx-auto">
              <button
                onClick={() => setScreen('other')}
                className="mb-3 sm:mb-6 flex items-center text-stone-600 hover:text-stone-800 text-base sm:text-lg font-semibold transition-colors active:text-stone-900"
              >
                <ArrowLeft className="mr-2" /> Back
              </button>

              <h2 className="text-2xl sm:text-4xl font-serif text-stone-800 mb-4 sm:mb-8 text-center font-semibold px-2">Select Volunteer</h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {allVolunteers.map(name => (
                  <button
                    key={name}
                    onClick={() => {
                      setSelectedVolunteerForHours(name);
                      setScreen('hours-view');
                    }}
                    className="bg-white hover:bg-stone-100 active:bg-stone-200 text-stone-800 p-5 sm:p-6 rounded-3xl sm:rounded-full border-2 border-stone-300 text-base sm:text-lg font-semibold shadow-sm hover:shadow-md transition-all"
                  >
                    {name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        );
      }

      // Hours View
      if (screen === 'hours-view') {
        const hasSessions = hoursDataSource === 'sheets' && sheetSessions.length > 0;
        const hasLogs = hoursDataSource === 'sheets' && sheetLogs.length > 0;

        const { monthHours, yearHours, entries } = hasSessions
          ? calculateMonthAndYearFromSessions(selectedVolunteerForHours, sheetSessions)
          : (() => {
              const effectiveLogs = hasLogs ? sheetLogs : logs;
              const { totalHours, entries } = calculateMonthlyHours(selectedVolunteerForHours, effectiveLogs);
              const yearHours = calculateYearHoursFromLogs(selectedVolunteerForHours, effectiveLogs);
              return { monthHours: totalHours, yearHours, entries };
            })();
        
        return (
          <div className="min-h-screen kiosk-screen bg-stone-50 px-3 sm:px-8 pt-20 sm:pt-4 pb-6 sm:pb-8">
            <div className="max-w-6xl mx-auto">
              <button
                onClick={() => {
                  setSelectedVolunteerForHours(null);
                  setScreen('hours-select');
                }}
                className="mb-6 flex items-center text-stone-600 hover:text-stone-800 text-lg font-semibold transition-colors"
              >
                <ArrowLeft className="mr-2" /> Back
              </button>
              
              <h2 className="text-4xl font-serif text-stone-800 mb-4 text-center font-semibold">{selectedVolunteerForHours}</h2>
              <div className="text-center text-stone-600 mb-6">
                {sheetLogsLoading ? 'Loading hours from Google Sheets...' : `Hours source: ${hoursDataSource}`}
              </div>
              {sheetLogsError && (
                <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-4 mb-6 text-center text-amber-800 font-semibold">
                  {sheetLogsError}
                </div>
              )}
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
                <div className="bg-emerald-600 text-white p-6 sm:p-8 rounded-2xl text-center">
                  <p className="text-xl sm:text-2xl mb-2 font-normal">This Month</p>
                  <p className="text-5xl sm:text-6xl font-serif font-semibold">{monthHours}</p>
                </div>
                <div className="bg-sky-600 text-white p-6 sm:p-8 rounded-2xl text-center">
                  <p className="text-xl sm:text-2xl mb-2 font-normal">This Year</p>
                  <p className="text-5xl sm:text-6xl font-serif font-semibold">{yearHours}</p>
                </div>
              </div>
              
              <div className="bg-white rounded-2xl border-2 border-stone-300 shadow-sm p-6">
                <h3 className="text-2xl font-serif text-stone-800 mb-4 font-semibold">Individual Entries</h3>
                {entries.length === 0 ? (
                  <p className="text-stone-600 text-center py-8">No entries for this month</p>
                ) : (
                  <div className="space-y-3 sm:space-y-4">
                    {entries.map((entry, idx) => (
                      <div key={idx} className="border-b border-stone-200 pb-3 sm:pb-4 last:border-0">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 text-base sm:text-lg">
                          <div>
                            <span className="font-semibold text-stone-700">Date:</span> {entry.date}
                          </div>
                          <div>
                            <span className="font-semibold text-stone-700">Hours:</span> {entry.hours}
                          </div>
                          <div>
                            <span className="font-semibold text-stone-700">Check-In:</span> {entry.checkIn}
                          </div>
                          <div>
                            <span className="font-semibold text-stone-700">Check-Out:</span> {entry.checkOut}
                          </div>
                          <div className="col-span-1 sm:col-span-2">
                            <span className="font-semibold text-stone-700">Area:</span> {entry.duty}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      }

      // Confirmation
      if (screen === 'confirmation') {
        return (
          <div className="min-h-screen kiosk-screen bg-stone-50 p-4 sm:p-8 flex items-start justify-center pt-20 sm:pt-6">
            <div className="w-full max-w-4xl">
              <button
                onClick={resetToMain}
                className="mb-3 sm:mb-6 flex items-center text-stone-600 hover:text-stone-800 text-base sm:text-lg font-semibold transition-colors active:text-stone-900"
              >
                <ArrowLeft className="mr-2" /> Back
              </button>
              <div className="text-center">
                <div className="text-6xl mb-4 star-gold">?</div>
                <h2 className="text-4xl font-serif text-emerald-600 font-semibold">Success!</h2>
                <p className="text-xl text-stone-600 mt-4">
                  {lastConfirmation?.type === 'volunteer' && lastConfirmation?.action === 'check-in'
                    ? `${lastConfirmation?.name} is checked in. Please remember to sign out when leaving.`
                    : lastConfirmation?.type === 'guest'
                      ? 'Thanks for visiting!'
                      : lastConfirmation?.type === 'out-of-town'
                        ? 'Out of town notice submitted.'
                      : lastConfirmation?.type === 'task-progress'
                        ? `Task "${lastConfirmation?.taskName}" marked as in progress.`
                      : lastConfirmation?.type === 'task-done'
                        ? `Task "${lastConfirmation?.taskName}" marked as done!`
                      : lastConfirmation?.type === 'manual-hours'
                        ? `Manual hours added for ${lastConfirmation?.name}.`
                      : lastConfirmation?.type === 'wish-list'
                        ? `Wish list item "${lastConfirmation?.itemName}" submitted.`
                      : 'Done.'}
                </p>
              </div>
            </div>
          </div>
        );
      }

      // Checkout Confirmation with Hours
      if (screen === 'checkout-confirmation') {
        const volunteerName = selectedVolunteer === 'other' ? customName : selectedVolunteer;
        
        const today = new Date();
        const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        
        const todayLogs = logs.filter(log => 
          log.name === volunteerName && 
          log.type === 'volunteer' &&
          new Date(log.timestamp) >= todayStart
        );
        
        let todayHours = 0;
        for (let i = 0; i < todayLogs.length; i++) {
          const log = todayLogs[i];
          if (log.action === 'check-in') {
            const checkOut = todayLogs.find((l, idx) => 
              idx > i && l.action === 'check-out'
            );
            if (checkOut) {
              const checkInTime = new Date(log.timestamp);
              const checkOutTime = new Date(checkOut.timestamp);
              todayHours += (checkOutTime - checkInTime) / (1000 * 60 * 60);
            }
          }
        }
        
        return (
          <div className="min-h-screen kiosk-screen bg-stone-50 p-4 sm:p-8 flex items-start justify-center pt-20 sm:pt-6">
            <div className="w-full max-w-4xl">
              <button
                onClick={resetToMain}
                className="mb-3 sm:mb-6 flex items-center text-stone-600 hover:text-stone-800 text-base sm:text-lg font-semibold transition-colors active:text-stone-900"
              >
                <ArrowLeft className="mr-2" /> Back
              </button>
              <div className="text-center">
                <div className="text-6xl mb-4 star-gold">?</div>
                <h2 className="text-4xl font-serif text-emerald-600 font-semibold">Successfully Checked Out!</h2>
                <div className="mt-6 sm:mt-8 bg-blue-50 border-2 border-blue-200 rounded-2xl p-6 sm:p-8 inline-block">
                  <p className="text-2xl text-stone-700 mb-2">Today's Hours</p>
                  <p className="text-5xl font-serif font-semibold text-blue-600">{todayHours.toFixed(1)}</p>
                </div>
                <p className="text-lg text-stone-600 mt-6">Thank you for your service!</p>
              </div>
            </div>
          </div>
        );
      }

      return null;
    };

    const root = ReactDOM.createRoot(document.getElementById('root'));
    root.render(<NorthStarKiosk />);


