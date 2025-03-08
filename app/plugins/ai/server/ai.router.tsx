import { DateHelper } from '@/core/helpers/date'
import { FileHelper } from '@/core/helpers/file'
import axios from 'axios'
import { z } from 'zod'
import { Trpc } from '~/core/trpc/base'
import { UploadServer } from '~/plugins/upload/server'
import { AiServiceFactory } from './ai.service.factory'
/**
 * @provider AiApi
 * @description An AI library to query OpenAI by default and Gemini as an alternative
 * @function {({ prompt: string, provider?: 'openai' | 'gemini' }) => Promise<{ answer: string}>} generateText - Send the prompt to OpenAI and get back its answer
 * @function {({ prompt: string, provider?: 'openai' | 'gemini' }) => Promise<{ url: string }>} generateImage - Send the prompt to OpenAI to generate an Image and get back the URL of the image in the answer
 * @function {({ url: string, provider?: 'openai' | 'gemini' }) => Promise<{ translation: string }>} audioToText - Send the readStream of an audio file to OpenAI to transcribe it into text and get back the text in the answer
 * @function {({ text: string, provider?: 'openai' | 'gemini' } => Promise<{ url: string }>} textToAudio - Send the text to OpenAI to convert it into an mp3 file and get back the url of the audio file
 * @usage `const generateText = Api.ai.generateText.useMutation(); generateText.mutateAsync({ prompt: 'How are you?' }).then(response => response.answer);`
 * @isImportOverriden false
 * @isAlwaysIncluded false
 * @import import { Api } from '@/core/trpc'
 */

export const AiRouter = Trpc.createRouter({
  generateText: Trpc.procedure
    .input(
      z.object({
        prompt: z.string(),
        attachmentUrls: z.array(z.string()).optional(),
        provider: z.enum(['openai', 'gemini']).default('openai'),
      }),
    )
    .mutation(async ({ input }) => {
      const { prompt, attachmentUrls, provider } = input

      const aiService = AiServiceFactory.create(provider)

      const answer = await aiService.generateText({
        prompt,
        attachmentUrls,
      })

      return { answer }
    }),

  /**
   * ? The schema in this function is an example. You should update it to your use-case.
   * ? If you need multiple schemas, you can create one dedicated function for each.
   */
  generateJson: Trpc.procedure
    .input(
      z.object({
        instruction: z.string(),
        content: z.string(),
        attachmentUrls: z.array(z.string()).optional(),
        provider: z.enum(['openai', 'gemini']).default('openai'),
      }),
    )
    .mutation(async ({ input }) => {
      const schema = z.object({
        results: z.array(
          z.object({
            description: z.string(),
          }),
        ),
      })

      const aiService = AiServiceFactory.create(input.provider)

      const json = await aiService.generateJson(
        input.instruction,
        input.content,
        schema,
        input.attachmentUrls,
      )

      return json
    }),

  generateImage: Trpc.procedure
    .input(
      z.object({
        prompt: z.string(),
        provider: z.enum(['openai', 'gemini']).default('openai'),
      }),
    )
    .mutation(async ({ input }) => {
      const aiService = AiServiceFactory.create(input.provider)

      const url = await aiService.generateImage(input.prompt)

      return { url }
    }),

  audioToText: Trpc.procedure
    .input(
      z.object({
        url: z.string(),
        provider: z.enum(['openai', 'gemini']).default('openai'),
      }),
    )
    .mutation(async ({ input }) => {
      const aiService = AiServiceFactory.create(input.provider)

      const arrayBuffer = await axios
        .get<ArrayBuffer>(input.url, { responseType: 'arraybuffer' })
        .then(response => response.data)

      const readstream = await FileHelper.createReadStreamFromArrayBuffer(
        arrayBuffer,
        'audio.wav',
      )

      const translation = await aiService.fromAudioToText(readstream)

      return { translation }
    }),

  textToAudio: Trpc.procedure
    .input(
      z.object({
        text: z.string(),
        provider: z.enum(['openai', 'gemini']).default('openai'),
      }),
    )
    .mutation(async ({ input }) => {
      const aiService = AiServiceFactory.create(input.provider)

      const buffer = await aiService.fromTextToAudio(input.text)

      const now = DateHelper.getNow()

      const name = `${now.getTime()}__text-to-audio.mp3`

      const file: UploadServer.FileType = {
        name,
        mimetype: 'audio/mp3',
        buffer,
      }

      const urls = await UploadServer.service.uploadPublic(file)

      const url = urls[0].url

      return { url }
    }),

  // GitHub repository search
  searchGithubRepositories: Trpc.procedure
    .input(
      z.object({
        query: z.string(),
        page: z.number().default(1),
        perPage: z.number().default(10),
      }),
    )
    .query(async ({ input }) => {
      const { query, page, perPage } = input
      
      try {
        const response = await axios.get(
          `https://api.github.com/search/repositories`, {
            params: {
              q: query,
              sort: 'stars',
              order: 'desc',
              page,
              per_page: perPage,
            },
            headers: {
              Accept: 'application/vnd.github.v3+json',
              // Add GitHub token if available to increase rate limit
              // Authorization: `token ${process.env.GITHUB_TOKEN}`,
            },
          }
        )
        
        const repositories = response.data.items.map(repo => ({
          id: repo.id.toString(),
          name: repo.full_name,
          description: repo.description || '',
          language: repo.language || 'Unknown',
          stars: repo.stargazers_count,
          forks: repo.forks_count,
          url: repo.html_url,
          cloneUrl: repo.clone_url,
          defaultBranch: repo.default_branch,
          status: 'not_deployed'
        }))
        
        return {
          repositories,
          totalCount: response.data.total_count,
          currentPage: page,
        }
      } catch (error) {
        console.error('Error searching GitHub repositories:', error)
        throw new Error('Failed to search GitHub repositories')
      }
    }),
    
  // Clone and deploy a GitHub repository
  cloneRepository: Trpc.procedure
    .input(
      z.object({
        repositoryUrl: z.string(),
        repositoryName: z.string(),
        branch: z.string().optional(),
        targetDirectory: z.string().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const { repositoryUrl, repositoryName, branch = 'main', targetDirectory = '/tmp' } = input
      
      try {
        // Create target directory if it doesn't exist
        const targetPath = targetDirectory || '/tmp';
        
        // This would typically involve server-side operations to:
        // 1. Create directory if it doesn't exist
        // 2. Clone the repository to the specified directory
        // 3. Build a Docker image
        // 4. Deploy the container
        
        console.log(`Cloning ${repositoryUrl} to ${targetPath}/${repositoryName.split('/')[1]}`);
        
        // For now, we'll simulate the process with a delay
        await new Promise(resolve => setTimeout(resolve, 2000))
        
        // Return deployment information
        return {
          success: true,
          deploymentId: `deploy-${Date.now()}`,
          repository: repositoryName,
          status: 'deployed',
          targetPath: `${targetPath}/${repositoryName.split('/')[1]}`,
          logs: [
            `Creating directory ${targetPath} if it doesn't exist...`,
            `Cloning ${repositoryUrl} to ${targetPath}/${repositoryName.split('/')[1]}...`,
            'Installing dependencies...',
            'Building Docker image...',
            `Deploying ${repositoryName}...`,
            'Deployment successful!'
          ]
        }
      } catch (error) {
        console.error('Error cloning repository:', error)
        throw new Error('Failed to clone and deploy repository')
      }
    }),
    
  // Get repository details
  getRepositoryDetails: Trpc.procedure
    .input(
      z.object({
        owner: z.string(),
        repo: z.string(),
      }),
    )
    .query(async ({ input }) => {
      const { owner, repo } = input
      
      try {
        const response = await axios.get(
          `https://api.github.com/repos/${owner}/${repo}`, {
            headers: {
              Accept: 'application/vnd.github.v3+json',
              // Add GitHub token if available
              // Authorization: `token ${process.env.GITHUB_TOKEN}`,
            },
          }
        )
        
        // Get repository languages
        const languagesResponse = await axios.get(
          response.data.languages_url, {
            headers: {
              Accept: 'application/vnd.github.v3+json',
              // Authorization: `token ${process.env.GITHUB_TOKEN}`,
            },
          }
        )
        
        return {
          id: response.data.id.toString(),
          name: response.data.full_name,
          description: response.data.description || '',
          language: response.data.language || 'Unknown',
          languages: languagesResponse.data,
          stars: response.data.stargazers_count,
          forks: response.data.forks_count,
          watchers: response.data.watchers_count,
          openIssues: response.data.open_issues_count,
          defaultBranch: response.data.default_branch,
          createdAt: response.data.created_at,
          updatedAt: response.data.updated_at,
          url: response.data.html_url,
          cloneUrl: response.data.clone_url,
          sshUrl: response.data.ssh_url,
          size: response.data.size,
          homepage: response.data.homepage,
          license: response.data.license ? response.data.license.name : null,
        }
      } catch (error) {
        console.error('Error fetching repository details:', error)
        throw new Error('Failed to fetch repository details')
      }
    }),

  // List files in a repository directory
  listRepositoryFiles: Trpc.procedure
    .input(
      z.object({
        repositoryPath: z.string(),
        subPath: z.string().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const { repositoryPath, subPath = '' } = input
      
      try {
        // This would typically involve server-side operations to:
        // 1. Check if the directory exists
        // 2. List all files and directories in the specified path
        
        console.log(`Listing files in ${repositoryPath}/${subPath}`);
        
        // For now, we'll simulate the process with mock data
        // In a real implementation, you would use fs.readdir or similar
        
        // Mock files for demonstration
        const mockFiles = [
          { name: 'README.md', isDirectory: false, size: 1024 },
          { name: 'package.json', isDirectory: false, size: 2048 },
          { name: 'src', isDirectory: true, size: 0 },
          { name: 'dist', isDirectory: true, size: 0 },
          { name: '.gitignore', isDirectory: false, size: 256 },
          { name: 'LICENSE', isDirectory: false, size: 1536 },
        ];
        
        return {
          success: true,
          path: subPath ? `${repositoryPath}/${subPath}` : repositoryPath,
          files: mockFiles
        }
      } catch (error) {
        console.error('Error listing repository files:', error)
        throw new Error('Failed to list repository files')
      }
    }),
})
