const pool = require('../libs/dp_pool');

const showSession = async(skill_id)=>{
    let connect;
    let result;
    var response;
    try{
        connect = await pool.getConnection();
        // exercise_count นับเงื่อนไขเดียวกับ GET /exercise/:session_id (เฉพาะที่เปิดใช้งาน)
        var sql = `
            SELECT
                s.session_id,
                s.session_name,
                (
                    SELECT COUNT(*)
                    FROM sessionswithexercise swe
                    JOIN exercises e ON e.exercise_id = swe.exercise_id
                    WHERE swe.session_id = s.session_id AND swe.is_active = 1 AND e.is_active = 1
                ) AS exercise_count
            FROM sessions s
            WHERE s.skill_id = ? AND s.is_active = 1
        `
        result = await connect.query(sql,[skill_id]);
        // COUNT(*) ได้ค่าเป็น BigInt จาก driver mariadb ซึ่ง res.json แปลงไม่ได้ จึงแปลงเป็น Number
        result = result.map(row => ({ ...row, exercise_count: Number(row.exercise_count) }));
        if(result.length == 0){
            response = {
                isError : false,
                data : [],
                errorMessage : "data is not found"
            }
        }
        else{
            response = {
                isError : false,
                data : result
            }
        }
    }
    catch(error){
        response = {
            isError : true,
            errorMessage : error.message
        }
    }
    finally{
        connect.release();
        return response;
    }
}

module.exports = showSession;