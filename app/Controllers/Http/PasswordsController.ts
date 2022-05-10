import Mail from '@ioc:Adonis/Addons/Mail';
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class PasswordsController {

  public async forgotPassword({ request, response}: HttpContextContract){

    const { email } = request.only(['email'])

    const sended = await Mail.send((message) => {
      message
        .from('no-reply@roleplay.com')
        .to(email)
        .subject('O envio de email deu certo')
        .text('Clique no link abaixo para redefinir sua senha')
    })

  }

}
