import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import BadRequest from 'App/Exceptions/BadRequestException'
import User from 'App/Models/User'
import CreateUserValidator from 'App/Validators/CreateUserValidator'

export default class UsersController {

  public async store({ request, response }: HttpContextContract) {
    const userPayload = await  request.validate(CreateUserValidator) //Validando os dados que estão vindo da requisição


    const userByEmail = await User
      .findBy(  //Procurando no banco de dados se no campo email tem um email que está sendo passado na request
        'email', userPayload.email
      )

    const userByUsername = await User
      .findBy(  //Procurando no banco de dados se no campo email tem um email que está sendo passado na request
        'username', userPayload.username
      )

    if(userByEmail){ //Se existir o email que está sendo passado na request existir no bd, manda uma mensagem de conflito
      throw new BadRequest('email already in use', 409)
    }

    if(userByUsername){ //Se existir o email que está sendo passado na request existir no bd, manda uma mensagem de conflito
      throw new BadRequest('username already in use', 409)
    }

    const user = await User.create(userPayload) //Criando usuário
    return response.created({ user }) //No final das contas o que vai ser criado, vai ser um usuário
  }

  public async update({request, response}: HttpContextContract){
    return response.ok({})
  }
}
