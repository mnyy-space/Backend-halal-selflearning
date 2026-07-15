const pool = require('../libs/dp_pool');

const showSkill = async () =>{
    let connect;
    let result;
    var response;
    try{
        connect = await pool.getConnection();
        var sql = "SELECT skill_id, skill_name FROM skills"
        result = await connect.query(sql);
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