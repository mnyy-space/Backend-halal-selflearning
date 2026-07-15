const pool = require('../libs/dp_pool');

const showSession = async(skill_id)=>{
    let connect;
    let result;
    var response;
    try{
        connect = await pool.getConnection();
        var sql = "SELECT session_id,session_name FROM sessions where skill_id = ?"
        result = await connect.query(sql,[skill_id]);
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

module.exports = showSession;