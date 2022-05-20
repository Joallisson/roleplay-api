import Group from 'App/Models/Group';
import { DateTime } from 'luxon'
import { BaseModel, beforeSave, column, HasMany, hasMany, ManyToMany, manyToMany } from '@ioc:Adonis/Lucid/Orm'
import  Hash  from '@ioc:Adonis/Core/Hash'
import LinkToken from './LinkToken'

export default class User extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public username: string

  @column()
  public email: string

  @column({ serializeAs: null }) //Não deixa o modelo retornar a senha
  public password: string

  @column()
  public avatar: string

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  //Criando relacionamento
  @hasMany(() => LinkToken, {
    foreignKey: 'userId'
  })
  public tokens: HasMany<typeof LinkToken> //Criando relacionamento "User" tem muitos "LinkToken" = 1 para N

  //Relacionamento muitos para muitos
  @manyToMany(() => Group, { //Relacionamento muitos para muitos N para N, onde é criado uma tabela pivô com os usuários e os grupos que irão participar dos jogos
    pivotTable: 'groups_users' //Definir a tabela onde vai estar os grupos e usuários
  })
  public groups: ManyToMany<typeof Group> //No User tem a lista de grupos que o usuário está inserido => RELACIONAMENTO COM A: LISTA DE GRUPOS

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @beforeSave()
  public static async hashPassword(user: User){
    if(user.$dirty.password){ //Se a asenha estiver suja ou seja se a senha ainda não estiver salva no banco de dados
      user.password = await Hash.make(user.password) //criptografando senha //para baixar essa biblioteca basta digitar no terminal: yarn add phc-argon2
    }
  }
}
