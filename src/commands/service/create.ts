import { Command } from '@oclif/core'
import { Jamsocket } from '../../jamsocket'

export default class Create extends Command {
  static description = 'Creates a service'

  static examples = [
    '<%= config.bin %> <%= command.id %> my-service',
  ]

  static args = [{ name: 'name', required: true }]

  public async run(): Promise<void> {
    const { args } = await this.parse(Create)

    const jamsocket = await Jamsocket.fromEnvironment()
    await jamsocket.serviceCreate(args.name)

    this.log(`Created service: ${args.name}`)
  }
}
