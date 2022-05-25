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
