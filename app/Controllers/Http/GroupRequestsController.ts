import BadRequest from 'App/Exceptions/BadRequestException';
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import GroupRequest from 'App/Models/GroupRequest'
import Group from 'App/Models/Group';

export default class GroupRequestsController {

  public async index({ request, response }: HttpContextContract){

    const { master } = request.qs() //retorna os parâmetros passados depois do sinal de interrogação // request.qs() significa query string da requisição

    if(!master) throw new BadRequest('master query should be provided', 422) //caso não seja passado o id do mestre como filtro nos parâmetros na requisição, então retorna uma BadRequest

    const groupRequest = await GroupRequest.query() //listando uma lista de usuários baseado pelo id passado na requisição
      .select('id', 'groupId', 'userId', 'status') //os campos do GroupRequest que eu vou querer
      .preload('group', (query) => {
        query.select('name', 'master') //os campos do group que eu vou querer
      }) //vai carregar o relacionamento group para retornar dentro do groupRequest
      .preload('user', (query) => {
        query.select('username') //os campos do group que eu vou querer
      }) //vai carregar o relacionamento user para retornar dentro do groupRequest
      .whereHas('group', (query) => { //Passa o relacionamento como primeiro parâmetro e o segundo uma arrow function
          query.where('master', Number(master)) //dentro do relacionamento grupo busca o id passado na requisição // converte o master para number no segundo parâmetro
        })
      .where('status', 'PENDING')

    return response.ok({groupRequest})
  }

  public async store({request, response, auth}: HttpContextContract){

    const groupId = request.param('groupId') as number //Pegando o groupId que é passado como parâmetro na url da rota e covertendo para number
    const userId = auth.user!.id //O sinal de exclamação ! serve para dizer para o typescript que sempre vai haver um auth.user.id

    const existingGroupRequest = await GroupRequest.query() //verificando se JÁ existe uma solicitação feita por um mesmo usuário para participar do grupo
      .where('groupId', groupId) //O primeiro paâmetro é o campo e o segundo o valor
      .andWhere('userId', userId) //O primeiro paâmetro é o campo e o segundo o valor
      .first() //vai pegar o primeiro valor que encontrar

    if(existingGroupRequest) throw new BadRequest('group request already exists', 409) //SE O MESMO USUÁRIO FIZER MAIS DE UMA SOLICITÇÃO PARA PARTICIPAR DO MESMO GRUPO ENTÃO RETORNA ESSA BAD REQUEST

    const userAlreadyInGroup = await Group.query()
      .whereHas('players', (query) => { //O primeiro parâmetro deve ser um relacionamento que esteja dentro do group, o segundo é uma arrow funsction que vai verificar se existe um campo específico dentro do relacionamento
        query.where('id', userId) //verificando se existe esse id dentro desse relacionamento
      })
      .andWhere('id', groupId) //Se existe o id do grupo nessa solicitação
      .first() //pega o primeiro usuário que encontrar

    if(userAlreadyInGroup) throw new BadRequest('user is already in the group',  422)

    const groupRequest = await GroupRequest.create({ groupId, userId })

    await groupRequest.refresh() //atualiza o estado atual do modelo

    return response.created({groupRequest})
  }

  public async accept({ request, response, bouncer }: HttpContextContract){

    const requestId = request.param('requestId') as number
    const groupId = request.param('groupId') as number

    const groupRequest = await GroupRequest.query() //Vai no modelo/tabela do bd e onde o campo id for igual ao id passado na requisição e também verifica onde groupId é igual ao groupId passado requisição
      .where('id', requestId)
      .andWhere('groupId', groupId)
      .firstOrFail() //Encontra e retorna o primeiro registro que tenha o id e o groupId no bd

    await groupRequest.load('group') //carregando o relacionamento group
    await bouncer.authorize('acceptGroupRequest', groupRequest) //autorizando aceitar o usuário na mesa coma regra acceptGroupRequest criada no bouncer e passando o groupRequest como parâmetro

    const updateGroupRequest = await groupRequest.merge({ status: 'ACCEPTED' }) //Atualiza o status da solicitação para ACCEPTED

    await groupRequest.load('group')
    await groupRequest.group.related('players').attach([groupRequest.userId]) //o userId vai fazer parte dos players do grupo groupRequest

    return response.ok({ groupRequest: updateGroupRequest })
  }

  public async destroy({ request, response, bouncer }: HttpContextContract){

    const requestId = request.param('requestId') as number
    const groupId = request.param('groupId') as number

    const groupRequest = await GroupRequest.query() //Vai no modelo/tabela do bd e onde o campo id for igual ao id passado na requisição e também verifica onde groupId é igual ao groupId passado requisição
      .where('id', requestId)
      .andWhere('groupId', groupId)
      .firstOrFail() //Encontra e retorna o primeiro registro que tenha o id e o groupId no bd

      await groupRequest.load('group') //carregando o relacionamento group
      await bouncer.authorize('rejectGroupRequest', groupRequest) //autorizando rejeitar o usuário na mesa coma regra acceptGroupRequest criada no bouncer e passando o groupRequest como parâmetro

    await groupRequest.delete() //deletando/negando a solicitação do usuário de fazer parte da mesa

    return response.ok({})

  }

}
