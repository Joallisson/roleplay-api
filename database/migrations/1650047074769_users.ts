import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class Users extends BaseSchema {
  protected tableName = 'users'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('email').notNullable().unique() //Não pode estar vazia //Tem que ser um valor único
      table.string('username').notNullable().unique() //Não pode estar vazia //Tem que ser um valor único
      table.string('password').notNullable().unique() //Não pode estar vazia //Tem que ser um valor único
      table.string('avatar').defaultTo('') //Por padrão o avatar vai estar vazio


      //Verificar
      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
