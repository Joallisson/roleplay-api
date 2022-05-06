import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User from 'App/Models/User'

export default class UsersController {
  public async store({ request, response }: HttpContextContract) {
    const userPayload = request.only(['email', 'username', 'password', 'avatar'])

    const userByEmail = await User
      .findBy(  //Procurando no banco de dados se no campo email tem um email que está sendo passado na request
        'email', userPayload.email
      )

    if(userByEmail){ //Se existir o email que está sendo passado na request existir no bd, manda uma mensagem de conflito
      return response.conflict({
        error: 'email already in use'
      })
    }

    const user = await User.create(userPayload) //Criando usuário
    return response.created({ user }) //No final das contas o que vai ser criado, vai ser um usuário
  }
}
