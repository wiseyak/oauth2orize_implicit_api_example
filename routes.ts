import * as Router from 'koa-router';
import * as passport from 'koa-passport';
import {requestToken, refreshToken} from './oauth';
import * as compose from 'koa-compose';

const router = new Router();

router.post('/oauth/token', requestToken);

router.post('/oauth/refreshtoken', refreshToken);

router.post('/api/resource', compose([
    passport.authenticate('bearer', {session: false}),
    async(ctx:any, next) => {
        await next();
        ctx.body = {'success': true};
    }
]));

export default router;