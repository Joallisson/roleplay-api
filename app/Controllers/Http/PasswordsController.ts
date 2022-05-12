import User from 'App/Models/User';
import Mail from '@ioc:Adonis/Addons/Mail';
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { randomBytes } from 'crypto'
import { promisify } from 'util'
import ForgotPasswordValidator from 'App/Validators/ForgotPasswordValidator';
import ResetPasswordValidator from 'App/Validators/ResetPasswordValidator';
import TokenExpiredException from 'App/Exceptions/TokenExpiredException';

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

  public async resetPassword({ request, response }: HttpContextContract){

    const { token, password } = await request.validate(ResetPasswordValidator)

    //Verificando se o usuário que quer atualizar sua senha é o mesmo que está com o token guardado no bd
    const userByToken = await User.query() //Buscar usuario que tenha um token igual ao que é passado pela request
      .whereHas('tokens', (query) => {
        query.where('token', token)
      })
      .preload('tokens') //Carrega os tokens do usuário
      .firstOrFail() //Vai pegar o primeiro usuario que encontrar pelo token e senão encontrar vai falhar

    const tokenAge = Math.abs(userByToken.tokens[0].createdAt.diffNow('hours').hours) //Vai contar o tempo de vida em horas do token que foi criado
    if(tokenAge > 2) throw new TokenExpiredException() //Se o tempo de vida do token for maior que duas horas, retorna uma erro

    userByToken.password = password
    await userByToken.save()
    await userByToken.tokens[0].delete() //deletando o token depois de usar ele



    return response.noContent()
  }

}
