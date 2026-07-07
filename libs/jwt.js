const jwt = require('jsonwebtoken');
var sercretKey = "MySecretKey";

module.exports = {
    sign(playload){
        let token  = jwt.sign(playload, sercretKey,{
            expiresIn : '1d'
        }
        );
        return token;
    },

    verify(token){
        return new promise(()=>{
            jwt.verify(token, sercretKey, (err, decoded)=>{
            if(err){
                reject(err);
            }
            else{
                resolve(decoded);
            }
            }
        )
        })
    }
}