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

    register: async (registerDTO)=>{
        let connect;
        let result;
        var response;

        try{
            connect = await pool.getConnection();
            var sql = "INSERT INTO user_accounts(username, `password`) VALUES ( ? , ?)"
            result = await connect.query(sql,[registerDTO.username, registerDTO.password]);
            if(result.length == 0){
                response = {
                    isError : true,
                    errorMessage : "data is not found"
                }
            }
            else{
                response= {
                    isError: false,
                    data : result
                }
            }
        }
        catch(error){
            response = {
                isError: true,
                errorMessage: error.message
            }
        }   
        finally{
            connect.release()
            return response;
        }
    }

}
