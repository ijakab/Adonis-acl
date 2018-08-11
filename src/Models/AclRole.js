'use strict'

const Model = use('Model')

class AclRole extends Model {

    static boot() {
        super.boot()
        this.addTrait('AclRole')
    }

    //Relations
    actions() {
        return this.belongsToMany('App/Models/AclAction', 'acl_role_id', 'acl_action_slug', 'id', 'slug').pivotTable('acl_role_actions')
    }

    users() {
        return this.belongsToMany('App/Models/User', 'acl_role_id', 'user_id', 'id', 'id').pivotTable('acl_user_roles')
    }

    //IMPORTANT!!! Don't add relations with AclServices, since role's NULL on service id and service type represents all services.
    //That logic needs to be custom implemented
}

module.exports = AclRole
