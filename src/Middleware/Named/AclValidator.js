'use strict'
const AclService = use('App/Services/AclService')
const parser = use('App/Services/AclStringParser')

class AclValidator {
  async handle ({request, user, response}, next, aclParams) {
    // call next to advance the request
      let serviceParam;
      if(aclParams[2]) serviceParam = request.all()[aclParams[2]]
      let serviceStr = parser.makeServiceStr(aclParams[1], serviceParam)
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
