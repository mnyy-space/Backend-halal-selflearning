const pool = require('../libs/dp_pool');

const ensureExerciseColumnsExist = async (connect) => {
    try {
        await connect.query("ALTER TABLE exercises ADD COLUMN is_active TINYINT(1) NOT NULL DEFAULT 1");
    } catch (err) {}
    try {
        await connect.query("ALTER TABLE exercises ADD COLUMN skill_id INT(11) NOT NULL DEFAULT 1");
    } catch (err) {}
};

const createExercise = async (session_id, exercise_script, choices, skill_id) => {
    let connect;
    try {
        connect = await pool.getConnection();
        await ensureExerciseColumnsExist(connect);
        await connect.beginTransaction();

        const targetSkillId = skill_id || 1;
        const insertExSql = "INSERT INTO exercises (exercise_script, skill_id, is_active) VALUES (?, ?, 1)";
        const exResult = await connect.query(insertExSql, [exercise_script, targetSkillId]);
        const exercise_id = Number(exResult.insertId);

        if (session_id) {
            const insertRelSql = "INSERT INTO sessionandexercise (session_id, exercise_id) VALUES (?, ?)";
            await connect.query(insertRelSql, [session_id, exercise_id]);
        }

        if (choices && Array.isArray(choices) && choices.length > 0) {
            for (const ch of choices) {
                const insertChoiceSql = "INSERT INTO exercisechoice (exercise_id, choice_script, isAnswer) VALUES (?, ?, ?)";
                await connect.query(insertChoiceSql, [exercise_id, ch.choice_script, ch.isAnswer ? 1 : 0]);
            }
        }

        await connect.commit();
        return { isError: false, data: { exercise_id, skill_id: targetSkillId, message: "Exercise created successfully" }, errorMessage: "" };
    } catch (error) {
        if (connect) await connect.rollback();
        return { isError: true, data: null, errorMessage: error.message };
    } finally {
        if (connect) connect.release();
    }
};

const updateExercise = async (exercise_id, exercise_script, choices, skill_id) => {
    let connect;
    try {
        connect = await pool.getConnection();
        await ensureExerciseColumnsExist(connect);
        await connect.beginTransaction();

        let updateExSql;
        let updateParams;
        if (skill_id) {
            updateExSql = "UPDATE exercises SET exercise_script = ?, skill_id = ?, update_date = CURRENT_TIMESTAMP WHERE exercise_id = ?";
            updateParams = [exercise_script, skill_id, exercise_id];
        } else {
            updateExSql = "UPDATE exercises SET exercise_script = ?, update_date = CURRENT_TIMESTAMP WHERE exercise_id = ?";
            updateParams = [exercise_script, exercise_id];
        }

        await connect.query(updateExSql, updateParams);

        if (choices && Array.isArray(choices) && choices.length > 0) {
            for (const ch of choices) {
                if (ch.choice_id) {
                    const updateChSql = "UPDATE exercisechoice SET choice_script = ?, isAnswer = ?, update_date = CURRENT_TIMESTAMP WHERE choice_id = ? AND exercise_id = ?";
                    await connect.query(updateChSql, [ch.choice_script, ch.isAnswer ? 1 : 0, ch.choice_id, exercise_id]);
                } else {
                    const insertChSql = "INSERT INTO exercisechoice (exercise_id, choice_script, isAnswer) VALUES (?, ?, ?)";
                    await connect.query(insertChSql, [exercise_id, ch.choice_script, ch.isAnswer ? 1 : 0]);
                }
            }
        }

        await connect.commit();
        return { isError: false, data: { exercise_id: Number(exercise_id), skill_id: skill_id || null, message: "Exercise updated successfully" }, errorMessage: "" };
    } catch (error) {
        if (connect) await connect.rollback();
        return { isError: true, data: null, errorMessage: error.message };
    } finally {
        if (connect) connect.release();
    }
};

const changeExerciseStatus = async (exercise_id, is_active) => {
    let connect;
    try {
        connect = await pool.getConnection();
        await ensureExerciseColumnsExist(connect);
        const statusVal = (is_active === 1 || is_active === true || is_active === '1') ? 1 : 0;
        const sql = "UPDATE exercises SET is_active = ?, update_date = CURRENT_TIMESTAMP WHERE exercise_id = ?";
        const result = await connect.query(sql, [statusVal, exercise_id]);

        if (result.affectedRows === 0) {
            return { isError: true, data: null, errorMessage: "Exercise not found" };
        }
        return { isError: false, data: { exercise_id: Number(exercise_id), is_active: statusVal, message: "Exercise status updated successfully" }, errorMessage: "" };
    } catch (error) {
        return { isError: true, data: null, errorMessage: error.message };
    } finally {
        if (connect) connect.release();
    }
};

module.exports = {
    createExercise,
    updateExercise,
    changeExerciseStatus
};
