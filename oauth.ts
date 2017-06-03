import * as passport from 'koa-passport';
import * as utils from './utils';
var oauth2orize = require('oauth2orize-koa');
import * as compose from 'koa-compose';
import * as db from './mock-db';

const server = oauth2orize.createServer();

server.serializeClient((client) => {return client.id});
server.deserializeClient((id) => {
    return {id: '1', name: 'clientName'};
});

const createAccessToken = (userId, create_refreshtoken) => {
    const token = utils.getUid(256);
    var issue_token = [];
    var expirationDate = new Date(new Date().getTime() + (3600 * 1000));
    db.tokens.push({userId: userId, accessToken: token, expirationDate: expirationDate});
    issue_token.push(token);
    var params = {expires_in: expirationDate};

    if(create_refreshtoken){
        const refreshtoken = utils.getUid(40);
        var refreshtoken_expiration = new Date(new Date().getTime() + (3600 * 12 * 1000));
        db.refreshtokens.push({userId: userId, refreshToken: refreshtoken, expirationDate:refreshtoken_expiration});
        issue_token.push(refreshtoken);
    } else {
        issue_token.push(null);
    }
    issue_token.push(params);

    return issue_token;
}

server.exchange(oauth2orize.exchange.password((client, username, password, scope) => {
    return createAccessToken(username, true);
}));

server.exchange(oauth2orize.exchange.refreshToken((client, refreshToken, scope) => {
    var foundToken = db.refreshtokens.find((rt) => {return rt.refreshToken === refreshToken});
    return createAccessToken(foundToken.userId, false);
}));

const validateRefreshToken = async(ctx, next) => {
    const req = ctx.request;

    if(!req.body) {
        throw new Error('Required parameters missing');
    }

    var refreshtoken = req.body.refresh_token;

    if(!refreshtoken)
        throw new Error('Missing required parameter: refresh_token');

    var foundtoken = db.refreshtokens.find((rt) => {return rt.refreshToken === refreshtoken});
    if(foundtoken){
        if(new Date() > new Date(foundtoken.expirationDate)) {
            var idx = db.refreshtokens.indexOf(foundtoken);
            db.refreshtokens.splice(idx, 1);
            ctx.body = {'Error': 'Invalid or expired refresh token'}
            ctx.throw(401);
        }
        await next();
    } else {
        ctx.body = {'Error': 'Invalid or expired refresh token'}
        ctx.throw(401);
    }
}

export const requestToken = compose([
    passport.authenticate('local', {session: false}),
    server.token(),
    server.errorHandler()
]);

export const refreshToken = compose([
    validateRefreshToken,
    server.token(),
    server.errorHandler()
]);