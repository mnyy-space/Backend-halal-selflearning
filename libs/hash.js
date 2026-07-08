const bcrypt = require('bcrypt');
const saltRounds = 10;

const sha256Hash = (data) => {
    return crypto.createHash('sha256').update(input).digest('hex');
}

module.exports = {
    async encode(noHashData){
        const result = sha256Hash(noHashData);
        return result;
    }
}