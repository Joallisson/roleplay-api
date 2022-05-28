import { Exception } from '@adonisjs/core/build/standalone';
/*
|--------------------------------------------------------------------------
| Http Exception Handler
|--------------------------------------------------------------------------
|
| AdonisJs will forward all exceptions occurred during an HTTP request to
| the following class. You can learn more about exception handling by
| reading docs.
|
| The exception handler extends a base `HttpExceptionHandler` which is not
| mandatory, however it can do lot of heavy lifting to handle the errors
| properly.
|
*/

import Logger from '@ioc:Adonis/Core/Logger'
import HttpExceptionHandler from '@ioc:Adonis/Core/HttpExceptionHandler'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class ExceptionHandler extends HttpExceptionHandler {
  constructor() {
    super(Logger)
  }


  public async handle(error: Exception, ctx: HttpContextContract) { //Essa função lida com as excessões

    //console.log({ error })

    if(error.status === 422) //Se der 422 use esse tratamento de excessões
      return ctx.response.status(error.status).send({
        code: 'BAD_REQUEST',
        message: error.message,
        status: error.status,
        errors: error['messages']?.errors ? error['messages'].errors : ''
      })

    else if(error.code === 'E_ROW_NOT_FOUND') //Se o código da axcessão for igual a 'E_ROW_NOT_FOUND'
      return ctx.response.status(error.status).send({
        code: 'BAD_REQUEST',
        message: 'resource not found', //Informando que o recurso que estou procurando não foi encontrado
        status: 404,
      })

    else if(['E_INVALID_AUTH_UID', 'E_INVALID_AUTH_PASSWORD'].includes(error.code || '')) //Se esses codigos de error estiverem incluidos dentro de error code (a string vazia dentro do includes é pra caso não houver error.code)
      return ctx.response.status(error.status).send({
        code: 'BAD_REQUEST',
        message: 'invalid credentials',
        status: 400
      })




    return super.handle(error, ctx) //Se o status não for nenhum aos que estão na condicional do if, quem vai lidar com esse erro vai ser o método da super classe
  }
}
