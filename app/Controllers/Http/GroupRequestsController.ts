import BadRequest from 'App/Exceptions/BadRequestException';
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import GroupRequest from 'App/Models/GroupRequest'

export default class GroupRequestsController {

  public async store({request, response, auth}: HttpContextContract){

    const groupId = request.param('groupId') as number //Pegando o groupId que é passado como parâmetro na url da rota e covertendo para number
    const userId = auth.user!.id //O sinal de exclamação ! serve para dizer para o typescript que sempre vai haver um auth.user.id

    const existingGroupRequest = await GroupRequest.query() //verificando se JÁ existe uma solicitação feita por um mesmo usuário para participar do grupo
      .where('groupId', groupId) //O primeiro paâmetro é o campo e o segundo o valor
      .andWhere('userId', userId) //O primeiro paâmetro é o campo e o segundo o valor
      .first() //vai pegar o primeiro valor que encontrar
    if(existingGroupRequest) throw new BadRequest('group request already exists', 409) //SE O MESMO USUÁRIO FIZER MAIS DE UMA SOLICITÇÃO PARA PARTICIPAR DO MESMO GRUPO ENTÃO RETORNA ESSA BAD REQUEST

    const groupRequest = await GroupRequest.create({ groupId, userId })

    await groupRequest.refresh() //atualiza o estado atual do modelo

    return response.created({groupRequest})
  }

}
