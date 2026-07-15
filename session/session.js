const sessionModel = require('../models/session')

const handleGetSession = async (req, res) =>{
    const skill_id = req.params.skill_id;
    const result = await sessionModel(skill_id);
    if(result.isError){
        res.json({
            isError : true,
            errorMessage : result.errorMessage
        })
    }
    else{
        res.json({
            isError : false,
            data : result.data
        })
    }
}

module.exports = handleGetSession;