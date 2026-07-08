const express = require('express');
const hash = require('../libs/hash');
const app = express();
const userAccountModel = require('../models/user_account');


register: ()=>{
    app.post('/register', async (req, res) => {
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
                errorMessage : ""
            }
        }


    })
}

module.exports = register;