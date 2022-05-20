import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Group from 'App/Models/Group'
import CreateGroupValidator from 'App/Validators/CreateGroupValidator'

export default class GroupsController {

  public async store({ request, response }: HttpContextContract){
    const groupPayload = await request.validate(CreateGroupValidator)
    const group = await Group.create(groupPayload)

    await group.related('players').attach([groupPayload.master]) //carrega a lista de players do grupo que acabou de ser criado e adiciona como mestre da mesa o usuário que criou o grupo
    await group.load('players') //carrega/atualiza a lista de jogadores atualizados para dentro do grupo criado

    return response.created({group})
  }

}
