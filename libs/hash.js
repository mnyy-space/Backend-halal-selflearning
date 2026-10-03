const crypto = require('crypto');

const sha256Hash = (data) => {
    return crypto.createHash('sha256').update(data).digest('hex');
}

module.exports = {
    async encode(noHashData){
        const result = sha256Hash(noHashData);
        return result;
    }
}
