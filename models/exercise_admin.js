const pool = require('../libs/dp_pool');

const ensureExerciseColumnsExist = async (connect) => {
    try {
        await connect.query("ALTER TABLE exercises ADD COLUMN is_active TINYINT(1) NOT NULL DEFAULT 1");
    } catch (err) {}
    try {
        await connect.query("ALTER TABLE exercises ADD COLUMN skill_id INT(11) NOT NULL DEFAULT 1");
    } catch (err) {}
};

const getAllExercises = async () => {
    let connect;
    try {
        connect = await pool.getConnection();
        await ensureExerciseColumnsExist(connect);
        const sql = "SELECT e.exercise_id, e.exercise_script, e.skill_id, s.skill_name, e.is_active, e.create_date, e.update_date FROM exercises e LEFT JOIN skills s ON e.skill_id = s.skill_id ORDER BY e.exercise_id";
        const exercises = await connect.query(sql);

        for (let i = 0; i < exercises.length; i++) {
            const choiceSql = "SELECT choice_id, exercise_id, choice_script, isAnswer FROM choices WHERE exercise_id = ?";
            exercises[i].choices = await connect.query(choiceSql, [exercises[i].exercise_id]);
        }

        return { isError: false, data: exercises, errorMessage: "" };
    } catch (error) {
        return { isError: true, data: null, errorMessage: error.message };
    } finally {
        if (connect) connect.release();
    }
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
            const insertRelSql = "INSERT INTO sessionsWithExercise (session_id, exercise_id) VALUES (?, ?)";
            await connect.query(insertRelSql, [session_id, exercise_id]);
        }

        if (choices && Array.isArray(choices) && choices.length > 0) {
            for (const ch of choices) {
                const insertChoiceSql = "INSERT INTO choices (exercise_id, choice_script, isAnswer) VALUES (?, ?, ?)";
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

        if (Array.isArray(choices)) {
            const retainedChoiceIds = [...new Set(
                choices
                    .map((choice) => Number(choice.choice_id))
                    .filter((choiceId) => Number.isInteger(choiceId) && choiceId > 0)
            )];

            if (retainedChoiceIds.length > 0) {
                const placeholders = retainedChoiceIds.map(() => '?').join(', ');
                const ownedChoices = await connect.query(
                    `SELECT choice_id FROM choices WHERE exercise_id = ? AND choice_id IN (${placeholders})`,
                    [exercise_id, ...retainedChoiceIds]
                );
                if (ownedChoices.length !== retainedChoiceIds.length) {
                    throw new Error('A choice does not belong to this exercise');
                }
                await connect.query(
                    `DELETE FROM choices WHERE exercise_id = ? AND choice_id NOT IN (${placeholders})`,
                    [exercise_id, ...retainedChoiceIds]
                );
            } else {
                await connect.query('DELETE FROM choices WHERE exercise_id = ?', [exercise_id]);
            }

            for (const ch of choices) {
                if (ch.choice_id) {
                    const updateChSql = "UPDATE choices SET choice_script = ?, isAnswer = ?, update_date = CURRENT_TIMESTAMP WHERE choice_id = ? AND exercise_id = ?";
                    await connect.query(updateChSql, [ch.choice_script, ch.isAnswer ? 1 : 0, ch.choice_id, exercise_id]);
                } else {
                    const insertChSql = "INSERT INTO choices (exercise_id, choice_script, isAnswer) VALUES (?, ?, ?)";
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
    getAllExercises,
    createExercise,
    updateExercise,
    changeExerciseStatus
};
