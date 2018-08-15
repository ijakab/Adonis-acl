# Advanced Adonis ACL
This is Access control list provider for [Adonis](https://adonisjs.com/) It was heavily inspired by [Adonis ACL](https://github.com/enniel/adonis-acl) provider. In fact, we recommend using it if it suits your needs, as it is much simpler. This provider introduces concept of services as a way to assign different roles to different parts of your application

## Installation
1. *Install the package*
>adonis install adonis-acl-advanced
1. *Register a providers*
Inside `start/app.js`
```javascript
const providers = [
    //anything you have
    'adonis-acl-advanced/providers/AclProvider'
    //anything you have
]

const aceProviders = [
    //anything you have
    'adonis-cache/providers/CommandsProvider'
    //anything you have
]
```
1. *Add a configuration*
Inside `config/acl.js`
```javascript
module.exports = {
    userPath: 'App/Models/User', //Adonis path to user model goes here, this is what you would pass to use() method
    existingActions: [
        'MakeUser', //if you just pass string, it will be considered as object with slug property as provided
        'MakePost',
        'SomeActionSlug',
        { //optionally, you can provide an object with additional properties
            slug: 'CustomizedAction', //slug is MANDATORY
            title: 'Customized Action',
            locale_code: 'customized_action'
        }
    ]
}
```
1. *Add relation to your user model*
Inside UserModel file (probably `app/Models/User.js`)
```javascript
class User {
    //anything you have
    roles() {
         return this.belongsToMany('Adonis/Acl/Role', 'user_id', 'acl_role_id', 'id', 'id').pivotTable('acl_user_roles')
    }
}
```
1. *Register a middleware (if you want to use it)*
Inside `start/kernel.js`
```javascript
const namedMiddleware = {
    //anything you have
    aclValidator: 'Adonis/Acl/AclValidator'
}
```
1. *Setup database*
Add migrations with

>node ace acl:setup

Run migrations with

>node ace migration:run

Further documentation soon