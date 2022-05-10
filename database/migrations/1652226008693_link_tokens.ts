import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class LinkTokens extends BaseSchema {
  protected tableName = 'link_tokens'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()

      table.string('token', 255).notNullable().unique() //Tipo de dado: string, nome: token, na máximo: 255 caracteres, não pode ser nulo, e tem que ser único

      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
