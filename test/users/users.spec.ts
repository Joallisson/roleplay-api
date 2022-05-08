import { UserFactory } from './../../database/factories/index';
import test from 'japa'
import supertest from 'supertest'
import Database from '@ioc:Adonis/Lucid/Database';

const BASE_URL = `http://${process.env.HOST}:${process.env.PORT}`

/*
  {
    "users": {
      "id": number,
      "email": string,
      "username": string,
      "password": string,
      "avatar": string
    }
  }
*/

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

  test.only('it should update an user', async (assert) => {
    const { id, password } = await UserFactory.create()
    const email = 'teste@teste.com'
    const avatar = 'http://imagemdeteste.png'

    const { body } = await supertest(BASE_URL)
      .put(`/users/${id}`)
      .send({
        email,
        avatar,
        password
      })
      .expect(200)

      assert.exists(body.user, 'User undefined')
      assert.equal(body.user.email, email)
      assert.equal(body.user.avatar, avatar)
      assert.equal(body.user.id, id)
  })

//=====================================================================================

  group.beforeEach(async () => { //Antes de executar cada teste, inicia uma transação
    await Database.beginGlobalTransaction()
  })

  group.afterEach(async () => { //Depois de executar cada teste, inicia uma transação
    await Database.rollbackGlobalTransaction()
  })

})
