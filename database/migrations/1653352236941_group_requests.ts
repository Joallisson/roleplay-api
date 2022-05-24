import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class GroupRequests extends BaseSchema {
  protected tableName = 'groups_requests'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('user_id').unsigned().references('id').inTable('users').notNullable() //Criando chave estrangeira
      table.integer('group_id').unsigned().references('id').inTable('groups').notNullable() //Criando chave estrangeira
      table.enum('status', ['PENDING', 'ACCEPTED']).defaultTo('PENDING').notNullable() //Cria um campo que só pode receber 'PENDING', 'ACCEPTED'
      table.timestamps(true)
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
