'use strict'
const { ServiceProvider } = require('@adonisjs/fold')

class AclProvider extends ServiceProvider {
  register () {
      //Services
      this.app.bind('Adonis/AclService', () => {
          const Config = this.app.use('Adonis/Src/Config')
          let service = require('../src/Services/AclService')
          service.init(Config)
          return service
      })
      this.app.bind('Adonis/Acl/Parser', () => {
        return require('../src/Services/AclStringParser')
      })

      //Models
      this.app.bind('Adonis/Acl/Action', () => {
          let Model = require('../src/Models/AclAction')
          Model._bootIfNotBooted()
          return Model
      })
      this.app.bind('Adonis/Acl/Role', () => {
          let Model = require('../src/Models/AclRole')
          Model._bootIfNotBooted()
          return Model
      })
      this.app.bind('Adonis/Acl/Service', () => {
          let Model = require('../src/Models/AclService')
          Model._bootIfNotBooted()
          return Model
      })
      this.app.bind('Adonis/Acl/ActionService', () => {
          let Model = require('../src/Models/AclActionService')
          Model._bootIfNotBooted()
          return Model
      })
      this.app.bind('Adonis/Acl/RoleAction', () => {
          let Model = require('../src/Models/AclRoleAction')
          Model._bootIfNotBooted()
          return Model
      })
      this.app.bind('Adonis/Acl/UserRole', () => {
          let Model = require('../src/Models/AclUserRole')
          Model._bootIfNotBooted()
          return Model
      })

      //Traits
      this.app.bind('Adonis/Acl/RoleTrait', () => {
          let Trait = require('../src/Models/Traits/AclRole')
          return new Trait()
      })
      this.app.bind('Adonis/Acl/ServiceTrait', () => {
          let Trait = require('../src/Models/Traits/AclService')
          return new Trait()
      })

      //Middleware
      this.app.bind('Adonis/Acl/AclValidator', () => {
          let Middleware = require('../src/Middleware/Named/AclValidator')
          return new Middleware()
      })
  }

  boot () {
  }
}

module.exports = AclProvider