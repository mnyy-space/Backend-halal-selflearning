const pool = require('../libs/dp_pool');

const normalizeExerciseIds = (exerciseIds) => [...new Set(exerciseIds.map(Number))];

const validateExercises = async (connect, skillId, exerciseIds) => {
    const uniqueIds = normalizeExerciseIds(exerciseIds);
    if (uniqueIds.some((id) => !Number.isInteger(id) || id < 1)) {
        throw new Error('exercise_ids must contain valid exercise IDs');
    }
    if (uniqueIds.length === 0) return uniqueIds;

    const placeholders = uniqueIds.map(() => '?').join(', ');
    const rows = await connect.query(
        `SELECT exercise_id FROM exercises WHERE skill_id = ? AND exercise_id IN (${placeholders})`,
        [skillId, ...uniqueIds]
    );
    if (rows.length !== uniqueIds.length) {
        throw new Error('All exercises must belong to the selected skill');
    }
    return uniqueIds;
};

const replaceExerciseLinks = async (connect, sessionId, exerciseIds) => {
    await connect.query('DELETE FROM sessionsWithExercise WHERE session_id = ?', [sessionId]);
    for (const exerciseId of exerciseIds) {
        await connect.query(
            'INSERT INTO sessionsWithExercise (session_id, exercise_id) VALUES (?, ?)',
            [sessionId, exerciseId]
        );
    }
};

const getAllSessions = async () => {
    let connect;
    try {
        connect = await pool.getConnection();
        const sessions = await connect.query(
            'SELECT s.session_id, s.session_name, s.skill_id, sk.skill_name FROM sessions s LEFT JOIN skills sk ON sk.skill_id = s.skill_id ORDER BY s.session_id'
        );
        for (const session of sessions) {
            const exercises = await connect.query(
                'SELECT e.exercise_id, e.exercise_script FROM sessionsWithExercise swe JOIN exercises e ON e.exercise_id = swe.exercise_id WHERE swe.session_id = ? AND swe.is_active = 1 ORDER BY e.exercise_id',
                [session.session_id]
            );
            session.exercise_ids = exercises.map((exercise) => Number(exercise.exercise_id));
            session.exercise_names = exercises.map((exercise) => exercise.exercise_script);
        }
        return { isError: false, data: sessions, errorMessage: '' };
    } catch (error) {
        return { isError: true, data: null, errorMessage: error.message };
    } finally {
        if (connect) connect.release();
    }
};

const createSession = async (sessionName, skillId, exerciseIds) => {
    let connect;
    try {
        connect = await pool.getConnection();
        await connect.beginTransaction();
        const validExerciseIds = await validateExercises(connect, skillId, exerciseIds);
        const result = await connect.query(
            'INSERT INTO sessions (session_name, skill_id) VALUES (?, ?)',
            [sessionName.trim(), skillId]
        );
        const sessionId = Number(result.insertId);
        await replaceExerciseLinks(connect, sessionId, validExerciseIds);
        await connect.commit();
        return { isError: false, data: { session_id: sessionId }, errorMessage: '' };
    } catch (error) {
        if (connect) await connect.rollback();
        return { isError: true, data: null, errorMessage: error.message };
    } finally {
        if (connect) connect.release();
    }
};

const updateSession = async (sessionId, sessionName, skillId, exerciseIds) => {
    let connect;
    try {
        connect = await pool.getConnection();
        await connect.beginTransaction();
        const validExerciseIds = await validateExercises(connect, skillId, exerciseIds);
        const result = await connect.query(
            'UPDATE sessions SET session_name = ?, skill_id = ? WHERE session_id = ?',
            [sessionName.trim(), skillId, sessionId]
        );
        if (result.affectedRows === 0) throw new Error('Session not found');
        await replaceExerciseLinks(connect, sessionId, validExerciseIds);
        await connect.commit();
        return { isError: false, data: { session_id: Number(sessionId) }, errorMessage: '' };
    } catch (error) {
        if (connect) await connect.rollback();
        return { isError: true, data: null, errorMessage: error.message };
    } finally {
        if (connect) connect.release();
    }
};

const deleteSession = async (sessionId) => {
    let connect;
    try {
        connect = await pool.getConnection();
        await connect.beginTransaction();
        await connect.query('DELETE FROM sessionsWithExercise WHERE session_id = ?', [sessionId]);
        const result = await connect.query('DELETE FROM sessions WHERE session_id = ?', [sessionId]);
        if (result.affectedRows === 0) throw new Error('Session not found');
        await connect.commit();
        return { isError: false, data: { session_id: Number(sessionId) }, errorMessage: '' };
    } catch (error) {
        if (connect) await connect.rollback();
        return { isError: true, data: null, errorMessage: error.message };
    } finally {
        if (connect) connect.release();
    }
};

module.exports = { getAllSessions, createSession, updateSession, deleteSession };