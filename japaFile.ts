import 'reflect-metadata'
import { join } from 'path'
import getPort from 'get-port'
import { configure } from 'japa'
import sourceMapSupport from 'source-map-support'
import execa from 'execa'

process.env.NODE_ENV = 'testing'
process.env.ADONIS_ACE_CWD = join(__dirname)
sourceMapSupport.install({ handleUncaughtExceptions: false })

// eslint-disable-next-line prettier/prettier
async function  runMigrations() { //Vai rodar as migrations assim que começar os testes
  await execa.node('ace', ['migration:run'], {
    stdio: 'inherit',
  })
}

// eslint-disable-next-line prettier/prettier
async function  rollbackMigrations() { //Vai apagar as migrations assim que começar os testes
  await execa.node('ace', ['migration:rollback'], {
    stdio: 'inherit',
  })
}

async function startHttpServer() {
  const { Ignitor } = await import('@adonisjs/core/build/src/Ignitor')
  process.env.PORT = String(await getPort())
  await new Ignitor(__dirname).httpServer().start()
}

/**
 * Configure test runner
 */
configure({
  files: ['test/**/*.spec.ts'],
  before: [runMigrations, startHttpServer],
  after: [rollbackMigrations],
})
