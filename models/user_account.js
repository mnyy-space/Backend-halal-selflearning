const pool = require('./libs/dp_pool')
const dateUtils = require('./libs/data_utils')

const userTable = ''
modile.export = {
    getUserAccountById(id){
        let connect;
        let result;

        try{
            connect = await pool.getConnection();

            //sql needed
            var sql = "SELECT "

            var record = connect.query(sql);
            return {
                isError : false,
                data : record
            }
        }
        catch(error){

        }
        finally{
            if(connect){
                connect.release();
            }
            return result;
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

            var result = await connect.query(sql,[getCurrentDataForToken(), authenRequest]);
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
    checkAuthenAcess: async (authenToken, authenAccess) =>{
        let connect;
        let result;
        var response;
        try{
            connect = await pool.getConnection();

            // sql needed
            var sql = "SELECT username FROM user_accounts WHERE "
            + "SHA2(CONCAT(username,'&',password, '&', ?), 256) = ?"

            var result = await connect.query(sql,[authenToken, authenAccess]);
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
    }


}