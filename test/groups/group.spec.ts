import User from 'App/Models/User';
import { UserFactory } from 'Database/factories';
import Database from '@ioc:Adonis/Lucid/Database';
import test from 'japa'
import supertest from 'supertest'

const BASE_URL = `http://${process.env.HOST}:${process.env.PORT}`

let token //Criando uma variável que irá guardar o token do usuário que será criado no hook group.before()
let user = {} as User //Criando uma variável que irá guardar o usuário que será criado no hook group.before()

test.group('Group', (group) => {

  test('it should create a group', async (assert) => {
    const user = await UserFactory.create()
    const groupPayload = { //detalhes da mesa
      name: 'test', //nome da mesa
      description: 'test',
      schedule: 'test', //Periodicionade da mesa
      location: 'test',
      chronic: 'test', //nome da historia que o mestre da mesa vai narrar
      master: user.id //mestre da mesa
    }

    const { body } = await supertest(BASE_URL)
      .post('/groups')
      .set('Authorization', `Bearer ${token}`) //Passando cabeçalho //Passando nome do cabeçalho e o token de autenticação
      .send(groupPayload)
      .expect(201)

    assert.exists(body.group, 'Group undefined')
    assert.equal(body.group.name, groupPayload.name)
    assert.equal(body.group.description, groupPayload.description)
    assert.equal(body.group.schedule, groupPayload.schedule)
    assert.equal(body.group.location, groupPayload.location)
    assert.equal(body.group.chronic, groupPayload.chronic)
    assert.equal(body.group.master, groupPayload.master)

    //Por padrão quem cria a mesa se torna o mestre
    assert.exists(body.group.players, 'Players undefined') //Se existe os jogadores da mesa
    assert.equal(Object.keys(body.group.players).length, 1) //se o tanto de jogadores é igual a 1, nesse caso como tá criando as mesas só vai ter o mestre
    assert.equal(body.group.players[0].id, groupPayload.master) //se o id do mestre é igual ao groupPayload.master
  })

  test('it should return 422 when required data is not provided', async (assert) => {
    const { body } = await supertest(BASE_URL)
    .post('/groups')
    .set('Authorization', `Bearer ${token}`) //Passando cabeçalho //Passando nome do cabeçalho e o token de autenticação
    .send({})
    .expect(422)

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

  group.beforeEach(async () => {
    await Database.beginGlobalTransaction()
  })

  group.afterEach(async () => {
    await Database.rollbackGlobalTransaction()
  })
})
