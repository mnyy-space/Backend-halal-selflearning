const pool = require('../libs/dp_pool');

const showSkill = async () =>{
    let connect;
    let result;
    var response;
    try{
        connect = await pool.getConnection();
        // session_count นับเงื่อนไขเดียวกับ GET /session/:skill_id (เฉพาะที่เปิดใช้งาน)
        var sql = `
            SELECT
                sk.skill_id, sk.skill_name, sk.skill_code, sk.skill_icon,
                (
                    SELECT COUNT(*) FROM sessions s
                    WHERE s.skill_id = sk.skill_id AND s.is_active = 1
                ) AS session_count
            FROM skills sk
            WHERE sk.is_active = 1
        `
        result = await connect.query(sql);
        // COUNT(*) ได้ค่าเป็น BigInt จาก driver mariadb ซึ่ง res.json แปลงไม่ได้ จึงแปลงเป็น Number
        result = result.map(row => ({ ...row, session_count: Number(row.session_count) }));
        if(result.length == 0){
            response = {
                isError : true,
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

module.exports = showSkill;