'use strict'

const Model = use('Model')

class AclUserRole extends Model {

    role() {
        return this.belongsTo('Adonis/Acl/Role')
    }
}

module.exports = AclUserRole
