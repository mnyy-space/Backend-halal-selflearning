const skillAdminModel = require('../../models/skill_admin');

const handleGetAllSkills = async (req, res) => {
    try {
        const result = await skillAdminModel.getAllSkills();
        res.json(result);
    } catch (error) {
        res.status(500).json({ isError: true, data: null, errorMessage: error.message });
    }
};

const handleGetSkillById = async (req, res) => {
    try {
        const { skill_id } = req.params;
        const result = await skillAdminModel.getSkillById(skill_id);
        res.json(result);
    } catch (error) {
        res.status(500).json({ isError: true, data: null, errorMessage: error.message });
    }
};

const handleCreateSkill = async (req, res) => {
    try {
        const { skill_code, skill_name, skill_icon, is_active } = req.body;
        if (!skill_name) {
            return res.status(400).json({ isError: true, data: null, errorMessage: "skill_name is required" });
        }
        if (skill_icon !== undefined && skill_icon !== null && (typeof skill_icon !== 'string' || skill_icon.length > 50)) {
            return res.status(400).json({ isError: true, data: null, errorMessage: "skill_icon must be a string of at most 50 characters" });
        }
        const result = await skillAdminModel.createSkill(skill_code, skill_name, is_active, skill_icon);
        res.json(result);
    } catch (error) {
        res.status(500).json({ isError: true, data: null, errorMessage: error.message });
    }
};

const handleUpdateSkill = async (req, res) => {
    try {
        const { skill_id } = req.params;
        const { skill_code, skill_name, skill_icon, is_active } = req.body;
        if (!skill_id || !skill_name) {
            return res.status(400).json({ isError: true, data: null, errorMessage: "skill_id and skill_name are required" });
        }
        if (skill_icon !== undefined && skill_icon !== null && (typeof skill_icon !== 'string' || skill_icon.length > 50)) {
            return res.status(400).json({ isError: true, data: null, errorMessage: "skill_icon must be a string of at most 50 characters" });
        }
        const result = await skillAdminModel.updateSkill(skill_id, skill_code, skill_name, is_active, skill_icon);
        res.json(result);
    } catch (error) {
        res.status(500).json({ isError: true, data: null, errorMessage: error.message });
    }
};

const handleChangeSkillStatus = async (req, res) => {
    try {
        const { skill_id } = req.params;
        const { is_active } = req.body;
        if (skill_id === undefined || is_active === undefined) {
            return res.status(400).json({ isError: true, data: null, errorMessage: "skill_id and is_active are required" });
        }
        const result = await skillAdminModel.changeSkillStatus(skill_id, is_active);
        res.json(result);
    } catch (error) {
        res.status(500).json({ isError: true, data: null, errorMessage: error.message });
    }
};

const handleDeleteSkill = async (req, res) => {
    try {
        const { skill_id } = req.params;
        if (!skill_id) {
            return res.status(400).json({ isError: true, data: null, errorMessage: "skill_id is required" });
        }
        const result = await skillAdminModel.deleteSkill(skill_id);
        res.json(result);
    } catch (error) {
        res.status(500).json({ isError: true, data: null, errorMessage: error.message });
    }
};

module.exports = {
    handleGetAllSkills,
    handleGetSkillById,
    handleCreateSkill,
    handleUpdateSkill,
    handleChangeSkillStatus,
    handleDeleteSkill
};
