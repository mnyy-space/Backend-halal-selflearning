const pool = require('../libs/dp_pool');

const getExerciseBySessionId = async (session_id) => {
    let connect;
    let result;
    var response;
    try {
        connect = await pool.getConnection();
        // ดึงข้อมูล exercise โดย join กับตาราง sessionswithexercise, sessions และ skills
        var sql = `
            SELECT 
                e.exercise_id, 
                e.exercise_script, 
                e.level, 
                e.skill_id,
                swe.session_with_exercise_id,
                swe.session_id,
                s.session_name,
                sk.skill_name,
                sk.skill_icon
            FROM exercises e 
            JOIN sessionswithexercise swe ON e.exercise_id = swe.exercise_id 
            JOIN \`sessions\` s ON swe.session_id = s.session_id
            LEFT JOIN skills sk ON e.skill_id = sk.skill_id
            WHERE swe.session_id = ? AND swe.is_active = 1 AND e.is_active = 1
            ORDER BY e.exercise_id ASC
        `;
        result = await connect.query(sql, [session_id]);
        if (result.length == 0) {
            response = {
                isError: false,
                data: [],
                errorMessage: "data is not found"
            };
        } else {
            // ดึงข้อมูล choice ของแต่ละ exercise จากตาราง choices
            for (let i = 0; i < result.length; i++) {
                var choiceSql = "SELECT choice_id, exercise_id, choice_script, isAnswer FROM choices WHERE exercise_id = ? ORDER BY choice_id ASC";
                var choiceResult = await connect.query(choiceSql, [result[i].exercise_id]);
                result[i].choices = choiceResult;
            }
            response = {
                isError: false,
                data: result
            };
        }
    } catch (error) {
        response = {
            isError: true,
            errorMessage: error.message,
            data: []
        };
    } finally {
        if (connect) connect.release();
        return response;
    }
};

const recordExerciseHistory = async (userId, sessionWithExerciseId, sessionId) => {
    let connect;
    let response;
    try {
        connect = await pool.getConnection();
        let sweId = sessionWithExerciseId;

        // หากไม่ได้ส่ง sweId มาตรงๆ ให้หาจาก session_id
        if (!sweId && sessionId) {
            const findSql = "SELECT session_with_exercise_id FROM sessionswithexercise WHERE session_id = ? AND is_active = 1 LIMIT 1";
            const findRows = await connect.query(findSql, [sessionId]);
            if (findRows.length > 0) {
                sweId = findRows[0].session_with_exercise_id;
            }
        }

        if (!sweId) {
            return {
                isError: true,
                errorMessage: "ไม่พบข้อมูล session_with_exercise_id สำหรับบันทึกประวัติ"
            };
        }

        const insertSql = "INSERT INTO history (session_with_exercise_id, user_id) VALUES (?, ?)";
        const insertResult = await connect.query(insertSql, [sweId, userId]);
        response = {
            isError: false,
            data: {
                history_id: Number(insertResult.insertId),
                session_with_exercise_id: sweId,
                user_id: userId
            }
        };
    } catch (error) {
        response = {
            isError: true,
            errorMessage: error.message
        };
    } finally {
        if (connect) connect.release();
        return response;
    }
};

module.exports = {
    getExerciseBySessionId,
    recordExerciseHistory
};