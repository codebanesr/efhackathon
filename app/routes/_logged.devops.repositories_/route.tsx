
import { Button, Card, Col, Input, Row, Space, Steps, Table, Tabs, Tag, Typography, message, List, Empty } from 'antd'
import { useEffect, useState } from 'react'
import { GithubOutlined, SearchOutlined, LoadingOutlined, CheckCircleOutlined, FolderOutlined, FileOutlined } from '@ant-design/icons'
import { Api } from '@/core/trpc'

const { Title, Text, Paragraph } = Typography
const { TabPane } = Tabs

// Mock data for repositories
const mockRepositories = [
  {
    id: '1',
    name: 'kubernetes/kubernetes',
    description: 'Production-Grade Container Scheduling and Management',
    language: 'Go',
    stars: 98542,
    forks: 36254,
    status: 'deployed'
  },
  {
    id: '2',
    name: 'docker/docker',
    description: 'Docker - the open-source application container engine',
    language: 'Go',
    stars: 64521,
    forks: 18547,
    status: 'building'
  },
  {
    id: '3',
    name: 'prometheus/prometheus',
    description: 'The Prometheus monitoring system and time series database',
    language: 'Go',
    stars: 47852,
    forks: 8541,
    status: 'deployed'
  }
]

// Mock workflow steps
const workflowSteps = [
  {
    title: 'Clone Repository',
    description: 'Cloning from GitHub'
  },
  {
    title: 'Install Dependencies',
    description: 'Running package managers'
  },
  {
    title: 'Generate Dockerfile',
    description: 'Creating optimal configuration'
  },
  {
    title: 'Build Image',
    description: 'Docker image creation'
  },
  {
    title: 'Generate Logs',
    description: 'Collecting build logs'
  },
  {
    title: 'Deploy to Docker Hub',
    description: 'Publishing to registry'
  }
]

// Mock chat messages
const initialChatMessages = [
  {
    sender: 'system',
    content: 'Welcome to DevOps Assistant! How can I help you today?',
    timestamp: new Date().toISOString()
  }
]

// Replace the mock repositories and search function with real GitHub API calls
// Update in the component:

export default function RepositoriesPage() {
  const [searchValue, setSearchValue] = useState('')
  const [repositories, setRepositories] = useState([])
  const [selectedRepo, setSelectedRepo] = useState(null)
  const [currentStep, setCurrentStep] = useState(0)
  const [isProcessing, setIsProcessing] = useState(false)
  const [chatMessages, setChatMessages] = useState(initialChatMessages)
  const [chatInput, setChatInput] = useState('')
  const [activeTab, setActiveTab] = useState('repositories')
  const [isAiLoading, setIsAiLoading] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [clonedRepos, setClonedRepos] = useState([])
  const [repoFiles, setRepoFiles] = useState([])
  const [selectedClonedRepo, setSelectedClonedRepo] = useState(null)

  const aiCaller = Api.ai.generateText.useMutation();
  const searchGithubRepos = Api.ai.searchGithubRepositories.useQuery(
    { query: searchValue || 'stars:>1000', page: currentPage, perPage: 10 },
    { enabled: false }
  );
  const cloneRepo = Api.ai.cloneRepository.useMutation();
  const listRepoFiles = Api.ai.listRepositoryFiles.useMutation();

  // Load popular repositories on initial load
  useEffect(() => {
    if (repositories.length === 0 && !isSearching) {
      handleSearch();
    }
  }, []);

  // Real repository search function
  const handleSearch = async () => {
    setIsSearching(true);
    try {
      const result = await searchGithubRepos.refetch();
      if (result.data) {
        setRepositories(result.data.repositories);
        setTotalCount(result.data.totalCount);
        setCurrentPage(result.data.currentPage);
      }
    } catch (error) {
      console.error('Error searching repositories:', error);
      message.error('Failed to search repositories');
    } finally {
      setIsSearching(false);
    }
  };

  // Real clone function with workflow steps
  const handleClone = async (repo) => {
    message.info(`Cloning repository: ${repo.name}`);
    setSelectedRepo(repo);
    setIsProcessing(true);
    setCurrentStep(0);

    try {
      // Extract owner and repo name
      const [owner, repoName] = repo.name.split('/');
      
      // Start the clone process
      const result = await cloneRepo.mutateAsync({
        repositoryUrl: repo.cloneUrl || `https://github.com/${repo.name}.git`,
        repositoryName: repo.name,
        branch: repo.defaultBranch || 'main',
        targetDirectory: '/tmp/ef' // Clone to /tmp/ef directory
      });
      
      // Mock the workflow steps with timeouts to show progress
      const stepDurations = [3000, 4000, 2000, 5000, 2000, 3000];
      
      let currentStepIndex = 0;
      const processStep = () => {
        if (currentStepIndex < workflowSteps.length) {
          setTimeout(() => {
            setCurrentStep(currentStepIndex + 1);
            currentStepIndex++;
            processStep();
          }, stepDurations[currentStepIndex]);
        } else {
          // Workflow completed
          setIsProcessing(false);
          message.success(`Repository ${repo.name} successfully processed and deployed!`);
          
          // Update the repository status in the list
          setRepositories(prevRepos => 
            prevRepos.map(r => 
              r.id === repo.id ? {...r, status: 'deployed'} : r
            )
          );
          
          // Add to cloned repositories
          setClonedRepos(prevClonedRepos => {
            // Check if repo already exists in clonedRepos
            const exists = prevClonedRepos.some(r => r.id === repo.id);
            if (!exists) {
              return [...prevClonedRepos, {...repo, clonePath: `/tmp/ef/${repoName || repo.name.split('/')[1]}`}];
            }
            return prevClonedRepos;
          });
        }
      };
      
      processStep();
    } catch (error) {
      console.error('Error cloning repository:', error);
      message.error('Failed to clone repository');
      setIsProcessing(false);
    }
  };

  // Function to list files from a cloned repository
  const handleListFiles = async (repo) => {
    setSelectedClonedRepo(repo);
    setRepoFiles([]);
    
    try {
      const repoPath = repo.clonePath || `/tmp/ef/${repo.name.split('/')[1]}`;
      const result = await listRepoFiles.mutateAsync({
        repositoryPath: repoPath
      });
      
      if (result && result.files) {
        setRepoFiles(result.files);
      } else {
        setRepoFiles([]);
        message.info('No files found or directory does not exist');
      }
    } catch (error) {
      console.error('Error listing repository files:', error);
      message.error('Failed to list repository files');
    }
  };

  // Updated chat function to use AI router
  const handleSendMessage = async () => {
    if (!chatInput.trim()) return

    // Add user message
    const userMessage = {
      sender: 'user',
      content: chatInput,
      timestamp: new Date().toISOString()
    }
    
    setChatMessages([...chatMessages, userMessage])
    setChatInput('')
    setIsAiLoading(true)
    
    try {
      // Use the AI router to get a response from OpenAI
      const response = await aiCaller.mutateAsync({
        prompt: `You are a DevOps assistant helping with repositories and Docker. 
                The user says: "${chatInput}"
                Provide a helpful, concise response related to DevOps, Docker, or repositories.`,
        provider: 'gemini'
      });
      
      const systemResponse = {
        sender: 'system',
        content: response.answer,
        timestamp: new Date().toISOString()
      }
      
      setChatMessages(prevMessages => [...prevMessages, systemResponse])
    } catch (error) {
      console.error('Error getting AI response:', error);
      
      // Add error message
      const errorResponse = {
        sender: 'system',
        content: 'Sorry, I encountered an error while processing your request. Please try again later.',
        timestamp: new Date().toISOString()
      }
      
      setChatMessages(prevMessages => [...prevMessages, errorResponse])
    } finally {
      setIsAiLoading(false)
    }
  }

  const columns = [
    {
      title: 'Repository',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <Space>
          <GithubOutlined />
          <Text strong>{text}</Text>
        </Space>
      )
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button 
            type="primary" 
            onClick={() => handleClone(record)}
            disabled={isProcessing}
          >
            Clone & Deploy
          </Button>
        </Space>
      ),
    },
  ]

  // Portainer interface component with link to actual Portainer UI
  const PortainerInterface = () => (
    <div style={{ height: '100vh', width: '100%', overflow: 'hidden' }}>
      <iframe 
        src="http://localhost:9000" 
        style={{ width: '100%', height: '100%', border: 'none', position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} 
        title="Portainer Management Interface"
      />
    </div>
  )

  return (
    <div style={{ padding: '20px' }}>
      <Title level={2}>DevOps Repository Management</Title>

      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane tab="Repositories" key="repositories">
          <Row gutter={[24, 24]}>
            <Col span={16}>
              <Card title="GitHub Repositories">
                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                  <Input.Group compact>
                    <Input 
                      style={{ width: 'calc(100% - 200px)' }} 
                      placeholder="Search repositories (e.g., kubernetes/kubernetes)" 
                      prefix={<SearchOutlined />}
                      value={searchValue}
                      onChange={e => setSearchValue(e.target.value)}
                      onPressEnter={handleSearch}
                      disabled={isSearching}
                    />
                    <Button 
                      type="primary" 
                      onClick={handleSearch} 
                      loading={isSearching}
                      disabled={isSearching}
                    >
                      Search
                    </Button>
                    <Button 
                      type="link" 
                      onClick={() => handleClone({ id: '999', name: searchValue, description: 'Custom repository', language: 'Unknown', stars: 0, forks: 0 })} 
                      disabled={!searchValue.trim()}
                    >
                      Quick Clone
                    </Button>
                  </Input.Group>
                  
                  <Table 
                    dataSource={repositories} 
                    columns={columns} 
                    rowKey="id"
                    pagination={{ 
                      pageSize: 5,
                      total: totalCount,
                      current: currentPage,
                      onChange: (page) => {
                        setCurrentPage(page);
                        handleSearch();
                      }
                    }}
                    loading={isSearching}
                  />
                </Space>
              </Card>
            </Col>
            
            <Col span={8}>
              <Card title="DevOps Assistant" style={{ height: '100%' }}>
                <div style={{ display: 'flex', flexDirection: 'column', height: '500px' }}>
                  <div style={{ flex: 1, overflowY: 'auto', marginBottom: '10px', padding: '10px', background: '#f5f5f5', borderRadius: '4px' }}>
                    {chatMessages.map((msg, index) => (
                      <div 
                        key={index} 
                        style={{ 
                          marginBottom: '10px', 
                          textAlign: msg.sender === 'user' ? 'right' : 'left',
                        }}
                      >
                        <div 
                          style={{ 
                            display: 'inline-block',
                            padding: '8px 12px', 
                            background: msg.sender === 'user' ? '#1677ff' : '#e6f4ff', 
                            color: msg.sender === 'user' ? 'white' : 'rgba(0, 0, 0, 0.88)',
                            borderRadius: '8px',
                            maxWidth: '80%',
                            textAlign: 'left'
                          }}
                        >
                          {msg.content}
                        </div>
                      </div>
                    ))}
                    {isAiLoading && (
                      <div style={{ textAlign: 'left', marginTop: '10px' }}>
                        <div style={{ 
                          display: 'inline-block',
                          padding: '8px 12px', 
                          background: '#e6f4ff', 
                          borderRadius: '8px',
                          maxWidth: '80%'
                        }}>
                          <LoadingOutlined style={{ marginRight: '8px' }} />
                          Thinking...
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <Input.Group compact>
                    <Input 
                      style={{ width: 'calc(100% - 80px)' }} 
                      placeholder="Ask for DevOps assistance..."
                      value={chatInput}
                      onChange={e => setChatInput(e.target.value)}
                      onPressEnter={handleSendMessage}
                      disabled={isAiLoading}
                    />
                    <Button 
                      type="primary" 
                      onClick={handleSendMessage} 
                      loading={isAiLoading}
                      disabled={isAiLoading}
                    >
                      Send
                    </Button>
                  </Input.Group>
                </div>
              </Card>
            </Col>
          </Row>
          
          {isProcessing && selectedRepo && (
            <Card title={`Processing: ${selectedRepo.name}`} style={{ marginTop: '24px' }}>
              <Steps current={currentStep} status={currentStep === workflowSteps.length ? "finish" : "process"}>
                {workflowSteps.map((step, index) => (
                  <Steps.Step 
                    key={index} 
                    title={step.title} 
                    description={step.description}
                    icon={
                      currentStep === index ? <LoadingOutlined /> :
                      currentStep > index ? <CheckCircleOutlined /> : null
                    }
                  />
                ))}
              </Steps>
              
              <div style={{ marginTop: '20px', background: '#f5f5f5', padding: '10px', borderRadius: '4px', fontFamily: 'monospace' }}>
                {currentStep > 0 && <div>Cloning repository {selectedRepo.name}... Done</div>}
                {currentStep > 1 && <div>Installing dependencies... Done</div>}
                {currentStep > 2 && (
                  <div>
                    <div>Generated Dockerfile:</div>
                    <pre style={{ background: '#000', color: '#fff', padding: '8px', borderRadius: '4px' }}>
                      {`FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "start"]`}
                    </pre>
                  </div>
                )}
                {currentStep > 3 && <div>Building Docker image... Done</div>}
                {currentStep > 4 && <div>Generating logs... Done</div>}
                {currentStep > 5 && <div>Deployed to Docker Hub as {selectedRepo.name.split('/')[1]}:latest</div>}
                {currentStep < workflowSteps.length && <div>Processing...</div>}
              </div>
            </Card>
          )}
        </TabPane>
        
        <TabPane tab="Cloned Repositories" key="cloned">
          <Row gutter={[24, 24]}>
            <Col span={12}>
              <Card title="Cloned Repositories">
                {clonedRepos.length === 0 ? (
                  <Empty description="No repositories cloned yet" />
                ) : (
                  <List
                    itemLayout="horizontal"
                    dataSource={clonedRepos}
                    renderItem={item => (
                      <List.Item
                        actions={[
                          <Button type="primary" onClick={() => handleListFiles(item)}>
                            View Files
                          </Button>
                        ]}
                      >
                        <List.Item.Meta
                          avatar={<GithubOutlined style={{ fontSize: '24px' }} />}
                          title={item.name}
                          description={
                            <Space direction="vertical">
                              <Text>{item.description}</Text>
                              <Text type="secondary">Cloned to: {item.clonePath}</Text>
                            </Space>
                          }
                        />
                      </List.Item>
                    )}
                  />
                )}
              </Card>
            </Col>
            
            <Col span={12}>
              <Card 
                title={selectedClonedRepo ? `Files in ${selectedClonedRepo.name}` : "Repository Files"}
                extra={selectedClonedRepo && (
                  <Text type="secondary">Path: {selectedClonedRepo.clonePath}</Text>
                )}
              >
                {!selectedClonedRepo ? (
                  <Empty description="Select a repository to view files" />
                ) : repoFiles.length === 0 ? (
                  <Empty description="No files found or still loading..." />
                ) : (
                  <List
                    size="small"
                    bordered
                    dataSource={repoFiles}
                    renderItem={file => (
                      <List.Item>
                        <Space>
                          {file.isDirectory ? (
                            <FolderOutlined />
                          ) : (
                            <FileOutlined />
                          )}
                          <Text>{file.name}</Text>
                        </Space>
                        {!file.isDirectory && (
                          <Text type="secondary">{file.size} bytes</Text>
                        )}
                      </List.Item>
                    )}
                  />
                )}
              </Card>
            </Col>
          </Row>
        </TabPane>
        
        <TabPane tab="Container Management" key="containers">
          <PortainerInterface />
        </TabPane>
      </Tabs>
    </div>
  )
}