import Group from 'App/Models/Group';
import User from 'App/Models/User';
import { DateTime } from 'luxon'
import { BaseModel, column, BelongsTo, belongsTo } from '@ioc:Adonis/Lucid/Orm'

export default class GroupRequest extends BaseModel {
  public static table = 'groups_requests' //Criando nome da tabela para deixar aigual ao nome da tabela na migration

  @column({ isPrimary: true })
  public id: number

  @column({ columnName: 'user_id', serializeAs: 'userId'}) //Nome do campo no bd e o formato camelCase que será usado para formatar os valores de retorno
  public userId: number

  @belongsTo(() => User, { //Relacionamento 1 para 1
    foreignKey: 'userId' //o campo userId percente ao User
  })
  public user: BelongsTo<typeof User> //A requisição para o grupo pertence ao usuário ////Nome do relacionamento

  @column({ columnName: 'group_id', serializeAs: 'groupId' }) //Nome do campo no bd e o formato camelCase que será usado para formatar os valores de retorno
  public groupId: number

  @belongsTo(() => Group, { //Relacionamento 1 para 1
    foreignKey: 'groupId' //o campo groupId percente ao Group
  })
  public group: BelongsTo<typeof Group> //Nome do relacionamento

  @column()
  public status: string

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
