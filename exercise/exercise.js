const { getExerciseBySessionId, recordExerciseHistory } = require('../models/exercise');

const getExerciseBysessionId = async (req, res) => {
    const session_id = req.params.session_id;
    const result = await getExerciseBySessionId(session_id);
    if (result.isError) {
        res.json({
            isError: true,
            errorMessage: result.errorMessage,
            data: []
        });
    } else {
        res.json({
            isError: false,
            data: result.data || [],
            errorMessage: ""
        });
    }
};

const handleRecordExerciseHistory = async (req, res) => {
    const user_id = req.user?.user_id;
    if (!user_id) {
        return res.status(401).json({
            isError: true,
            errorMessage: "Unauthorized",
            data: null
        });
    }

    const sessionWithExerciseId = req.body.session_with_exercise_id;
    const sessionId = req.body.session_id;

    const result = await recordExerciseHistory(user_id, sessionWithExerciseId, sessionId);
    if (result.isError) {
        return res.status(400).json(result);
    }
    return res.json({
        isError: false,
        data: result.data,
        message: "บันทึกประวัติการทำแบบฝึกหัดสำเร็จ"
    });
};

module.exports = {
    getExerciseBysessionId,
    handleRecordExerciseHistory
};