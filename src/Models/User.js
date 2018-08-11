'use strict'

const Model = use('Model')

class User extends Model {

    roles() {
        return this.belongsToMany('App/Models/AclRole', 'user_id', 'acl_role_id', 'id', 'id').pivotTable('acl_user_roles')
    }

}

module.exports = User
