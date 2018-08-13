ACL provider for Adonis framework

npm install adonis-acl-advanced

start/app.js > providers > 'adonis-acl-advanced/providers/AclProvider'
start/app.js > aceProviders > 'adonis-acl-advanced/providers/CommandsProvider'

config/acl.js
module.exports = {
    userPath: 'App/Models/User',
    existingActions: [
        'MakeOvo',
        'MakeOno',
        'Pevaj',
        {
            slug: 'Plesi',
            title: 'Tancaj',
            locale_code: 'plesi'
        },
        'PrvaAkcija',
        'DrugaAkcija'
    ]
}

UserModel:
roles() {
        return this.belongsToMany('Adonis/Acl/Role', 'user_id', 'acl_role_id', 'id', 'id').pivotTable('acl_user_roles')
    }

start/kernel.js > namedMiddleware > aclValidator: 'Adonis/Acl/AclValidator'

node ace acl:setup
node ace migration:run

Normal docs soon!!!