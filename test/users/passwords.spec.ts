import { UserFactory } from 'Database/factories';
import Database from '@ioc:Adonis/Lucid/Database';
import test, { group } from "japa";
import supertest from 'supertest'; //Servidor de teste

const BASE_URL = `http://${process.env.HOST}:${process.env.PORT}`

test.group('Password', (group) => {

  test.only('it should send an email with forgot password instructions', async (assert) => {
    const user = await UserFactory.create()

    await supertest(BASE_URL).post('/forgot-password').send({
      email: user.email,
      resetPasswordUrl: 'url'
    }).expect(204)

  })

  group.beforeEach(async () => { //Antes de executar cada teste, inicia uma transação
    await Database.beginGlobalTransaction()
  })

  group.afterEach(async () => { //Depois de executar cada teste, inicia uma transação
    await Database.rollbackGlobalTransaction()
  })
})
