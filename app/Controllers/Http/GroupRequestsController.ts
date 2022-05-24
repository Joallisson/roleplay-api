import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import GroupRequest from 'App/Models/GroupRequest'

export default class GroupRequestsController {

  public async store({request, response, auth}: HttpContextContract){

    const groupId = request.param('groupId') as number //Pegando o groupId que é passado como parâmetro na url da rota e covertendo para number
    const userId = auth.user!.id //O sinal de exclamação ! serve para dizer para o typescript que sempre vai haver um auth.user.id
    const groupRequest = await GroupRequest.create({ groupId, userId })

    await groupRequest.refresh() //atualiza o estado atual do modelo

    return response.created({groupRequest})
  }

}
