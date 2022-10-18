var http = require('./http');
var passportHost = () => {
    return "http://i.passport.realsee.com"
}
module.exports = {
    getSessionTokenByTicket: async (ticket, source, loginType) => {
        return http.post(passportHost() + '/api/v1/session/ticket', {
            source, ticket, login_type: loginType,
        })
    },
    verifySessionToken: async (token) => {
        return http.post(passportHost + '/api/v1/session/verify', {
            token
        })
    },
    getUserByUserID: async (user_id) => {
        return http.post(passportHost() + '/api/v1/user/detail', {
            user_id
        })
    }
}