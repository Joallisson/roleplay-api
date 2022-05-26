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

}
