'use strict'
const AclService = use('Adonis/AclService')
const parser = use('Adonis/Acl/Parser')

class AclValidator {
  async handle (ctx, next, aclParams) {
      if(!ctx.user) ctx.user = await ctx.auth.getUser()
      let serviceStr = parser.makeServiceStr(aclParams, ctx.request.all())
      let operation_info = parser.operationInfo(aclParams[0])

      let passes = true
      for(let requirement of operation_info.requirements) { //todo: ABSOLUTELY refactor this
        if(!(await AclService[operation_info.operationName](serviceStr, requirement, ctx.user.id)).aclResult) {
          passes = false
          break
        }
      }
      if(passes)
        await next()
      else
        return ctx.response.unauthorized('user.noPermission')
  }
}

module.exports = AclValidator
