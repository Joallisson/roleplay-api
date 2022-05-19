import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class GroupsController {

  public async store({ request, response }: HttpContextContract){
    return response.created({})
  }

}
