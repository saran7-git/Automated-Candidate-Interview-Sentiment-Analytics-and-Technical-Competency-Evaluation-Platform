/**
 * InterviewIQ - Proctoring & Hardware Monitoring Controller
 * Handles logging of proctoring events, warnings counter, and recruiter audit review
 */

import { query } from '../config/db.js';

// Recruiter/Admin configurable defaults
let PROCTORING_CONFIG = {
  maxWarningsBeforeEscalation: 3,
  gazeAwayThresholdSeconds: 3.5,
  noiseThresholdDecibels: 75,
  lightingMinBrightness: 40,
  lightingMaxBrightness: 230,
  allowTabSwitchGraceCount: 1,
  escalationAction: 'flag_session' // 'flag_session' | 'pause_session'
};

/**
 * Log a proctoring event with candidate context and escalation tracking
 * POST /api/proctoring/log
 */
export const logProctoringEvent = async (req, res, next) => {
  try {
    const { sessionId, sessionType = 'assessment', eventType, severity = 'low', details } = req.body;
    const candidateId = req.user.id;

    if (!sessionId || !eventType) {
      return res.status(400).json({ success: false, message: 'sessionId and eventType are required.' });
    }

    // Save event
    const insertResult = await query(
      `INSERT INTO proctoring_events (session_id, session_type, candidate_id, event_type, severity, details, timestamp)
       VALUES (?, ?, ?, ?, ?, ?, NOW())`,
      [sessionId, sessionType, candidateId, eventType, severity, details || 'Automated browser monitoring signal']
    );

    // Count recent warnings for this session
    const recentEvents = await query(
      'SELECT id, severity, event_type FROM proctoring_events WHERE session_id = ? AND session_type = ? AND candidate_id = ?',
      [sessionId, sessionType, candidateId]
    );

    const warningCount = recentEvents.filter(e => e.severity === 'medium' || e.severity === 'high').length;
    const isEscalated = warningCount >= PROCTORING_CONFIG.maxWarningsBeforeEscalation;

    res.status(200).json({
      success: true,
      eventId: insertResult.insertId,
      warningCount,
      maxWarnings: PROCTORING_CONFIG.maxWarningsBeforeEscalation,
      isEscalated,
      escalationAction: isEscalated ? PROCTORING_CONFIG.escalationAction : null,
      message: isEscalated
        ? `Notice: Repeated proctoring alerts (${warningCount}/${PROCTORING_CONFIG.maxWarningsBeforeEscalation}) have been flagged for recruiter audit.`
        : 'Proctoring signal recorded.'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get proctoring audit log for recruiter review
 * GET /api/proctoring/logs/:sessionType/:sessionId
 */
export const getSessionProctoringLogs = async (req, res, next) => {
  try {
    const { sessionType, sessionId } = req.params;

    const events = await query(
      'SELECT * FROM proctoring_events WHERE session_id = ? AND session_type = ? ORDER BY id ASC',
      [sessionId, sessionType]
    );

    // Grouping summary
    const summary = {
      totalEvents: events.length,
      gazeAwayCount: events.filter(e => e.event_type === 'gaze_away').length,
      faceMissingCount: events.filter(e => e.event_type === 'face_missing').length,
      multipleFacesCount: events.filter(e => e.event_type === 'multiple_faces').length,
      noiseSpikeCount: events.filter(e => e.event_type === 'audio_spike' || e.event_type === 'excessive_noise').length,
      tabSwitchCount: events.filter(e => e.event_type === 'tab_switch' || e.event_type === 'window_blur').length,
      highSeverityCount: events.filter(e => e.severity === 'high').length
    };

    res.status(200).json({
      success: true,
      summary,
      events
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get or update proctoring configuration (Recruiter/Admin only)
 * GET /api/proctoring/settings
 * PUT /api/proctoring/settings
 */
export const getProctoringSettings = (req, res) => {
  res.status(200).json({ success: true, settings: PROCTORING_CONFIG });
};

export const updateProctoringSettings = (req, res) => {
  if (req.user.role !== 'admin' && req.user.role !== 'recruiter') {
    return res.status(403).json({ success: false, message: 'Forbidden.' });
  }

  const { maxWarningsBeforeEscalation, gazeAwayThresholdSeconds, noiseThresholdDecibels, escalationAction } = req.body;
  if (maxWarningsBeforeEscalation !== undefined) PROCTORING_CONFIG.maxWarningsBeforeEscalation = parseInt(maxWarningsBeforeEscalation, 10);
  if (gazeAwayThresholdSeconds !== undefined) PROCTORING_CONFIG.gazeAwayThresholdSeconds = parseFloat(gazeAwayThresholdSeconds);
  if (noiseThresholdDecibels !== undefined) PROCTORING_CONFIG.noiseThresholdDecibels = parseInt(noiseThresholdDecibels, 10);
  if (escalationAction !== undefined) PROCTORING_CONFIG.escalationAction = escalationAction;

  res.status(200).json({ success: true, message: 'Proctoring settings updated.', settings: PROCTORING_CONFIG });
};
