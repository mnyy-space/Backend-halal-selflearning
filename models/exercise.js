const pool = require('../libs/dp_pool');

const getExerciseBySessionId = async(session_id) =>{
    let connect;
    let result;
    var response;
    try{
        connect = await pool.getConnection();
        // ดึงข้อมูล exercise โดย join กับตาราง sessionandexercise เพื่อหาตาม session_id
        var sql = "SELECT e.exercise_id, e.exercise_script FROM exercises e JOIN sessionandexercise se ON e.exercise_id = se.exercise_id WHERE se.session_id = ?";
        result = await connect.query(sql, [session_id]);
        if(result.length == 0){
            response = {
                isError : true,
                errorMessage : "data is not found"
            }
        }
        else{
            // ดึงข้อมูล choice ของแต่ละ exercise จากตาราง exercisechoice
            for(let i = 0; i < result.length; i++){
                var choiceSql = "SELECT choice_id, exercise_id, choice_script, isAnswer FROM exercisechoice WHERE exercise_id = ?";
                var choiceResult = await connect.query(choiceSql, [result[i].exercise_id]);
                result[i].choices = choiceResult;
            }
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

module.exports = getExerciseBySessionId;