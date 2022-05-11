import User from 'App/Models/User';
import { DateTime } from 'luxon'
import { BaseModel, BelongsTo, belongsTo, column } from '@ioc:Adonis/Lucid/Orm'

export default class LinkToken extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public token: string

  @column({ columnName: 'user_id' /*Esse 'user_id' vai ser salvo no banco de dados*/})
  public userId: number //Esse "userId" é usado somente no modelo, mas não vai ser salvo com esse nome no bd

  //Criando relacionamento
  @belongsTo(() => User, {
    foreignKey: 'userId'
  })
  public user: BelongsTo<typeof User> //Criando relacionamento "LinkToken" pertence a "User" = N para 1

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
