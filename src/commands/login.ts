import { Command, CliUx } from '@oclif/core'
import { JamsocketApi, AuthenticationError } from '../api'
import { deleteJamsocketConfig, readJamsocketConfig, writeJamsocketConfig, getTokenPublicPortion } from '../jamsocket-config'

export default class Login extends Command {
  static description = 'Authenticates user to the Jamsocket API with a token.'

  static examples = [
    '<%= config.bin %> <%= command.id %>',
    '<%= config.bin %> <%= command.id %> W3guqHFk0FJdtquC.iDxcHZr4rg1AIWPxpnk0SWHm95Vfdl',
  ]

  static args = [
    { name: 'token', description: 'optional token to log into the CLI with' },
  ]

  public async run(): Promise<void> {
    const api = JamsocketApi.fromEnvironment()
    const config = readJamsocketConfig()
    if (config !== null) {
      const { account, token } = config
      const publicPortion = getTokenPublicPortion(token)
      try {
        await api.checkAuth(token)
        this.log(`You are already logged into account "${account}" with the token "${publicPortion}.********". To log into a different account, run jamsocket logout first.`)
        return
      } catch (error) {
        const isAuthError = error instanceof AuthenticationError
        if (!isAuthError) throw error
        deleteJamsocketConfig()
      }
    }

    const { args } = await this.parse(Login)

    let token = args.token?.trim()
    if (!token) {
      this.log('Generate an API token at the following URL and paste it into the prompt below:\n')
      this.log(`    ${api.getLoginUrl()}\n`)
      token = (await CliUx.ux.prompt('token')).trim()
    }

    if (!token) {
      throw new Error('Token required to login.')
    }

    if (!token.includes('.')) {
      throw new Error('Invalid token. Token must contain a period.')
    }

    const { account } = await api.checkAuth(token)

    writeJamsocketConfig({ account, token })
    this.log(`Logged in as "${account}"`)
  }
}
