import User from 'App/Models/User';
import Mail from '@ioc:Adonis/Addons/Mail';
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { randomBytes } from 'crypto'
import { promisify } from 'util'
import ForgotPasswordValidator from 'App/Validators/ForgotPasswordValidator';

export default class PasswordsController {

  public async forgotPassword({ request, response}: HttpContextContract){

    const { email, resetPasswordUrl } = await request.validate(ForgotPasswordValidator)
    const user = await User.findByOrFail('email', email)


    //Criando token
    const random = await promisify(randomBytes)(24) //Criando numero aleatorio com 24 bytes
    const token = random.toString('hex') //Convertendo os bytes gerados aleatoriamente em string hexadecimal
    await user.related('tokens').updateOrCreate( //Acessando os tokens usando os relacionados e atualizando ou criando um novo token
      { userId: user.id }, //Chave e valor para pesquisar na tabela de tokens
      { token } //O campo que deve ser atualizado ou criado dentro da tabela token
    )

    const resetPasswordUrlWithToken = `${resetPasswordUrl}?token=${token}`

    await Mail.send((message) => {
      message
        .from('no-reply@roleplay.com')
        .to(email)
        .subject('Bora ver dessa vez')
        .htmlView('email/forgotpassword', {
          productName: 'RolePlay',
          name: user.username,
          resetPasswordUrl: resetPasswordUrlWithToken,
        })
    })

    return response.noContent()
  }

}
