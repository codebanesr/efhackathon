import { config } from 'dotenv'
import { Configuration } from '~/core/configuration'
import { Database } from '~/core/database'
import { Utility } from '~/core/helpers/utility'

config()

class Provider {
  public name = 'github'

  constructor() {
    this.setup()
  }

  private setup() {
    try {
      const clientID = process.env.SERVER_AUTHENTICATION_GITHUB_CLIENT_ID
      const clientSecret = process.env.SERVER_AUTHENTICATION_GITHUB_CLIENT_SECRET
      const callbackURL = `${Configuration.getBaseUrl()}/api/auth/github/callback`

      if (Utility.isNull(clientID) || Utility.isNull(clientSecret)) {
        throw new Error(
          `Set SERVER_AUTHENTICATION_GITHUB_CLIENT_ID AND SERVER_AUTHENTICATION_GITHUB_CLIENT_SECRET in your .env to activate the GitHub Authentication provider`,
        )
      }

      console.log(`Authentication GitHub provider is active`)
    } catch (error) {
      console.error(
        `Could not setup Authentication GitHub provider: ${error.message}`,
      )
    }
  }
}

export const GitHubProvider = new Provider() 