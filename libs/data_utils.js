module.exports = {
    getCurrentDataForToken:()=>{
        const now = new Date();
        const formattedDate = new Intl.DateTimeFormat(
            'en-GB',{
                year : 'numeric',
                month : '2-digit',
                day : '2-digit',
            }
        ).format(now).replace(/\//g,'-');
        return formattedDate;
    }
}