'use strict'
const parser = use('Adonis/Acl/Parser')

class AclService {
  register (Model) {

    Model.queryMacro('serviceString', function (str) {
        let info = parser.getService(str)
        this.where('type', info.type)
        if(info.relation) {
          this.where('relation', info.relation)
        }
        if(info.id) {
            this.where('id', info.id)
        }
        if(info.slug) {
          this.where('slug', info.slug)
        }
        return this
    })
  }

}

module.exports = AclService
