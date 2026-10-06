const pool = require('../libs/dp_pool');

// ชื่อไอคอน Material (Flutter Icons.xxx) ที่ใช้เมื่อไม่ได้เลือกไอคอน
const DEFAULT_SKILL_ICON = 'school';

const ensureSkillColumnsExist = async (connect) => {
    try {
        await connect.query("ALTER TABLE skills ADD COLUMN skill_code VARCHAR(50) DEFAULT NULL");
    } catch (err) {}
    try {
        await connect.query("ALTER TABLE skills ADD COLUMN is_active TINYINT(1) NOT NULL DEFAULT 1");
    } catch (err) {}
    try {
        await connect.query("ALTER TABLE skills ADD COLUMN skill_icon VARCHAR(50) NOT NULL DEFAULT 'school' AFTER skill_name");
    } catch (err) {}
};

const getAllSkills = async () => {
    let connect;
    try {
        connect = await pool.getConnection();
        await ensureSkillColumnsExist(connect);
        const sql = `
            SELECT 
                s.skill_id, 
                s.skill_code, 
                s.skill_name, 
                s.skill_icon, 
                s.is_active, 
                s.create_date, 
                s.update_date,
                (
                    SELECT COUNT(DISTINCT e.exercise_id)
                    FROM exercises e
                    LEFT JOIN sessionswithexercise swe ON swe.exercise_id = e.exercise_id
                    LEFT JOIN sessions sess ON sess.session_id = swe.session_id
                    WHERE e.skill_id = s.skill_id OR sess.skill_id = s.skill_id
                ) AS exercise_count
            FROM skills s
            ORDER BY s.skill_id ASC
        `;
        let result = await connect.query(sql);
        result = result.map(row => ({
            ...row,
            exercise_count: Number(row.exercise_count || 0)
        }));
        return { isError: false, data: result, errorMessage: "" };
    } catch (error) {
        return { isError: true, data: null, errorMessage: error.message };
    } finally {
        if (connect) connect.release();
    }
};

const getSkillById = async (skill_id) => {
    let connect;
    try {
        connect = await pool.getConnection();
        await ensureSkillColumnsExist(connect);
        const sql = `
            SELECT 
                s.skill_id, 
                s.skill_code, 
                s.skill_name, 
                s.skill_icon, 
                s.is_active, 
                s.create_date, 
                s.update_date,
                (
                    SELECT COUNT(DISTINCT e.exercise_id)
                    FROM exercises e
                    LEFT JOIN sessionswithexercise swe ON swe.exercise_id = e.exercise_id
                    LEFT JOIN sessions sess ON sess.session_id = swe.session_id
                    WHERE e.skill_id = s.skill_id OR sess.skill_id = s.skill_id
                ) AS exercise_count
            FROM skills s
            WHERE s.skill_id = ?
        `;
        const result = await connect.query(sql, [skill_id]);
        if (result.length === 0) {
            return { isError: true, data: null, errorMessage: "Skill not found" };
        }
        const data = {
            ...result[0],
            exercise_count: Number(result[0].exercise_count || 0)
        };
        return { isError: false, data, errorMessage: "" };
    } catch (error) {
        return { isError: true, data: null, errorMessage: error.message };
    } finally {
        if (connect) connect.release();
    }
};

const createSkill = async (skill_code, skill_name, is_active = 1, skill_icon) => {
    let connect;
    try {
        connect = await pool.getConnection();
        await ensureSkillColumnsExist(connect);
        const statusVal = (is_active === 1 || is_active === true || is_active === '1') ? 1 : 0;
        const sql = "INSERT INTO skills (skill_code, skill_name, skill_icon, is_active, create_date, update_date) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)";
        const result = await connect.query(sql, [skill_code || null, skill_name, skill_icon || DEFAULT_SKILL_ICON, statusVal]);
        return {
            isError: false,
            data: { skill_id: Number(result.insertId), message: "Skill created successfully" },
            errorMessage: ""
        };
    } catch (error) {
        return { isError: true, data: null, errorMessage: error.message };
    } finally {
        if (connect) connect.release();
    }
};

const updateSkill = async (skill_id, skill_code, skill_name, is_active, skill_icon) => {
    let connect;
    try {
        connect = await pool.getConnection();
        await ensureSkillColumnsExist(connect);
        const statusVal = (is_active === undefined || is_active === null) ? 1 : ((is_active === 1 || is_active === true || is_active === '1') ? 1 : 0);
        const sql = "UPDATE skills SET skill_code = ?, skill_name = ?, skill_icon = ?, is_active = ?, update_date = CURRENT_TIMESTAMP WHERE skill_id = ?";
        const result = await connect.query(sql, [skill_code || null, skill_name, skill_icon || DEFAULT_SKILL_ICON, statusVal, skill_id]);
        if (result.affectedRows === 0) {
            return { isError: true, data: null, errorMessage: "Skill not found" };
        }
        return {
            isError: false,
            data: { skill_id: Number(skill_id), message: "Skill updated successfully" },
            errorMessage: ""
        };
    } catch (error) {
        return { isError: true, data: null, errorMessage: error.message };
    } finally {
        if (connect) connect.release();
    }
};

const changeSkillStatus = async (skill_id, is_active) => {
    let connect;
    try {
        connect = await pool.getConnection();
        await ensureSkillColumnsExist(connect);
        const statusVal = (is_active === 1 || is_active === true || is_active === '1') ? 1 : 0;
        const sql = "UPDATE skills SET is_active = ?, update_date = CURRENT_TIMESTAMP WHERE skill_id = ?";
        const result = await connect.query(sql, [statusVal, skill_id]);
        if (result.affectedRows === 0) {
            return { isError: true, data: null, errorMessage: "Skill not found" };
        }
        return {
            isError: false,
            data: { skill_id: Number(skill_id), is_active: statusVal, message: "Skill status updated successfully" },
            errorMessage: ""
        };
    } catch (error) {
        return { isError: true, data: null, errorMessage: error.message };
    } finally {
        if (connect) connect.release();
    }
};

const deleteSkill = async (skill_id) => {
    let connect;
    try {
        connect = await pool.getConnection();
        const sql = "DELETE FROM skills WHERE skill_id = ?";
        const result = await connect.query(sql, [skill_id]);
        if (result.affectedRows === 0) {
            return { isError: true, data: null, errorMessage: "Skill not found" };
        }
        return {
            isError: false,
            data: { skill_id: Number(skill_id), message: "Skill deleted successfully" },
            errorMessage: ""
        };
    } catch (error) {
        return { isError: true, data: null, errorMessage: error.message };
    } finally {
        if (connect) connect.release();
    }
};

module.exports = {
    getAllSkills,
    getSkillById,
    createSkill,
    updateSkill,
    changeSkillStatus,
    deleteSkill
};
