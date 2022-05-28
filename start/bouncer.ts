import GroupRequest from 'App/Models/GroupRequest';
import User from 'App/Models/User';
/**
 * Contract source: https://git.io/Jte3T
 *
 * Feel free to let us know via PR, if you find something broken in this config
 * file.
 */

import Bouncer from '@ioc:Adonis/Addons/Bouncer'

/*
|--------------------------------------------------------------------------
| Bouncer Actions
|--------------------------------------------------------------------------
|
| Actions allows you to separate your application business logic from the
| authorization logic. Feel free to make use of policies when you find
| yourself creating too many actions
|
| You can define an action using the `.define` method on the Bouncer object
| as shown in the following example
|
| ```
| 	Bouncer.define('deletePost', (user: User, post: Post) => {
|			return post.user_id === user.id
| 	})
| ```
|
|****************************************************************
| NOTE: Always export the "actions" const from this file
|****************************************************************
*/
export const { actions } = Bouncer.define('updateUser', (user: User, updatedUser: User) => { //O usuário que vai atualizar e o que vai ser atualizado devem ser o mesmo
  return user.id === updatedUser.id //O id usuário autenticado tem que ser igual ao id do usuário que está sendo atualizado
})
.define('acceptGroupRequest', (user: User, groupRequest: GroupRequest) => { //Criando autorizador que diz que só o mestre da mesa pode aceitar as solicitãçoes para participar da mesa
  return user.id === groupRequest.group.master //O id do usuário tem que ser igual ao id do mestre da mesa
})
.define('rejectGroupRequest', (user: User, groupRequest: GroupRequest) => { //Criando autorizador que diz que só o mestre da mesa pode rejeitar as solicitãçoes para participar da mesa
  return user.id === groupRequest.group.master //O id do usuário tem que ser igual ao id do mestre da mesa
})

/*
|--------------------------------------------------------------------------
| Bouncer Policies
|--------------------------------------------------------------------------
|
| Policies are self contained actions for a given resource. For example: You
| can create a policy for a "User" resource, one policy for a "Post" resource
| and so on.
|
| The "registerPolicies" accepts a unique policy name and a function to lazy
| import the policy
|
| ```
| 	Bouncer.registerPolicies({
|			UserPolicy: () => import('App/Policies/User'),
| 		PostPolicy: () => import('App/Policies/Post')
| 	})
| ```
|
|****************************************************************
| NOTE: Always export the "policies" const from this file
|****************************************************************
*/
export const { policies } = Bouncer.registerPolicies({})
