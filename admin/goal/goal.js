const goalAdminModel = require('../../models/goal_admin');

const handleGetAllGoals = async (req, res) => {
    try {
        const result = await goalAdminModel.getAllGoals();
        res.json(result);
    } catch (error) {
        res.status(500).json({ isError: true, data: null, errorMessage: error.message });
    }
};

const handleGetGoalById = async (req, res) => {
    try {
        const { goal_id } = req.params;
        const result = await goalAdminModel.getGoalById(goal_id);
        res.json(result);
    } catch (error) {
        res.status(500).json({ isError: true, data: null, errorMessage: error.message });
    }
};

const handleCreateGoal = async (req, res) => {
    try {
        const { goal_code, goal_name, is_active, skill_ids } = req.body;
        if (!goal_name) {
            return res.status(400).json({ isError: true, data: null, errorMessage: "goal_name is required" });
        }
        const result = await goalAdminModel.createGoal(goal_code, goal_name, is_active, skill_ids);
        res.json(result);
    } catch (error) {
        res.status(500).json({ isError: true, data: null, errorMessage: error.message });
    }
};

const handleUpdateGoal = async (req, res) => {
    try {
        const { goal_id } = req.params;
        const { goal_code, goal_name, is_active, skill_ids } = req.body;
        if (!goal_id || !goal_name) {
            return res.status(400).json({ isError: true, data: null, errorMessage: "goal_id and goal_name are required" });
        }
        const result = await goalAdminModel.updateGoal(goal_id, goal_code, goal_name, is_active, skill_ids);
        res.json(result);
    } catch (error) {
        res.status(500).json({ isError: true, data: null, errorMessage: error.message });
    }
};

const handleChangeGoalStatus = async (req, res) => {
    try {
        const { goal_id } = req.params;
        const { is_active } = req.body;
        if (goal_id === undefined || is_active === undefined) {
            return res.status(400).json({ isError: true, data: null, errorMessage: "goal_id and is_active are required" });
        }
        const result = await goalAdminModel.changeGoalStatus(goal_id, is_active);
        res.json(result);
    } catch (error) {
        res.status(500).json({ isError: true, data: null, errorMessage: error.message });
    }
};

const handleDeleteGoal = async (req, res) => {
    try {
        const { goal_id } = req.params;
        if (!goal_id) {
            return res.status(400).json({ isError: true, data: null, errorMessage: "goal_id is required" });
        }
        const result = await goalAdminModel.deleteGoal(goal_id);
        res.json(result);
    } catch (error) {
        res.status(500).json({ isError: true, data: null, errorMessage: error.message });
    }
};

module.exports = {
    handleGetAllGoals,
    handleGetGoalById,
    handleCreateGoal,
    handleUpdateGoal,
    handleChangeGoalStatus,
    handleDeleteGoal
};
