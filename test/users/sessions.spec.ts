import { UserFactory } from './../../database/factories/index';
import Database from "@ioc:Adonis/Lucid/Database";
import test from "japa";
import supertest from "supertest";

const BASE_URL = `http://${process.env.HOST}:${process.env.PORT}`

test.group('Session', (group) => {

  test('it should authenticate an user', async (assert) => {
    const plainPassword = 'test'
    const { email, id } = await UserFactory.merge({password: plainPassword}).create()

    const { body } = await supertest(BASE_URL)
      .post('/sessions')
      .send({email, password: plainPassword})
      .expect(201)

    assert.isDefined(body.user, 'User undefined')
    assert.equal(body.user.id, id)

  })

  test('it should return an api token when session is created', async (assert) => {
    const plainPassword = 'test'
    const { email, id } = await UserFactory.merge({password: plainPassword}).create()

    const { body } = await supertest(BASE_URL)
      .post('/sessions')
      .send({email, password: plainPassword})
      .expect(201)

    assert.isDefined(body.token, 'Token undefined')
    assert.equal(body.user.id, id)
  })

  test('it should return 400 when credencials are not provided', async (assert) => {
    const { body } = await supertest(BASE_URL).post('/sessions').send({}).expect(400)
    assert.equal(body.code, 'BAD_REQUEST')
    assert.equal(body.status, 400)
  })

  test('it should return 400 when credentials are invalid', async (assert) => {
    const { email } = await UserFactory.create()
    const { body } = await supertest(BASE_URL).post('/sessions').send({
      email,
      password: 'test'
    }).expect(400)

    assert.equal(body.code, 'BAD_REQUEST')
    assert.equal(body.status, 400)
    assert.equal(body.message, 'invalid credentials')
  })

  test('it should return 200 when user signs out', async (assert) => {
    const plainPassword = 'test'
    const { email, id } = await UserFactory.merge({password: plainPassword}).create() //cria o usuário no bd

    const { body } = await supertest(BASE_URL) //manda as credenciais para logar na api
      .post('/sessions')
      .send({email, password: plainPassword})
      .expect(201)

    const apiToken = body.token

    await supertest(BASE_URL) //pedindo para sair da api, e otoken é apagado
      .delete('/sessions')
      .set('Authorization', `Bearer ${apiToken.token}`) //Passando dados pelo cabeçalho da requisição
      .expect(200)
  })

  test.only('it should revoke token when user signs out', async (assert) => {
    const plainPassword = 'test'
    const { email, id } = await UserFactory.merge({password: plainPassword}).create() //cria o usuário no bd

    const { body } = await supertest(BASE_URL) //manda as credenciais para logar na api
      .post('/sessions')
      .send({email, password: plainPassword})
      .expect(201)

    const apiToken = body.token

    const tokenBeforeSignout = await Database.query()
      .select('*')
      .from('api_tokens') //Pega o token antes dele ser deletado quando o usuário faz signout

    console.log(tokenBeforeSignout)

    await supertest(BASE_URL) //pedindo para sair da api, O LOGOUT É BASICAMENTE DELETAR A SESSÃO COM O TOKEN DO USUÁRIO
      .delete('/sessions')
      .set('Authorization', `Bearer ${apiToken.token}`) //Passando dados pelo cabeçalho da requisição
      .expect(200)

    const token = await Database.query()
      .select('*')
      .from('api_tokens') //Seleciona tudo da tabela api_tokens onde token é igual ao token que o usuário recebeu quando fez login na api

      console.log(token)
    assert.isEmpty(token) //O token tem que e stá vazio, pois depois que o usuário faz logout o token dele é deletado

  })

  group.beforeEach(async () => {
    await Database.beginGlobalTransaction()
  })
  group.afterEach(async () => {
    await Database.rollbackGlobalTransaction()
  })
})
