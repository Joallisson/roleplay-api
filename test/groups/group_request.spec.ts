import GroupRequest from 'App/Models/GroupRequest';
import { group } from 'japa';
import { UserFactory } from 'Database/factories';
import { GroupFactory } from './../../database/factories/index';
import Database from '@ioc:Adonis/Lucid/Database';
import test from 'japa'
import supertest from 'supertest'
import User from 'App/Models/User';

const BASE_URL = `http://${process.env.HOST}:${process.env.PORT}`

let token //Criando uma variável que irá guardar o token do usuário que será criado no hook group.before()
let user = {} as User //Criando uma variável que irá guardar o usuário que será criado no hook group.before()

test.group('Group  Request', (group) => {

  test('it should create a group request', async (assert) => {
    const {id} = await UserFactory.create() //Criando o master/mestre
    const group = await GroupFactory.merge({master: id}).create() //criando o grupo e passando o id do master para ser o mestre do grupo
    const { body } = await supertest(BASE_URL)
    .post(`/groups/${group.id}/requests`) //passando no endpoint o id do grupo que o usuário quer participar
    .set('Authorization', `Bearer ${token}`) //Passando cabeçalho //Passando nome do cabeçalho e o token de autenticação
    .send({})
    .expect(201)//o 201 é quando o objeto é criado

    assert.exists(body.groupRequest, 'Group Request undefined')
    assert.equal(body.groupRequest.userId, user.id)
    assert.equal(body.groupRequest.groupId, group.id)
    assert.equal(body.groupRequest.status, 'PENDING')
  })

  test('it should return 409 when group request already exists', async (assert) => {
    const { id } = await UserFactory.create()
    const group = await GroupFactory.merge({master: id}).create()

    await supertest(BASE_URL) //Solicitando pela primeira vez para participar do grupo
      .post(`/groups/${group.id}/requests`)
      .set('Authorization', `Bearer ${token}`) //passando o token do usuário global
      .send({})

    const { body } = await supertest(BASE_URL)
      .post(`/groups/${group.id}/requests`)
      .set('Authorization', `Bearer ${token}`) //Passando o token do mesmo usuário que fez a solicitação na primeira vez para participar do grupo
      .send({})
      .expect(409) //O status/codigo 409 significa conflito

    assert.equal(body.code, 'BAD_REQUEST')
    assert.equal(body.status, 409)
  })

  test('it should return 422 when user is already in the group', async (assert) => {
    const groupPayload = { //dados do grupo
      name: 'test',
      description: 'test',
      schedule: 'test',
      location: 'test',
      chronic: 'test',
      master: user.id //o id do usuário criado globalmente vai ser usado para criar o grupo e ser o mestre dele
    }

    //Master is added to group
    const response = await supertest(BASE_URL) //Criando grupo para testar se um usuário já no grupo pode fazer uma nova solicitação para participar do grupo
      .post('/groups')
      .set('Authorization', `Bearer ${token}`)
      .send(groupPayload)

    const { body } = await supertest(BASE_URL)
    .post(`/groups/${response.body.group.id}/requests`) //passando o id do group criado
    .set('Authorization', `Bearer ${token}`)
    .send({})
    .expect(422) //O status/codigo 409 significa conflito

    assert.equal(body.code, 'BAD_REQUEST')
    assert.equal(body.status, 422)
  })

  test('it should list group requests', async (assert) => {
    const master = await UserFactory.create()
    const group = await GroupFactory.merge({ master: master.id }).create()

    const response = await supertest(BASE_URL) //Fazendo uma solicitação para entrar em um grupo
      .post(`/groups/${group.id}/requests`)
      .set('Authorization', `Bearer ${token}`)
      .send({})

    const groupRequest = response.body.groupRequest

    const { body } = await supertest(BASE_URL) //Listando solicitações para mesas filtradas pelo mestre
      .get(`/groups/${group.id}/requests?master=${master.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200) //Retorna uma lista de usuários filtrando pelo master

    assert.exists(body.groupRequest, 'GroupRequest undefined')
    assert.equal(Object.values(body.groupRequest).length, 1)
    assert.equal(body.groupRequest[0].id, groupRequest.id)
    assert.equal(body.groupRequest[0].userId, groupRequest.userId)
    assert.equal(body.groupRequest[0].groupId, groupRequest.groupId)
    assert.equal(body.groupRequest[0].status, groupRequest.status)
    assert.equal(body.groupRequest[0].group.name, group.name)
    assert.equal(body.groupRequest[0].user.username, user.username)
    assert.equal(body.groupRequest[0].group.master, master.id)

  })

  test('it should return an empty list when master has no group requests', async (assert) => {
    const master = await UserFactory.create()
    const group = await GroupFactory.merge({ master: master.id }).create()

    await supertest(BASE_URL) //Fazendo uma solicitação para entrar em um grupo
      .post(`/groups/${group.id}/requests`)
      .set('Authorization', `Bearer ${token}`)
      .send({})

    const { body } = await supertest(BASE_URL) //Listando solicitações para mesas filtradas pelo mestre
      .get(`/groups/${group.id}/requests?master=${user.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200) //Retorna uma lista de usuários filtrando pelo user.id

      assert.exists(body.groupRequest, 'GroupRequests undefined')
      assert.equal(Object.values(body.groupRequest).length, 0)
  })

  test('it should return 422 when master is not provided', async (assert) => {
    const master = await UserFactory.create()
    const group = await GroupFactory.merge({ master: master.id }).create()

    const { body } = await supertest(BASE_URL) //Listando solicitações para mesas filtradas pelo mestre
      .get(`/groups/${group.id}/requests`)
      .set('Authorization', `Bearer ${token}`)
      .expect(422) //Retorna uma lista de usuários filtrando pelo user.id

      assert.exists(body.code, 'BAD_REQUEST')
      assert.equal(body.status, 422)
  })

  test('it should accept a group request', async (assert) => {
    const master = await UserFactory.create()
    const group = await GroupFactory.merge({ master: master.id }).create()

    const { body } = await supertest(BASE_URL) //Usuário Fazendo uma solicitação para entrar em um grupo
      .post(`/groups/${group.id}/requests`)
      .set('Authorization', `Bearer ${token}`) //Passando o user global como sendo o usuário que quer participar de uma mesa //o token do usuário já possui todas as informações do usuário
      .send({})

    const response = await supertest(BASE_URL) //Aceitar solicitação de usuário para participar da mesa
    .post(`/groups/${group.id}/requests/${body.groupRequest.id}/accept`)
    .set('Authorization', `Bearer ${token}`)
    .expect(200) //retorna um .ok()

    assert.exists(response.body.groupRequest, 'GroupRequest undefined')
    assert.equal(response.body.groupRequest.userId, user.id)
    assert.equal(response.body.groupRequest.groupId, group.id)
    assert.equal(response.body.groupRequest.status, 'ACCEPTED')

    await group.load('players') //carregando o relacionamento players depois que o usuário fez a solicitação para participar da mesa

    assert.isNotEmpty(group.players)
    assert.equal(Object.values(group.players).length, 1) //É pra ter só o usuário que fez a solicitação para participar da mesa, pois o mestre só é adicionado no relacionamento 'players' quando eu acesso a rota para criar um grupo
    assert.equal(group.players[0].id, user.id)


  })

  test('it should return 404 when providing an unexisting group', async (assert) => {

    const master = await UserFactory.create()
    const group = await GroupFactory.merge({ master: master.id }).create()

    const { body } = await supertest(BASE_URL) //Usuário Fazendo uma solicitação para entrar em um grupo
      .post(`/groups/${group.id}/requests`)
      .set('Authorization', `Bearer ${token}`) //Passando o user global como sendo o usuário que quer participar de uma mesa //o token do usuário já possui todas as informações do usuário
      .send({})

    const response = await supertest(BASE_URL) //Aceitar solicitação de usuário para participar da mesa
      .post(`/groups/123/requests/${body.groupRequest.id}/accept`)
      .set('Authorization', `Bearer ${token}`)
      .expect(404) //retorna uma BadRequest()

      assert.equal(response.body.code, 'BAD_REQUEST')
      assert.equal(response.body.status, 404)
  })

  test('it should return 404 when providing an unexisting group request', async (assert) => {

    const master = await UserFactory.create()
    const group = await GroupFactory.merge({ master: master.id }).create()

    await supertest(BASE_URL) //Usuário Fazendo uma solicitação para entrar em um grupo
      .post(`/groups/${group.id}/requests`)
      .set('Authorization', `Bearer ${token}`) //Passando o user global como sendo o usuário que quer participar de uma mesa //o token do usuário já possui todas as informações do usuário
      .send({})

    const response = await supertest(BASE_URL) //Aceitar solicitação de usuário para participar da mesa
      .post(`/groups/${group.id}/requests/123/accept`)
      .set('Authorization', `Bearer ${token}`)
      .expect(404) //retorna uma BadRequest()

      assert.equal(response.body.code, 'BAD_REQUEST')
      assert.equal(response.body.status, 404)
  })

  test('it should reject a group request', async (assert) => {
    const master = await UserFactory.create()
    const group = await GroupFactory.merge({ master: master.id }).create()

    const { body } = await supertest(BASE_URL) //Usuário Fazendo uma solicitação para entrar em um grupo
      .post(`/groups/${group.id}/requests`)
      .set('Authorization', `Bearer ${token}`) //Passando o user global como sendo o usuário que quer participar de uma mesa //o token do usuário já possui todas as informações do usuário
      .send({})

    await supertest(BASE_URL) //Aceitar solicitação de usuário para participar da mesa
      .delete(`/groups/${group.id}/requests/${body.groupRequest.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200)

    const groupRequest = await GroupRequest.find(body.groupRequest.id) //Fazendo uma consulta no bd e verificando se encontra o id da requisição para fazer parte do grupo

    assert.isNull(groupRequest)
  })

  test('it should return 404 when providing an unexisting group for rejection', async (assert) => {

    const master = await UserFactory.create()
    const group = await GroupFactory.merge({ master: master.id }).create()

    const {body} = await supertest(BASE_URL) //Usuário Fazendo uma solicitação para entrar em um grupo //retorna a criação da groupRequest
      .post(`/groups/${group.id}/requests`)
      .set('Authorization', `Bearer ${token}`) //Passando o user global como sendo o usuário que quer participar de uma mesa //o token do usuário já possui todas as informações do usuário
      .send({})

    const response = await supertest(BASE_URL) //Rejeitar solicitação de usuário para participar da mesa, passando um grupo inexistente
      .delete(`/groups/123/requests/${body.groupRequest.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(404) //retorna uma BadRequest()

      assert.equal(response.body.code, 'BAD_REQUEST')
      assert.equal(response.body.status, 404)

  })

  test('it should return 404 when providing an unexisting group request for rejection', async (assert) => {

    const master = await UserFactory.create()
    const group = await GroupFactory.merge({ master: master.id }).create()

    await supertest(BASE_URL) //Usuário Fazendo uma solicitação para entrar em um grupo
      .post(`/groups/${group.id}/requests`)
      .set('Authorization', `Bearer ${token}`) //Passando o user global como sendo o usuário que quer participar de uma mesa //o token do usuário já possui todas as informações do usuário
      .send({})

    const response = await supertest(BASE_URL) //Rejeitar solicitação de usuário para participar da mesa, passando uma solicitação inexistente
      .delete(`/groups/${group.id}/requests/123`)
      .set('Authorization', `Bearer ${token}`)
      .expect(404) //retorna uma BadRequest()

      assert.equal(response.body.code, 'BAD_REQUEST')
      assert.equal(response.body.status, 404)

  })



  group.before(async () => { //esse hook roda antes de cada teste

    //NESSE CASO O USUÁRIO ESTÁ SENDO CRIADO PRIMEIRO E ANTES DOS TESTES, POIS ELE SERÁ CRIADO GLOBALMENTE E USADO POR TODOS OS TESTES
    //PARA UM USUARIO TER AUTORIZAÇÃO DETRO DA API, ELE PRECISA SE AUTENTICAR E SERÁ CRIADO UM TOKEN PARA SER USADO PELO USUÁRIO ENQUANTO ELE NÃO FIZER LOGOUT
    //QUANDO UM USUÁRIO CRIA UMA SESSÃO/FAZ LOGIN ELE RECEBE UM TOKEN QUE É USADO PARA SABER SE ELE TEM PERMISSÃO REALIZAR DETERMINADAS AÇÕES DENTRO DA API
    const plainPassword = 'test'
    const newUser = await UserFactory.merge({password: plainPassword}).create() //cria o usuário no bd

    const { body } = await supertest(BASE_URL) //manda as credenciais para logar na api
      .post('/sessions')
      .send({email: newUser.email, password: plainPassword})
      .expect(201)

    token = body.token.token
    user = newUser
  })

  group.after(async () => { //depois de executar todos os testes, o adonis vai revogar/apagar o token do usuário criado no hook before
    await supertest(BASE_URL).delete('/sessions').set('Authorization', `Bearer ${token}`)
  })

  group.beforeEach(async () => { //Hook para antes de cada transação
    await Database.beginGlobalTransaction()
  })

  group.afterEach(async () => { //Hook para depois de cada transação
    await Database.rollbackGlobalTransaction()
  })

})
