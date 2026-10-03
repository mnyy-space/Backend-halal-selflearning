const hash = require('../libs/hash');
const userAccountModel = require('../models/user_account');


const handleRegister = async(req, res)=>{
        const username = (req.body.username || '').trim();
        const password = req.body.password;
        const firstName = (req.body.firstName || '').trim();
        const lastName = (req.body.lastName || '').trim();
        var response;

        if(!username || !password || !firstName || !lastName){
            return res.status(400).json({
                isError : true,
                errorMessage : "กรุณากรอก username, password, firstName และ lastName ให้ครบ"
            });
        }

        const hashedPassword = await hash.encode(password);
        const fullName = `${firstName} ${lastName}`;

        var result = await userAccountModel.register(username, hashedPassword, fullName);
        if(result.isError){
            response = {
                isError : true,
                errorMessage : result.errorMessage
            }
            return res.status(400).json(response);
        }
        else{
            response = {
                isError : false,
                errorMessage : "",
                data:result.data
            }
        }
        res.status(201).json(response);
}

module.exports = handleRegister;
