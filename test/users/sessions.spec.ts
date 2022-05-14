import { UserFactory } from './../../database/factories/index';
import Database from "@ioc:Adonis/Lucid/Database";
import test from "japa";
import supertest from "supertest";

const BASE_URL = `http://${process.env.HOST}:${process.env.PORT}`

test.group('Session', (group) => {

  test.only('it should authenticate an user', async (assert) => {
    const plainPassword = 'test'
    const { email, id } = await UserFactory.merge({email: plainPassword}).create()

    const { body } = await supertest(BASE_URL)
      .post('/sessions')
      .send({email, password: plainPassword})
      .expect(201)

    assert.isDefined(body.user, 'User undefined')
    assert.equal(body.user.id, id)

  })


  group.beforeEach(async () => {
    await Database.beginGlobalTransaction()
  })
  group.afterEach(async () => {
    await Database.rollbackGlobalTransaction()
  })
})
