import User from 'App/Models/User';
import Mail from '@ioc:Adonis/Addons/Mail';
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class PasswordsController {

  public async forgotPassword({ request, response}: HttpContextContract){

    const { email, resetPasswordUrl } = request.only(['email', 'resetPasswordUrl'])
    const user = await User.findByOrFail('email', email)

    await Mail.send((message) => {
      message
        .from('no-reply@roleplay.com')
        .to(email)
        .subject('Bora ver dessa vez')
        .htmlView('email/forgotpassword', {
          productName: 'RolePlay',
          name: user.username,
          resetPasswordUrl,
        })
    })

    return response.noContent()
  }

}
