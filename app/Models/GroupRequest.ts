import Group from 'App/Models/Group';
import User from 'App/Models/User';
import { DateTime } from 'luxon'
import { BaseModel, column, BelongsTo, belongsTo } from '@ioc:Adonis/Lucid/Orm'

export default class GroupRequest extends BaseModel {
  public static table = 'groups_requests' //Criando nome da tabela para deixar aigual ao nome da tabela na migration

  @column({ isPrimary: true })
  public id: number

  @column({ columnName: 'user_id'})
  public userId: number

  @belongsTo(() => User, { //Relacionamento 1 para 1
    foreignKey: 'userId'
  })
  public user: BelongsTo<typeof User> //A requisição para o grupo pertence ao usuário

  @column({ columnName: 'group_id' })
  public groupId: number

  @belongsTo(() => Group, { //Relacionamento 1 para 1
    foreignKey: 'groupId'
  })
  public group: BelongsTo<typeof Group> //A requisição do usuário para o grupo

  @column()
  public status: string

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
