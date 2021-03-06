import User from 'App/Models/User';
import { UserFactory } from './../../database/factories/index';
import test from 'japa'
import supertest from 'supertest' //O supertest é o servidor de teste
import Database from '@ioc:Adonis/Lucid/Database';
import Hash from '@ioc:Adonis/Core/Hash'

const BASE_URL = `http://${process.env.HOST}:${process.env.PORT}`

let token //Criando uma variável que irá guardar o token do usuário que será criado no hook group.before()
let user = {} as User //Criando uma variável que irá guardar o usuário que será criado no hook group.before()

test.group('User', (group) => {
  test('it should create an user', async (assert) => {
    const userPayload = {
      email: 'test@test.com',
      username: 'test',
      password: 'test',
      avatar: 'https://image.com/teste'
    }
    const { body } = await supertest(BASE_URL).post('/users').send(userPayload).expect(201)

    assert.exists(body.user, 'User undefined')
    assert.exists(body.user.id, 'Id undefined')
    assert.equal(body.user.email, userPayload.email)
    assert.equal(body.user.username, userPayload.username)
    assert.notExists(body.user.password, 'Password defined')
  })

//=====================================================================================

  test('it should return 409 when email is already in use', async (assert) => {
    const { email } = await UserFactory.create()
    const { body } = await supertest(BASE_URL).post('/users')
    .send(
      {
        email,
        username: "teste",
        password: "teste"
      }
    ).expect(409)

    assert.exists(body.message)
    assert.exists(body.code)
    assert.exists(body.status)
    assert.include(body.message, 'email')
    assert.equal(body.code, 'BAD_REQUEST')
    assert.equal(body.status, 409)

  })

//=====================================================================================

  test('it should return 409 when username is already in use', async (assert) => {
    const { username } = await UserFactory.create()
    const { body } = await supertest(BASE_URL).post('/users')
    .send(
      {
        email: 'teste@teste.com',
        username,
        password: 'teste'
      }
    )
    .expect(409)

    assert.exists(body.message)
    assert.exists(body.code)
    assert.exists(body.status)
    assert.include(body.message, 'username')
    assert.equal(body.code, 'BAD_REQUEST')
    assert.equal(body.status, 409)
  })

//=====================================================================================

  test('it should return 422 when required data is not provided', async (assert) => {
    const { body } = await supertest(BASE_URL).post('/users').send({}).expect(422)
    assert.equal(body.code, 'BAD_REQUEST')
    assert.equal(body.status, 422)
  })

//=====================================================================================

  test('it should return 422 when providing an invalid email', async (assert) => {
    const { body } = await supertest(BASE_URL)
    .post('/users')
    .send({
      email: 'test@',
      username: 'test',
      password: 'test'
    }).expect(422)
    assert.equal(body.code, 'BAD_REQUEST')
    assert.equal(body.status, 422)
  })

//=====================================================================================

test('it should return 422 when providing an invalid password', async (assert) => {
  const { body } = await supertest(BASE_URL)
  .post('/users')
  .send({
    email: 'test@test.com',
    username: 'test',
    password: 'tes'
  }).expect(422)
  assert.equal(body.code, 'BAD_REQUEST')
  assert.equal(body.status, 422)
})

//=====================================================================================

  test('it should update an user', async (assert) => {

    //Dados que eu vou alterar
    const email = 'teste@teste.com'
    const avatar = 'http://imagemdeteste.png'

    const { body } = await supertest(BASE_URL) //mandando requisição para o servidor de teste
      .put(`/users/${user.id}`)
      .set('Authorization', `Bearer ${token}`) //Passando dados pelo cabeçalho da requisição, nesse caso está dizendo que esse usuário está autenticado
      .send({
        email,
        avatar,
        password: user.password
      })
      .expect(200)

      assert.exists(body.user, 'User undefined')
      assert.equal(body.user.email, email)
      assert.equal(body.user.avatar, avatar)
      assert.equal(body.user.id, user.id)
  })

//=====================================================================================

  test('it should update the password of the user', async (assert) => {

    //Dados que eu vou alterar
    const password = 'teste'

    const { body } = await supertest(BASE_URL) //mandando requisição para o servidor de teste e retornando o body/corpo da resposta
      .put(`/users/${user.id}`)
      .set('Authorization', `Bearer ${token}`) //Passando dados pelo cabeçalho da requisição, nesse caso está dizendo que esse usuário está autenticado
      .send({
        email: user.email,
        avatar: user.avatar,
        password
      })
      .expect(200)

      await user.refresh() //Atualizando dados do user depois que atualiza a senha

      assert.exists(body.user, 'User undefined')
      assert.equal(body.user.id, user.id)
      assert.isTrue(await Hash.verify(user.password, password)) //Verificando se a senha que foi passada na requisição para atualizar no bd é igual a senha que tá atualmente no bd

  })

//=====================================================================================

  test('it should return 422 when required data is not provided', async (assert) => {
    const { id } = await UserFactory.create()
    const { body } = await supertest(BASE_URL)
    .put(`/users/${id}`)
    .set('Authorization', `Bearer ${token}`) //Passando dados pelo cabeçalho da requisição, nesse caso está dizendo que esse usuário está autenticado
    .send({})
    .expect(422)

    assert.equal(body.code, 'BAD_REQUEST')
    assert.equal(body.status, 422)
  })

//=====================================================================================

  test('it should return 422 when providing an invalid email', async (assert) => {
    const { id, password, avatar } = await UserFactory.create()
    const { body } = await supertest(BASE_URL)
    .put(`/users/${id}`)
    .set('Authorization', `Bearer ${token}`) //Passando dados pelo cabeçalho da requisição, nesse caso está dizendo que esse usuário está autenticado
    .send({
      password,
      avatar,
      email: 'teste@'
    }).expect(422)

    assert.equal(body.code, 'BAD_REQUEST')
    assert.equal(body.status, 422)
  })

//=====================================================================================

  test('it should return 422 when providing an invalid password', async (assert) => {
    const { id, email, avatar } = await UserFactory.create()
    const { body } = await supertest(BASE_URL)
      .put(`/users/${id}`)
      .set('Authorization', `Bearer ${token}`) //Passando dados pelo cabeçalho da requisição, nesse caso está dizendo que esse usuário está autenticado
      .send({
      password: 'te',
      avatar,
      email
    }).expect(422)

    assert.equal(body.code, 'BAD_REQUEST')
    assert.equal(body.status, 422)
  })

//=====================================================================================

  test('it should return 422 when providing an invalid avatar', async (assert) => {
    const { id, password, email } = await UserFactory.create()
    const { body } = await supertest(BASE_URL)
    .put(`/users/${id}`)
    .set('Authorization', `Bearer ${token}`) //Passando dados pelo cabeçalho da requisição, nesse caso está dizendo que esse usuário está autenticado
    .send({
      password,
      avatar: 'teste',
      email
    }).expect(422)

    assert.equal(body.code, 'BAD_REQUEST')
    assert.equal(body.status, 422)
  })

//=====================================================================================

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

  group.beforeEach(async () => { //Antes de executar cada teste, inicia uma transação
    await Database.beginGlobalTransaction()
  })

  group.afterEach(async () => { //Depois de executar cada teste, inicia uma transação
    await Database.rollbackGlobalTransaction()
  })

})
