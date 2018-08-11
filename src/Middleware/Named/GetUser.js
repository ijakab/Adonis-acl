'use strict'

// this one checks token, and returns user so there is no need to call checkToken before
// this middleware queries db for user model

class GetUser {
    async handle(ctx, next) {

        // get and set user to context if token is valid and not expired
        ctx.user = await ctx.auth.getUser()

        await next()
    }
}

module.exports = GetUser
