const pool = require('../libs/dp_pool');

const ensureSkillColumnsExist = async (connect) => {
    try {
        await connect.query("ALTER TABLE skills ADD COLUMN skill_code VARCHAR(50) DEFAULT NULL");
    } catch (err) {}
    try {
        await connect.query("ALTER TABLE skills ADD COLUMN is_active TINYINT(1) NOT NULL DEFAULT 1");
    } catch (err) {}
};

const getAllSkills = async () => {
    let connect;
    try {
        connect = await pool.getConnection();
        await ensureSkillColumnsExist(connect);
        const sql = "SELECT skill_id, skill_code, skill_name, is_active, create_date, update_date FROM skills";
        const result = await connect.query(sql);
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
        const sql = "SELECT skill_id, skill_code, skill_name, is_active, create_date, update_date FROM skills WHERE skill_id = ?";
        const result = await connect.query(sql, [skill_id]);
        if (result.length === 0) {
            return { isError: true, data: null, errorMessage: "Skill not found" };
        }
        return { isError: false, data: result[0], errorMessage: "" };
    } catch (error) {
        return { isError: true, data: null, errorMessage: error.message };
    } finally {
        if (connect) connect.release();
    }
};

const createSkill = async (skill_code, skill_name, is_active = 1) => {
    let connect;
    try {
        connect = await pool.getConnection();
        await ensureSkillColumnsExist(connect);
        const statusVal = (is_active === 1 || is_active === true || is_active === '1') ? 1 : 0;
        const sql = "INSERT INTO skills (skill_code, skill_name, is_active, create_date, update_date) VALUES (?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)";
        const result = await connect.query(sql, [skill_code || null, skill_name, statusVal]);
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

const updateSkill = async (skill_id, skill_code, skill_name, is_active) => {
    let connect;
    try {
        connect = await pool.getConnection();
        await ensureSkillColumnsExist(connect);
        const statusVal = (is_active === undefined || is_active === null) ? 1 : ((is_active === 1 || is_active === true || is_active === '1') ? 1 : 0);
        const sql = "UPDATE skills SET skill_code = ?, skill_name = ?, is_active = ?, update_date = CURRENT_TIMESTAMP WHERE skill_id = ?";
        const result = await connect.query(sql, [skill_code || null, skill_name, statusVal, skill_id]);
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
