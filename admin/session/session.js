const sessionAdminModel = require('../../models/session_admin');

const handleGetAllSessions = async (req, res) => {
    try {
        res.json(await sessionAdminModel.getAllSessions());
    } catch (error) {
        res.status(500).json({ isError: true, data: null, errorMessage: error.message });
    }
};

const handleCreateSession = async (req, res) => {
    const { session_name, skill_id, exercise_ids = [] } = req.body;
    if (!session_name || !skill_id || !Array.isArray(exercise_ids)) {
        return res.status(400).json({
            isError: true,
            data: null,
            errorMessage: 'session_name, skill_id, and exercise_ids are required',
        });
    }
    res.json(await sessionAdminModel.createSession(session_name, skill_id, exercise_ids));
};

const handleUpdateSession = async (req, res) => {
    const { session_id } = req.params;
    const { session_name, skill_id, exercise_ids = [] } = req.body;
    if (!session_id || !session_name || !skill_id || !Array.isArray(exercise_ids)) {
        return res.status(400).json({
            isError: true,
            data: null,
            errorMessage: 'session_id, session_name, skill_id, and exercise_ids are required',
        });
    }
    res.json(await sessionAdminModel.updateSession(session_id, session_name, skill_id, exercise_ids));
};

const handleDeleteSession = async (req, res) => {
    try {
        res.json(await sessionAdminModel.deleteSession(req.params.session_id));
    } catch (error) {
        res.status(500).json({ isError: true, data: null, errorMessage: error.message });
    }
};

const handleGetSessionHistory = async (req, res) => {
    try {
        res.json(await sessionAdminModel.getSessionHistory(req.params.session_id));
    } catch (error) {
        res.status(500).json({ isError: true, data: null, errorMessage: error.message });
    }
};

module.exports = {
    handleGetAllSessions,
    handleGetSessionHistory,
    handleCreateSession,
    handleUpdateSession,
    handleDeleteSession,
};