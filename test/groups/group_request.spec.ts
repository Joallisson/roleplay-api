import { UserFactory } from 'Database/factories';
import { GroupFactory } from './../../database/factories/index';
import Database from '@ioc:Adonis/Lucid/Database';
import test from 'japa'
import supertest from 'supertest'

const BASE_URL = `http://${process.env.HOST}:${process.env.PORT}`

test.group('Group  Request', (group) => {

  test.only('it should create a group request', async (assert) => {
    const user = await UserFactory.create() //Criando o master
    const group = await GroupFactory.merge({master: user.id}).create() //criando o grupo e passando o id do master para ser o mestre do grupo
    const { body } = await supertest(BASE_URL)
    .post(`/groups/${group.id}/requests`)
    .send({})
    .expect(201)//o 201 é quando o objeto é criado

    assert.exists(body.groupRequest, 'Group Request undefined')
    assert.equal(body.groupRequest.userId, user.id)
    assert.equal(body.groupRequest.groupId, group.id)
    assert.equal(body.groupRequest.status, 'PENDING')
  })




  group.beforeEach(async () => { //Hook para antes de cada transação
    await Database.beginGlobalTransaction()
  })

  group.afterEach(async () => { //Hook para depois de cada transação
    await Database.rollbackGlobalTransaction()
  })

})
