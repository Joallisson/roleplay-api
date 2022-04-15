import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User from 'App/Models/User'

export default class UsersController {
  public async store({ request, response }: HttpContextContract) {
    const userPayload = request.only(['email', 'username', 'password', 'avatar'])
    const user = await User.create(userPayload) //Criando usuário
    return response.created({ user }) //No final das contas o que vai ser criado, vai ser um usuário
  }
}
