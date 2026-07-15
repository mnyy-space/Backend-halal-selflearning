
const exerciseModel = require('../models/exercise')


const getExerciseBysessionId = async (req, res) => {
    const session_id = req.params.session_id;
    const result = await exerciseModel(session_id);
    if(result.isError){
        res.json({
            isError : true,
            errorMessage : result.errorMessage,
            data:""
        })
    }
    else{
        res.json({
            isError : false,
            data : result.data,
            errorMessage:""
        })
    }  
}

module.exports = getExerciseBysessionId