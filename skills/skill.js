const skillModel = require('../models/skil')

const showSkill = async (req, res) =>{
    const result = await skillModel();
    if(result.isError){
        res.json({
            isError : true,
            data:"",
            errorMessage : result.errorMessage
        })
    }
    else{
        res.json({
            isError : false,
            data : result.data,
            errorMessage: ""
        })
    }
}

module.exports = showSkill;