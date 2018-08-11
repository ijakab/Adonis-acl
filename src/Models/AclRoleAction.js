'use strict'

const Model = use('Model')

class AclRoleAction extends Model {

    //Relations
    role() {
        return this.belongsTo('App/Models/AclRole')
    }

    action() {
        return this.belongsTo('App/Models/AclAction', 'acl_action_slug', 'slug')
    }

}

module.exports = AclRoleAction
