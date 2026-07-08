const bcrypt = require('bcrypt');
const saltRounds = 10;


module.exports = {
    async encode(noHashData){
        const hashedData = await bcrypt.hashSync(noHashData, saltRounds);
        return hashedData;
    }

    
}