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

    // คะแนน (ไม่บังคับ) ต้องเป็นจำนวนเต็ม 0 <= score <= total_questions
    const { score, total_questions } = req.body;
    const hasScore = score !== undefined && score !== null;
    const hasTotal = total_questions !== undefined && total_questions !== null;
    if (hasScore !== hasTotal ||
        (hasScore && (!Number.isInteger(score) || !Number.isInteger(total_questions) ||
                      score < 0 || total_questions < 1 || score > total_questions))) {
        return res.status(400).json({
            isError: true,
            errorMessage: "score และ total_questions ต้องเป็นจำนวนเต็ม โดย 0 <= score <= total_questions",
            data: null
        });
    }

    const result = await recordExerciseHistory(
        user_id, sessionWithExerciseId, sessionId,
        hasScore ? score : null, hasTotal ? total_questions : null
    );
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