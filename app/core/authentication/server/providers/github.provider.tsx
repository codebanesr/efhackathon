import { config } from 'dotenv'
import { Strategy as GitHubStrategy } from 'passport-github2'
import { Configuration } from '~/core/configuration'
import { Database } from '~/core/database'
import { Utility } from '~/core/helpers/utility'

config()

class Provider {
  public name = 'github'
  public strategy: GitHubStrategy

  constructor() {
    this.setup()
  }

  isActive() {
    return !!this.strategy
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

      this.strategy = new GitHubStrategy(
        {
          clientID,
          clientSecret,
          callbackURL,
          scope: ['user:email', 'repo'],
        },
        async (accessToken, refreshToken, profile, done) => {
          try {
            const email = profile.emails[0].value

            let user = await Database.user.findFirst({ where: { email } })

            if (!user) {
              user = await Database.user.create({
                data: {
                  email,
                  name: profile.displayName || profile.username,
                  pictureUrl: profile.photos[0]?.value,
                },
              })
            }

            const payload = {
              accessToken,
              refreshToken,
              user,
            }

            done(null, payload)
          } catch (error) {
            done(error)
          }
        },
      )

      console.log(`Authentication GitHub provider is active`)
    } catch (error) {
      console.error(
        `Could not setup Authentication GitHub provider: ${error.message}`,
      )
    }
  }
}

export const GitHubProvider = new Provider() 