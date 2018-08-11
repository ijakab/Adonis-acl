'use strict'

const Model = use('Model')

class AclActionService extends Model {

    static boot() {
        super.boot()
    }

    static get table() {
        return 'acl_action_services'
    }

    //Relations
    action() {
        return this.belongsTo('App/Models/AclAction', 'action_slug', 'slug')
    }
}

module.exports = AclActionService
