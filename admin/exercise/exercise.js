const exerciseAdminModel = require('../../models/exercise_admin');

const handleCreateExercise = async (req, res) => {
    try {
        const { session_id, exercise_script, choices, skill_id } = req.body;
        if (!exercise_script) {
            return res.status(400).json({ isError: true, data: null, errorMessage: "exercise_script is required" });
        }
        const result = await exerciseAdminModel.createExercise(session_id, exercise_script, choices, skill_id);
        res.json(result);
    } catch (error) {
        res.status(500).json({ isError: true, data: null, errorMessage: error.message });
    }
};

const handleUpdateExercise = async (req, res) => {
    try {
        const { exercise_id } = req.params;
        const { exercise_script, choices, skill_id } = req.body;
        if (!exercise_id || !exercise_script) {
            return res.status(400).json({ isError: true, data: null, errorMessage: "exercise_id and exercise_script are required" });
        }
        const result = await exerciseAdminModel.updateExercise(exercise_id, exercise_script, choices, skill_id);
        res.json(result);
    } catch (error) {
        res.status(500).json({ isError: true, data: null, errorMessage: error.message });
    }
};

const handleChangeExerciseStatus = async (req, res) => {
    try {
        const { exercise_id } = req.params;
        const { is_active } = req.body;
        if (exercise_id === undefined || is_active === undefined) {
            return res.status(400).json({ isError: true, data: null, errorMessage: "exercise_id and is_active are required" });
        }
        const result = await exerciseAdminModel.changeExerciseStatus(exercise_id, is_active);
        res.json(result);
    } catch (error) {
        res.status(500).json({ isError: true, data: null, errorMessage: error.message });
    }
};

module.exports = {
    handleCreateExercise,
    handleUpdateExercise,
    handleChangeExerciseStatus
};
