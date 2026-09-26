const pool = require('../libs/dp_pool');

const ensureGoalTablesExist = async (connect) => {
    try {
        await connect.query(`
            CREATE TABLE IF NOT EXISTS goals (
                goal_id INT(11) NOT NULL AUTO_INCREMENT,
                goal_code VARCHAR(50) DEFAULT NULL,
                goal_name VARCHAR(100) NOT NULL,
                is_active TINYINT(1) NOT NULL DEFAULT 1,
                create_date TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
                update_date TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY (goal_id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_thai_520_w2;
        `);
    } catch (err) {}

    try {
        await connect.query(`
            CREATE TABLE IF NOT EXISTS goal_skills (
                relate_id INT(11) NOT NULL AUTO_INCREMENT,
                goal_id INT(11) NOT NULL,
                skill_id INT(11) NOT NULL,
                PRIMARY KEY (relate_id),
                KEY fk_gs_goal (goal_id),
                KEY fk_gs_skill (skill_id),
                CONSTRAINT fk_gs_goal FOREIGN KEY (goal_id) REFERENCES goals (goal_id) ON DELETE CASCADE,
                CONSTRAINT fk_gs_skill FOREIGN KEY (skill_id) REFERENCES skills (skill_id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_thai_520_w2;
        `);
    } catch (err) {}
};

const getAllGoals = async () => {
    let connect;
    try {
        connect = await pool.getConnection();
        await ensureGoalTablesExist(connect);
        const sql = "SELECT goal_id, goal_code, goal_name, is_active, create_date, update_date FROM goals";
        const goals = await connect.query(sql);

        for (let i = 0; i < goals.length; i++) {
            const skillsSql = "SELECT s.skill_id, s.skill_code, s.skill_name FROM skills s JOIN goal_skills gs ON s.skill_id = gs.skill_id WHERE gs.goal_id = ?";
            const skills = await connect.query(skillsSql, [goals[i].goal_id]);
            goals[i].skills = skills;
        }

        return { isError: false, data: goals, errorMessage: "" };
    } catch (error) {
        return { isError: true, data: null, errorMessage: error.message };
    } finally {
        if (connect) connect.release();
    }
};

const getGoalById = async (goal_id) => {
    let connect;
    try {
        connect = await pool.getConnection();
        await ensureGoalTablesExist(connect);
        const sql = "SELECT goal_id, goal_code, goal_name, is_active, create_date, update_date FROM goals WHERE goal_id = ?";
        const goals = await connect.query(sql, [goal_id]);
        if (goals.length === 0) {
            return { isError: true, data: null, errorMessage: "Goal not found" };
        }

        const goal = goals[0];
        const skillsSql = "SELECT s.skill_id, s.skill_code, s.skill_name FROM skills s JOIN goal_skills gs ON s.skill_id = gs.skill_id WHERE gs.goal_id = ?";
        const skills = await connect.query(skillsSql, [goal.goal_id]);
        goal.skills = skills;

        return { isError: false, data: goal, errorMessage: "" };
    } catch (error) {
        return { isError: true, data: null, errorMessage: error.message };
    } finally {
        if (connect) connect.release();
    }
};

const createGoal = async (goal_code, goal_name, is_active = 1, skill_ids = []) => {
    let connect;
    try {
        connect = await pool.getConnection();
        await ensureGoalTablesExist(connect);
        await connect.beginTransaction();

        const statusVal = (is_active === 1 || is_active === true || is_active === '1') ? 1 : 0;
        const sql = "INSERT INTO goals (goal_code, goal_name, is_active, create_date, update_date) VALUES (?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)";
        const result = await connect.query(sql, [goal_code || null, goal_name, statusVal]);
        const goal_id = Number(result.insertId);

        if (skill_ids && Array.isArray(skill_ids) && skill_ids.length > 0) {
            for (const skill_id of skill_ids) {
                const gsSql = "INSERT INTO goal_skills (goal_id, skill_id) VALUES (?, ?)";
                await connect.query(gsSql, [goal_id, skill_id]);
            }
        }

        await connect.commit();
        return {
            isError: false,
            data: { goal_id, message: "Goal created successfully" },
            errorMessage: ""
        };
    } catch (error) {
        if (connect) await connect.rollback();
        return { isError: true, data: null, errorMessage: error.message };
    } finally {
        if (connect) connect.release();
    }
};

const updateGoal = async (goal_id, goal_code, goal_name, is_active, skill_ids) => {
    let connect;
    try {
        connect = await pool.getConnection();
        await ensureGoalTablesExist(connect);
        await connect.beginTransaction();

        const statusVal = (is_active === undefined || is_active === null) ? 1 : ((is_active === 1 || is_active === true || is_active === '1') ? 1 : 0);
        const sql = "UPDATE goals SET goal_code = ?, goal_name = ?, is_active = ?, update_date = CURRENT_TIMESTAMP WHERE goal_id = ?";
        const result = await connect.query(sql, [goal_code || null, goal_name, statusVal, goal_id]);

        if (result.affectedRows === 0) {
            await connect.rollback();
            return { isError: true, data: null, errorMessage: "Goal not found" };
        }

        if (skill_ids && Array.isArray(skill_ids)) {
            await connect.query("DELETE FROM goal_skills WHERE goal_id = ?", [goal_id]);
            for (const skill_id of skill_ids) {
                await connect.query("INSERT INTO goal_skills (goal_id, skill_id) VALUES (?, ?)", [goal_id, skill_id]);
            }
        }

        await connect.commit();
        return {
            isError: false,
            data: { goal_id: Number(goal_id), message: "Goal updated successfully" },
            errorMessage: ""
        };
    } catch (error) {
        if (connect) await connect.rollback();
        return { isError: true, data: null, errorMessage: error.message };
    } finally {
        if (connect) connect.release();
    }
};

const changeGoalStatus = async (goal_id, is_active) => {
    let connect;
    try {
        connect = await pool.getConnection();
        await ensureGoalTablesExist(connect);
        const statusVal = (is_active === 1 || is_active === true || is_active === '1') ? 1 : 0;
        const sql = "UPDATE goals SET is_active = ?, update_date = CURRENT_TIMESTAMP WHERE goal_id = ?";
        const result = await connect.query(sql, [statusVal, goal_id]);

        if (result.affectedRows === 0) {
            return { isError: true, data: null, errorMessage: "Goal not found" };
        }

        return {
            isError: false,
            data: { goal_id: Number(goal_id), is_active: statusVal, message: "Goal status updated successfully" },
            errorMessage: ""
        };
    } catch (error) {
        return { isError: true, data: null, errorMessage: error.message };
    } finally {
        if (connect) connect.release();
    }
};

const deleteGoal = async (goal_id) => {
    let connect;
    try {
        connect = await pool.getConnection();
        await ensureGoalTablesExist(connect);
        await connect.beginTransaction();

        await connect.query("DELETE FROM goal_skills WHERE goal_id = ?", [goal_id]);
        const result = await connect.query("DELETE FROM goals WHERE goal_id = ?", [goal_id]);

        if (result.affectedRows === 0) {
            await connect.rollback();
            return { isError: true, data: null, errorMessage: "Goal not found" };
        }

        await connect.commit();
        return {
            isError: false,
            data: { goal_id: Number(goal_id), message: "Goal deleted successfully" },
            errorMessage: ""
        };
    } catch (error) {
        if (connect) await connect.rollback();
        return { isError: true, data: null, errorMessage: error.message };
    } finally {
        if (connect) connect.release();
    }
};

module.exports = {
    getAllGoals,
    getGoalById,
    createGoal,
    updateGoal,
    changeGoalStatus,
    deleteGoal
};
