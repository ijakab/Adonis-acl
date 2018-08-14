'use strict'
const AclService = use('Adonis/AclService')
const parser = use('Adonis/Acl/Parser')

class AclValidator {
  async handle (ctx, next, aclParams) {
    // call next to advance the request
      let serviceStr = parser.makeServiceStr(aclParams, ctx.request.all())
      let operation_info = parser.operationInfo(aclParams[0])

      let passes = true
      for(let requirement of operation_info.requirements) { //todo: ABSOLUTELY refactor this
        if(!(await AclService[operation_info.operationName](serviceStr, requirement, user.id))) {
          passes = false
          break
        }
      }
      if(passes)
        await next()
      else
        return
  }
}

module.exports = AclValidator
