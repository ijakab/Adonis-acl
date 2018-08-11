'use strict'

const Model = use('Model')

class AclAction extends Model {

    //Relations
    roles() {
        return this.belongsToMany('App/Models/AclAction', 'acl_action_slug', 'acl_role_id', 'slug', 'id').pivotTable('acl_role_actions')
    }

    services() {
        return this.belongsToMany('App/Models/AclService', 'action_slug', 'service_type', 'slug', 'type').pivotTable('acl_action_services')
    }

}

module.exports = AclAction
