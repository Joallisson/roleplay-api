import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class LinkTokens extends BaseSchema {
  protected tableName = 'link_tokens'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()

      //Criando chave estrangeira
      table.integer('user_id').unsigned().references('id').inTable('users').notNullable() //Cria um campo user_id, não pode ser negatico, referencia o id, na tabela users, e esse campo nunca pode ser vazio

      table.string('token', 255).notNullable().unique() //Tipo de dado: string, nome: token, na máximo: 255 caracteres, não pode ser nulo, e tem que ser único
      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
