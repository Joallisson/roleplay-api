import User from 'App/Models/User';
import { DateTime } from 'luxon'
import { BaseModel, column, BelongsTo, belongsTo } from '@ioc:Adonis/Lucid/Orm'

export default class Group extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public name: string

  @column()
  public description: string

  @column()
  public chronic: string

  @column()
  public schedule: string //Periodicionade da mesa

  @column()
  public location: string

  @column()
  public master: number //id do master

  //Relacionamento 1 para 1/BelongsTo => uma mesa/grupo tem um mestre
  @belongsTo(() => User, {
    foreignKey: 'master' //esse master é a coluna master desse modelo que contém o id do usuário que é o mestre da mesa
  })
  public masterUser: BelongsTo<typeof User> //Relacionamento 1 para 1/BelongsTo => uma mesa/grupo tem um mestre

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
