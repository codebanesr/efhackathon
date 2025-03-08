import { GithubOutlined, LoadingOutlined } from '@ant-design/icons'
import { Button, Card, Input, List, Modal, Space, Typography, message } from 'antd'
import { useState } from 'react'
import { Api } from '~/core/trpc'
import { useUserContext } from '~/core/context'

interface GitHubRepo {
  id: string
  name: string
  full_name: string
  description: string
  html_url: string
  default_branch: string
  owner: {
    login: string
  }
}

interface Props {
  onSelect: (repo: GitHubRepo) => void
}

export const GitHubRepoSelector: React.FC<Props> = ({ onSelect }) => {
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [repos, setRepos] = useState<GitHubRepo[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const { user } = useUserContext()

  const { data: session } = Api.authentication.session.useQuery()
  const githubToken = session?.githubAccessToken

  const searchRepos = async () => {
    if (!githubToken) {
      message.error('Please authenticate with GitHub first')
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('https://api.github.com/user/repos', {
        headers: {
          Authorization: `Bearer ${githubToken}`,
          Accept: 'application/vnd.github.v3+json',
        },
      })
      
      if (!response.ok) {
        throw new Error('Failed to fetch repositories')
      }

      const data = await response.json()
      setRepos(data)
    } catch (error) {
      message.error('Failed to fetch repositories')
      console.error('Error fetching repos:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSelect = (repo: GitHubRepo) => {
    onSelect(repo)
    setIsModalVisible(false)
  }

  const showModal = () => {
    setIsModalVisible(true)
    searchRepos()
  }

  const filteredRepos = repos.filter(repo =>
    repo.full_name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <>
      <Button 
        type="primary" 
        icon={<GithubOutlined />} 
        onClick={showModal}
      >
        Import from GitHub
      </Button>

      <Modal
        title="Select GitHub Repository"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={800}
      >
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          {!githubToken ? (
            <Card>
              <Space direction="vertical" align="center" style={{ width: '100%' }}>
                <Typography.Text>
                  Please authenticate with GitHub to access your repositories
                </Typography.Text>
                <a href="/api/auth/github">
                  <Button type="primary" icon={<GithubOutlined />}>
                    Connect GitHub Account
                  </Button>
                </a>
              </Space>
            </Card>
          ) : (
            <>
              <Input.Search
                placeholder="Search repositories..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{ width: '100%' }}
              />

              {isLoading ? (
                <div style={{ textAlign: 'center', padding: '20px' }}>
                  <LoadingOutlined style={{ fontSize: 24 }} />
                  <Typography.Text style={{ marginLeft: 8 }}>
                    Loading repositories...
                  </Typography.Text>
                </div>
              ) : (
                <List
                  dataSource={filteredRepos}
                  renderItem={repo => (
                    <List.Item
                      actions={[
                        <Button 
                          key="select" 
                          type="primary"
                          onClick={() => handleSelect(repo)}
                        >
                          Select
                        </Button>
                      ]}
                    >
                      <List.Item.Meta
                        avatar={<GithubOutlined />}
                        title={<a href={repo.html_url} target="_blank" rel="noopener noreferrer">{repo.full_name}</a>}
                        description={repo.description}
                      />
                    </List.Item>
                  )}
                />
              )}
            </>
          )}
        </Space>
      </Modal>
    </>
  )
} 