const hash = require('../libs/hash');
const userAccountModel = require('../models/user_account');


const handleRegister = async(req, res)=>{
        const username = req.body.username;
        const password = req.body.password;
        var response;

        const hashedPassword = await hash.encode(password);

        const registerDTO = {
            username : username,
            password : hashedPassword
        }

        var result = await userAccountModel.register(registerDTO);
        if(result.isError){
            response = {
                isError : true,
                errorMessage : result.errorMessage
            }
        }   
        else{
            
            response = {
                isError : false,
                errorMessage : "",
                data:result
            }
        }
        res.json(response);
}

module.exports = handleRegister;