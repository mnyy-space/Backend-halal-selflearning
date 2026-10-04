const pool = require('../libs/dp_pool')
const dateUtils = require('../libs/data_utils')

const userTable = ''
module.exports = {
    getUserByName: async () =>{
        let connect;
        let result;
        var response;
        try{
            connect = await pool.getConnection();
            var sql = "SELECT user_id, username, role_name FROM user_accounts uc ,  WHERE username = ?"
        }
        catch(error){

        }
        finally{

        }
    },


    checkAuthenRequest: async (authenRequest)=>{
        let connect;
        let result;
        var response;
        try{
            connect = await pool.getConnection();

            // sql needed
            var sql = "SELECT username FROM user_accounts WHERE "
            + "SHA2(CONCAT(username, '&', ?), 256) = ?"

            result = await connect.query(sql,[dateUtils.getCurrentDateForToken(), authenRequest]);
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
            if(connect){
                connect.release();
            }
            return response;
        }
    },

    //access Authen
    checkAuthenAccess: async (authenToken, authenSignature) =>{
        let connect;
        let result;
        var response;
        try{
            connect = await pool.getConnection();
            // sql needed
            var sql = "SELECT uc.user_id, uc.username, ur.role_name "
            + "FROM user_accounts uc "
            + "JOIN user_role ur ON uc.role_id = ur.role_id "
            + "WHERE SHA2(CONCAT(uc.username, '&', uc.password, '&', ?), 256) = ?"

            result = await connect.query(sql,[authenToken, authenSignature]);
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
            if(connect){
                connect.release();
            }
            return response;
        }
    },

    checkAuthenAcess: async (authenToken, authenSignature) =>{
        return module.exports.checkAuthenAccess(authenToken, authenSignature);
    },

    //register path

    register: async (username, password, fullName) =>{
        let connect;
        let result;
        var response;

        try{
            connect = await pool.getConnection();
            var sql = "INSERT INTO user_accounts(username, `password`, full_name) VALUES ( ? , ?, ?)"
            result = await connect.query(sql,[username, password, fullName]);
            if(result.affectedRows == 0){
                response = {
                    isError : true,
                    errorMessage : "register failed"
                }
            }
            else{
                response= {
                    isError: false,
                    data : {
                        user_id : Number(result.insertId),
                        username,
                        full_name : fullName,
                    }
                }
            }
        }
        catch(error){
            response = {
                isError: true,
                errorMessage: error.code === 'ER_DUP_ENTRY' ? "username นี้ถูกใช้งานแล้ว" : error.message
            }
        }
        finally{
            if(connect){
                connect.release();
            }
            return response;
        }
    },

    getLatestHistory: async (userId) => {
        let connect;
        let response;
        try {
            connect = await pool.getConnection();
            const sql = `
                SELECT 
                    h.history_id,
                    h.user_id,
                    h.create_date AS history_date,
                    swe.session_id,
                    s.session_name,
                    s.skill_id,
                    sk.skill_name,
                    sk.skill_code
                FROM history h
                JOIN sessionswithexercise swe ON h.session_with_exercise_id = swe.session_with_exercise_id
                JOIN \`sessions\` s ON swe.session_id = s.session_id
                JOIN skills sk ON s.skill_id = sk.skill_id
                WHERE h.user_id = ?
                ORDER BY h.create_date DESC, h.history_id DESC
                LIMIT 1
            `;
            const result = await connect.query(sql, [userId]);
            if (result.length === 0) {
                response = {
                    isError: false,
                    data: null
                };
            } else {
                response = {
                    isError: false,
                    data: result[0]
                };
            }
        } catch (error) {
            response = {
                isError: true,
                errorMessage: error.message,
                data: null
            };
        } finally {
            if (connect) {
                connect.release();
            }
            return response;
        }
    },

    getAllHistory: async (userId) => {
        let connect;
        let response;
        try {
            connect = await pool.getConnection();
            const sql = `
                SELECT 
                    h.history_id,
                    h.user_id,
                    h.create_date AS history_date,
                    swe.session_id,
                    s.session_name,
                    s.skill_id,
                    sk.skill_name,
                    sk.skill_code
                FROM history h
                JOIN sessionswithexercise swe ON h.session_with_exercise_id = swe.session_with_exercise_id
                JOIN \`sessions\` s ON swe.session_id = s.session_id
                JOIN skills sk ON s.skill_id = sk.skill_id
                WHERE h.user_id = ?
                ORDER BY h.create_date DESC, h.history_id DESC
            `;
            const result = await connect.query(sql, [userId]);
            response = {
                isError: false,
                data: result || []
            };
        } catch (error) {
            response = {
                isError: true,
                errorMessage: error.message,
                data: []
            };
        } finally {
            if (connect) {
                connect.release();
            }
            return response;
        }
    }
}
