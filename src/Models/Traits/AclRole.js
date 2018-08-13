'use strict'
const parser = use('Adonis/Acl/Parser')

class AclRole {
  register (Model) {
      //These accept a SINGLE service object
      Model.queryMacro('whereService', function (service) {
          this.where(function () {
              this.whereNull('service_type')
              this.orWhere(function () {
                  this.where('service_type', service.type)
                  this.whereNull('acl_service_id')
              })
              this.orWhere(function () {
                  this.where('service_type', service.type)
                  this.where('acl_service_id', service.id)
              })
          })
          return this
      })
      Model.queryMacro('whereServicePublic', function (service) {
          this.whereService(service)
          this.where('public', true)
          this.where('foreign', false)
          return this
      })
      Model.queryMacro('whereServicePrivate', function (service) {
          this.whereService(service)
          this.where('foreign', false)
          return this
      })

      //this always accepts serviceStr of form *:*, application:*, service:*
      Model.queryMacro('whereServices', function (serviceStr) {
          if(typeof serviceStr !== 'string') return this.whereService(serviceStr)
          let info = parser.getService(serviceStr)
          if(info.id !== null) throw {message: `Error performing whereServices macro: expects service:* or *:* serviceStr, ${serviceStr} received instead`}
          if(info.type === null) return this
          else this.where('service_type', info.type)
          return this
      })
  }
}

module.exports = AclRole
