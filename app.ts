import * as Koa from 'koa';
import * as bodyparser from 'koa-bodyparser';
import * as passport from 'koa-passport';
import router from './routes';
import * as db from './mock-db';

var LocalStrategy = require('passport-local');
var BearerStrategy = require('passport-http-bearer');

const app = new Koa();
const port = process.env.PORT || 3000;

app.use(bodyparser());

passport.use(new LocalStrategy.Strategy((username, password, done) => {
    if(username === 'test' && password === 'test')
        done(null, {id: 1, username: 'test'});
    else
        done(null, false);
}));

passport.use(new BearerStrategy.Strategy((accessToken, done) => {
    var foundToken = db.tokens.find((at) => {
        return at.accessToken === accessToken;
    });

    if(foundToken){
        if(new Date() > new Date(foundToken.expirationDate)){
            var idx = db.tokens.indexOf(foundToken);
            db.tokens.splice(idx,1);
            done(null, false);
        } else {
            done(null, {id: 1, username: 'test'}, {scope: '*'});
        }
    } else {
        done(null, false); 
    }
}));

app.use(passport.initialize());
app.use(passport.session());

app.use(router.routes())
   .use(router.allowedMethods());

app.listen(port, () => {
    console.log('listening on port', port);
});