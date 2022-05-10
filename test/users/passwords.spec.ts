import { UserFactory } from 'Database/factories';
import Database from '@ioc:Adonis/Lucid/Database';
import test, { group } from "japa";
import supertest from 'supertest'; //Servidor de teste
import Mail from '@ioc:Adonis/Addons/Mail';
import { Assert } from 'japa/build/src/Assert';

const BASE_URL = `http://${process.env.HOST}:${process.env.PORT}`

test.group('Password', (group) => {

  test.only('it should send an email with forgot password instructions', async (assert) => {
    const user = await UserFactory.create()

    const mailer = Mail.fake() //Capturando email mandado pela aplicação

    await supertest(BASE_URL).post('/forgot-password').send({
      email: user.email,
      resetPasswordUrl: 'url'
    }).expect(204)


    assert.isTrue(mailer.exists({ //Usando o email capturado para verificar se ele está tudo correto
      subject: 'O envio de email deu certo',
      to: [{
        address: user.email
      }],
      from: {
        address: 'no-reply@roleplay.com'
      },
      text: 'Clique no link abaixo para redefinir sua senha'
    }))

    Mail.restore() //Liberando os emails capturados
  })

  group.beforeEach(async () => { //Antes de executar cada teste, inicia uma transação
    await Database.beginGlobalTransaction()
  })

  group.afterEach(async () => { //Depois de executar cada teste, inicia uma transação
    await Database.rollbackGlobalTransaction()
  })
})
