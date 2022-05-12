import Hash from '@ioc:Adonis/Core/Hash';
import { UserFactory } from 'Database/factories';
import Database from '@ioc:Adonis/Lucid/Database';
import test, { group } from "japa";
import supertest from 'supertest'; //Servidor de teste
import Mail from '@ioc:Adonis/Addons/Mail';

const BASE_URL = `http://${process.env.HOST}:${process.env.PORT}`

test.group('Password', (group) => {

  test('it should send an email with forgot password instructions', async (assert) => {
    const user = await UserFactory.create()

    const mailer = Mail.fake() //Capturando email mandado pela aplicação

    await supertest(BASE_URL).post('/forgot-password').send({
      email: user.email,
      resetPasswordUrl: 'url'
    }).expect(204)


    assert.isTrue(mailer.exists({ //Usando o email capturado para verificar se ele está tudo correto
      subject: 'Bora ver dessa vez',
      to: [{
        address: user.email
      }],
      from: {
        address: 'no-reply@roleplay.com'
      }
    }))

    assert.isTrue(mailer.exists((mail) => { //Verificando se o nome do usuário está dentro do html que eu estou mandando pra ele no email
      assert.include(mail.html!, user.username) //Essa exclamação é para dizer pro typescript que o html irá vir com certeza junto com o email

      return true
    }))


    Mail.restore() //Liberando os emails capturados
  })

  test('it should create a reset password token', async (assert) => {

    Mail.fake() //Quando eu não uso o Mail.fake() o Mail manda um email de verdade para alguém, mas isso usa minha cota de emails gratis

    const user = await UserFactory.create()

    await supertest(BASE_URL)
      .post('/forgot-password')
      .send({
        email: user.email,
        resetPasswordUrl: 'url'
      })
      .expect(204)

      const tokens = await user.related('tokens').query()

      assert.isNotEmpty(tokens)
  })

  test('it should return 422 when required data is not provided or data is invalid', async (assert) => {

    const { body } = await supertest(BASE_URL).post('/forgot-password').send({}).expect(422)

    assert.equal(body.code, 'BAD_REQUEST')
    assert.equal(body.status, 422)

  })

  test('it should be able to reset password', async (assert) => {

    const user = await UserFactory.create()
    const {token} = await user.related('tokens').create({token: 'token'})

    await supertest(BASE_URL)
      .post('/reset-password')
      .send({ token, password: '123456' })
      .expect(204)

    await user.refresh() //atualiza a senha do usuario no modelo depois que o usuario atualizar a senha
    const checkPassword = await Hash.verify(user.password, '123456')
    assert.isTrue(checkPassword)
  })

  test('it should return 422 when required data is not provided or data is invalid', async (assert) => {
    const { body } = await supertest(BASE_URL).post('/reset-password').send({}).expect(422)
    assert.equal(body.code, 'BAD_REQUEST')
    assert.equal(body.status, 422)
  })

  test.only('it should return 404 when using the same token twice', async (assert) => {
    const user = await UserFactory.create()
    const {token} = await user.related('tokens').create({token: 'token'})

    await supertest(BASE_URL)
      .post('/reset-password')
      .send({ token, password: '123456' })
      .expect(204)


      const { body } = await supertest(BASE_URL)
        .post('/reset-password')
        .send({ token, password: '123456' })
        .expect(404)

      assert.equal(body.code, 'BAD_REQUEST')
      assert.equal(body.status, 404)
  })

  group.beforeEach(async () => { //Antes de executar cada teste, inicia uma transação
    await Database.beginGlobalTransaction()
  })

  group.afterEach(async () => { //Depois de executar cada teste, inicia uma transação
    await Database.rollbackGlobalTransaction()
  })
})
