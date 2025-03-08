import { PageLayout } from '@/designSystem/layouts/PageLayout'
import { Card, Typography, List, Button, Input, Space, Divider, message, Avatar, Tag, Collapse, Progress, Form } from 'antd'
import { useState, useEffect, useRef } from 'react'
import { RocketOutlined, SendOutlined, RobotOutlined, CheckCircleOutlined, LoadingOutlined, UserOutlined } from '@ant-design/icons'
import { Api } from '@/core/trpc'
import { motion } from 'framer-motion'
import {useNavigate } from "@remix-run/react"


// Define deployment interface
interface Deployment {
  id: string;
  projectName: string;
  version: string;
  deploymentTime: Date;
  deployedBy: string;
  status: 'success' | 'failed' | 'in-progress';
  environment: 'production' | 'staging' | 'development';
}

// Define chat message interface
interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  isLog?: boolean;
  logDetails?: DeploymentLog[];
  requiresInput?: boolean;
  inputType?: 'version';
}

// Define deployment log interface
interface DeploymentLog {
  id: string;
  message: string;
  type: 'info' | 'success' | 'error' | 'warning';
  timestamp: Date;
}

export default function DeploymentsPage() {
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [chatInput, setChatInput] = useState('')
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [waitingForVersion, setWaitingForVersion] = useState(false)
  const [deployProgress, setDeployProgress] = useState(0)
  const [isDeploying, setIsDeploying] = useState(false)
  const [currentDeployStep, setCurrentDeployStep] = useState(0)
  const [versionInput, setVersionInput] = useState('')
  const [selectedProject, setSelectedProject] = useState<string>('')
  const chatEndRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  
  // Query projects from the database
  const { data: projects, isLoading } = Api.project.findMany.useQuery()

  // Mock deployments data
  const [deployments, setDeployments] = useState<Deployment[]>([
    {
      id: '1',
      projectName: 'E-commerce Platform',
      version: 'v1.2.3',
      deploymentTime: new Date('2024-07-31T08:30:00'),
      deployedBy: 'Shanur',
      status: 'success',
      environment: 'production'
    },
    {
      id: '2',
      projectName: 'Customer Portal',
      version: 'v2.0.1',
      deploymentTime: new Date('2024-07-30T14:15:00'),
      deployedBy: 'Shivam',
      status: 'success',
      environment: 'production'
    },
    {
      id: '3',
      projectName: 'Admin Dashboard',
      version: 'v0.9.5',
      deploymentTime: new Date('2024-07-29T11:45:00'),
      deployedBy: 'Anirudh',
      status: 'failed',
      environment: 'staging'
    },
    {
      id: '4',
      projectName: 'Mobile API',
      version: 'v1.1.0',
      deploymentTime: new Date('2024-07-28T16:20:00'),
      deployedBy: 'Gazi',
      status: 'in-progress',
      environment: 'development'
    },
    {
      id: '5',
      projectName: 'Analytics Service',
      version: 'v2.3.0',
      deploymentTime: new Date('2024-07-27T09:10:00'),
      deployedBy: 'Shanur',
      status: 'success',
      environment: 'production'
    }
  ])

  // Scroll to bottom of chat when messages change
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [chatMessages])

  // Deployment animation steps
  const deploymentSteps = [
    { message: "What version would you like to deploy?", requiresInput: true, inputType: 'version' },
    { message: "Great! We'll deploy version {version} of {projectName}", requiresInput: false },
    { message: "Preparing deployment package", requiresInput: false },
    { message: "Running pre-deployment tests", requiresInput: false },
    { message: "Provisioning cloud resources", requiresInput: false },
    { message: "Deploying application to {environment}", requiresInput: false },
    { message: "Running database migrations", requiresInput: false },
    { message: "Verifying deployment health", requiresInput: false },
    { message: "Deployment complete! {projectName} v{version} is now live", requiresInput: false }
  ]

  // Handle deployment animation
  useEffect(() => {
    if (isDeploying && currentDeployStep < deploymentSteps.length) {
      // Don't auto-advance if waiting for version input
      if (currentDeployStep === 0 && !versionInput) {
        if (!waitingForVersion) {  // Only show the prompt once
          setWaitingForVersion(true)
          const step = deploymentSteps[currentDeployStep]
          addBotMessage(step.message, false, true, 'version')
        }
        return
      }
      
      const randomDelay = Math.floor(Math.random() * 2000) + 1500 // Random delay between 1.5-3.5 seconds
      
      const timer = setTimeout(() => {
        const step = deploymentSteps[currentDeployStep]
        let stepMessage = step.message
          .replace('{version}', versionInput)
          .replace('{projectName}', selectedProject)
          .replace('{environment}', 'production')
        
        // Generate logs for this step
        const logs = generateLogsForStep(currentDeployStep, selectedProject, versionInput)
        
        // Add bot message with logs if we have them
        if (logs.length > 0) {
          addBotMessage(stepMessage, true, false, undefined, logs)
        } else {
          addBotMessage(stepMessage)
        }
        
        // Update progress percentage
        const progressValue = Math.floor((currentDeployStep / (deploymentSteps.length - 1)) * 100)
        setDeployProgress(progressValue)
        
        // Advance to next step
        setCurrentDeployStep(prev => prev + 1)
        
        // End deployment when all steps are complete
        if (currentDeployStep === deploymentSteps.length - 1) {
          setIsDeploying(false)
          
          // Add a new deployment to the list
          const newDeployment: Deployment = {
            id: (deployments.length + 1).toString(),
            projectName: selectedProject,
            version: versionInput,
            deploymentTime: new Date(),
            deployedBy: ['Shanur', 'Shivam', 'Anirudh', 'Gazi'][Math.floor(Math.random() * 4)],
            status: 'success',
            environment: 'production'
          }
          setDeployments(prev => [newDeployment, ...prev])
        }
      }, randomDelay)
      
      return () => clearTimeout(timer)
    }
  }, [isDeploying, currentDeployStep, versionInput, waitingForVersion, selectedProject])

  // Generate realistic logs for each deployment step
  const generateLogsForStep = (step: number, projectName: string, version: string): DeploymentLog[] => {
    const logs: DeploymentLog[] = []
    
    switch(step) {
      case 2: // Preparing deployment package
        logs.push(
          { id: crypto.randomUUID(), message: `Packaging ${projectName} version ${version}...`, type: 'info', timestamp: new Date() },
          { id: crypto.randomUUID(), message: 'Resolving dependencies...', type: 'info', timestamp: new Date() },
          { id: crypto.randomUUID(), message: 'Optimizing assets...', type: 'info', timestamp: new Date() },
          { id: crypto.randomUUID(), message: 'Creating deployment archive...', type: 'info', timestamp: new Date() },
          { id: crypto.randomUUID(), message: 'Deployment package prepared successfully', type: 'success', timestamp: new Date() }
        )
        break
      case 3: // Running pre-deployment tests
        logs.push(
          { id: crypto.randomUUID(), message: 'Running unit tests...', type: 'info', timestamp: new Date() },
          { id: crypto.randomUUID(), message: 'Unit tests passed: 243/243', type: 'success', timestamp: new Date() },
          { id: crypto.randomUUID(), message: 'Running integration tests...', type: 'info', timestamp: new Date() },
          { id: crypto.randomUUID(), message: 'Integration tests passed: 87/87', type: 'success', timestamp: new Date() },
          { id: crypto.randomUUID(), message: 'Running security scan...', type: 'info', timestamp: new Date() },
          { id: crypto.randomUUID(), message: 'No security vulnerabilities detected', type: 'success', timestamp: new Date() }
        )
        break
      case 4: // Provisioning cloud resources
        logs.push(
          { id: crypto.randomUUID(), message: 'Connecting to cloud provider...', type: 'info', timestamp: new Date() },
          { id: crypto.randomUUID(), message: 'Scaling up application instances...', type: 'info', timestamp: new Date() },
          { id: crypto.randomUUID(), message: 'Configuring load balancers...', type: 'info', timestamp: new Date() },
          { id: crypto.randomUUID(), message: 'Setting up auto-scaling policies...', type: 'info', timestamp: new Date() },
          { id: crypto.randomUUID(), message: 'Cloud resources ready', type: 'success', timestamp: new Date() }
        )
        break
      case 5: // Deploying application
        logs.push(
          { id: crypto.randomUUID(), message: 'Copying deployment package to servers...', type: 'info', timestamp: new Date() },
          { id: crypto.randomUUID(), message: 'Updating configuration files...', type: 'info', timestamp: new Date() },
          { id: crypto.randomUUID(), message: 'Starting application services...', type: 'info', timestamp: new Date() },
          { id: crypto.randomUUID(), message: 'Configuring environment variables...', type: 'info', timestamp: new Date() },
          { id: crypto.randomUUID(), message: 'Application deployed successfully', type: 'success', timestamp: new Date() }
        )
        break
      case 6: // Running migrations
        logs.push(
          { id: crypto.randomUUID(), message: 'Connecting to database...', type: 'info', timestamp: new Date() },
          { id: crypto.randomUUID(), message: 'Creating database backup...', type: 'info', timestamp: new Date() },
          { id: crypto.randomUUID(), message: 'Applying migration scripts...', type: 'info', timestamp: new Date() },
          { id: crypto.randomUUID(), message: 'Verifying database schema...', type: 'info', timestamp: new Date() },
          { id: crypto.randomUUID(), message: 'Database migrations completed successfully', type: 'success', timestamp: new Date() }
        )
        break
      case 7: // Verifying health
        logs.push(
          { id: crypto.randomUUID(), message: 'Running health checks...', type: 'info', timestamp: new Date() },
          { id: crypto.randomUUID(), message: 'API server: OK', type: 'success', timestamp: new Date() },
          { id: crypto.randomUUID(), message: 'Database connection: OK', type: 'success', timestamp: new Date() },
          { id: crypto.randomUUID(), message: 'Cache service: OK', type: 'success', timestamp: new Date() },
          { id: crypto.randomUUID(), message: 'Message queue: OK', type: 'success', timestamp: new Date() },
          { id: crypto.randomUUID(), message: 'All systems operational', type: 'success', timestamp: new Date() }
        )
        break
      default:
        break
    }
    
    return logs
  }

  // Chat functions
  const addUserMessage = (text: string) => {
    setChatMessages(prev => [
      ...prev, 
      { 
        id: Date.now().toString(), 
        text, 
        sender: 'user', 
        timestamp: new Date() 
      }
    ])
  }

  const addBotMessage = (
    text: string, 
    isLog: boolean = false, 
    requiresInput: boolean = false, 
    inputType?: 'version',
    logDetails?: DeploymentLog[]
  ) => {
    setChatMessages(prev => [
      ...prev, 
      { 
        id: Date.now().toString(), 
        text, 
        sender: 'bot', 
        timestamp: new Date(),
        isLog,
        logDetails,
        requiresInput,
        inputType
      }
    ])
  }
  
  // Handle version input submission
  const handleVersionSubmit = () => {
    if (!versionInput.trim()) return
    
    // Add user message with version
    addUserMessage(versionInput)
    
    // Continue deployment process
    setWaitingForVersion(false)
    setCurrentDeployStep(1) // Move to next step
    setIsDeploying(true)
  }

  const handleSendMessage = () => {
    if (!chatInput.trim()) return
    
    // If waiting for version input, treat the input as version
    if (waitingForVersion) {
      setVersionInput(chatInput)
      addUserMessage(chatInput)
      
      // Continue deployment process
      setWaitingForVersion(false)
      setCurrentDeployStep(1) // Move to next step
      setIsDeploying(true)
      setChatInput('')
      return
    }
    
    addUserMessage(chatInput)
    
    // Check if message is about deployment
    if (chatInput.toLowerCase().includes('deploy')) {
      // Find project name in the message
      let projectName = "your application"
      
      if (projects && projects.length > 0) {
        for (const project of projects) {
          if (chatInput.toLowerCase().includes(project.name.toLowerCase())) {
            projectName = project.name
            setSelectedProject(project.name)
            break
          }
        } 
      } else {
        // If no projects found from database, use mock data
        const mockProjectNames = deployments.map(d => d.projectName)
        for (const name of mockProjectNames) {
          if (chatInput.toLowerCase().includes(name.toLowerCase())) {
            projectName = name
            setSelectedProject(name)
            break
          }
        }
        
        // If still no match, use the first one
        if (projectName === "your application" && mockProjectNames.length > 0) {
          projectName = mockProjectNames[0]
          setSelectedProject(mockProjectNames[0])
        }
      }
      
      // Reset deployment state
      setDeployProgress(0)
      setVersionInput('')
      setWaitingForVersion(false)
      
      // Start deployment sequence
      setTimeout(() => {
        addBotMessage(`I'll help you deploy ${projectName}!`)
        setTimeout(() => {
          setIsDeploying(true)
          setCurrentDeployStep(0)
        }, 1000)
      }, 1000)
    } else {
      // Generic response for non-deployment messages
      setTimeout(() => {
        addBotMessage("I'm your deployment assistant. Let me know if you want to deploy any of your projects!")
      }, 1000)
    }
    
    setChatInput('')
  }

  const toggleChat = () => {
    setIsChatOpen(prev => !prev)
    if (!isChatOpen && chatMessages.length === 0) {
      // Add welcome message when opening chat for the first time
      setTimeout(() => {
        addBotMessage("Hello! I'm your deployment assistant. How can I help you deploy your application today?")
      }, 500)
    }
  }

  return (
    <PageLayout>
      <Card>
        <Space direction="vertical" style={{ width: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography.Title level={4}>Deployments</Typography.Title>
            <Button 
              type="primary" 
              icon={<RocketOutlined />} 
              onClick={toggleChat}
            >
              New Deployment
            </Button>
          </div>
          
          <List
            dataSource={deployments}
            renderItem={(deployment) => (
              <List.Item
                actions={[
                  <Button 
                    onClick={() => navigate("/devops/observability")}
                    key="viewLogs" 
                    type="link"
                  >
                    View Logs
                  </Button>
                ]}
              >
                <List.Item.Meta
                  avatar={
                    <Avatar style={{ backgroundColor: 
                      deployment.status === 'success' ? '#52c41a' : 
                      deployment.status === 'failed' ? '#f5222d' : 
                      '#faad14' 
                    }}>
                      {deployment.status === 'success' ? <CheckCircleOutlined /> : 
                       deployment.status === 'in-progress' ? <LoadingOutlined /> : 
                       '!'}
                    </Avatar>
                  }
                  title={
                    <Space>
                      <span>{deployment.projectName}</span>
                      <Tag color="blue">{deployment.version}</Tag>
                      <Tag color={
                        deployment.environment === 'production' ? 'green' : 
                        deployment.environment === 'staging' ? 'orange' : 
                        'purple'
                      }>
                        {deployment.environment}
                      </Tag>
                    </Space>
                  }
                  description={
                    <Space direction="vertical" size={0}>
                      <span>Deployed by {deployment.deployedBy} on {deployment.deploymentTime.toLocaleDateString()} at {deployment.deploymentTime.toLocaleTimeString()}</span>
                      <span>Status: {
                        deployment.status === 'success' ? 'Successful' : 
                        deployment.status === 'failed' ? 'Failed' : 
                        'In Progress'
                      }</span>
                    </Space>
                  }
                />
              </List.Item>
            )}
          />
        </Space>
      </Card>

      {/* Chat Widget Button */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          zIndex: 1000
        }}
      >
        <Button
          type="primary"
          shape="circle"
          size="large"
          icon={<RobotOutlined />}
          onClick={toggleChat}
          style={{ 
            width: '60px', 
            height: '60px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
          }}
        />
      </motion.div>

      {/* Chat Widget Panel */}
      <motion.div
        initial={{ opacity: 0, x: 300 }}
        animate={{ 
          opacity: isChatOpen ? 1 : 0, 
          x: isChatOpen ? 0 : 300,
          pointerEvents: isChatOpen ? 'all' : 'none'
        }}
        transition={{ duration: 0.3 }}
        style={{
          position: 'fixed',
          top: '80px',
          right: '20px',
          width: '450px', 
          height: 'calc(100vh - 160px)',
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 999
        }}
      >
        {/* Chat Header */}
        <div style={{ 
          padding: '16px', 
          borderBottom: '1px solid #f0f0f0', 
          display: 'flex', 
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Avatar icon={<RocketOutlined />} style={{ backgroundColor: '#1677ff' }} />
            <Typography.Title level={5} style={{ margin: 0 }}>Deployment Assistant</Typography.Title>
          </div>
          <Button 
            type="text" 
            shape="circle" 
            icon={<span>×</span>} 
            onClick={toggleChat}
            style={{ fontSize: '20px', fontWeight: 'bold' }}
          />
        </div>

        {/* Chat Messages */}
        <div style={{ 
          flex: 1, 
          padding: '16px', 
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          {isDeploying && deployProgress > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              style={{
                alignSelf: 'center',
                width: '90%',
                marginBottom: '16px',
                padding: '12px',
                backgroundColor: '#f6f6f6',
                borderRadius: '8px'
              }}
            >
              <Typography.Text strong>Deployment Progress</Typography.Text>
              <Progress 
                percent={deployProgress} 
                status={deployProgress === 100 ? "success" : "active"}
                strokeColor={{
                  '0%': '#1677ff',
                  '100%': '#52c41a',
                }}
              />
            </motion.div>
          )}
          
          {chatMessages.map(msg => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              style={{
                alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: msg.isLog ? '90%' : '80%',
                width: msg.isLog ? '90%' : 'auto'
              }}
            >
              {/* Regular message bubble */}
              {!msg.requiresInput && (
                <div style={{
                  backgroundColor: msg.sender === 'user' ? '#1677ff' : '#f0f0f0',
                  color: msg.sender === 'user' ? 'white' : 'black',
                  padding: '10px 14px',
                  borderRadius: '18px',
                  borderBottomRightRadius: msg.sender === 'user' ? '4px' : '18px',
                  borderBottomLeftRadius: msg.sender === 'bot' ? '4px' : '18px',
                  width: msg.isLog ? '100%' : 'auto'
                }}>
                  {msg.text}
                  
                  {/* Collapsible logs */}
                  {msg.isLog && msg.logDetails && msg.logDetails.length > 0 && (
                    <div style={{ marginTop: '10px' }}>
                      <Collapse 
                        ghost 
                        size="small"
                        expandIconPosition="end"
                        items={[
                          {
                            key: '1',
                            label: <Typography.Text strong>Show Details</Typography.Text>,
                            children: (
                              <div style={{ 
                                backgroundColor: '#000', 
                                color: '#fff', 
                                padding: '12px', 
                                borderRadius: '4px', 
                                maxHeight: '200px', 
                                overflowY: 'auto',
                                fontFamily: 'monospace',
                                fontSize: '12px'
                              }}>
                                {msg.logDetails.map(log => (
                                  <div key={log.id} style={{ marginBottom: '6px', display: 'flex', alignItems: 'flex-start' }}>
                                    <span style={{ 
                                      color: 
                                        log.type === 'success' ? '#52c41a' : 
                                        log.type === 'error' ? '#ff4d4f' :
                                        log.type === 'warning' ? '#faad14' : 
                                        '#1677ff',
                                      marginRight: '8px'
                                    }}>
                                      {log.type === 'success' ? '✓' : 
                                       log.type === 'error' ? '✗' :
                                       log.type === 'warning' ? '⚠' : 
                                       '→'}
                                    </span>
                                    <span>
                                      <span style={{ color: '#888', marginRight: '8px' }}>
                                        {log.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                      </span>
                                      {log.message}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            )
                          }
                        ]}
                      />
                    </div>
                  )}
                </div>
              )}
              
              {/* Version input field */}
              {msg.requiresInput && msg.inputType === 'version' && (
                <div style={{
                  backgroundColor: '#f0f0f0',
                  padding: '20px',
                  borderRadius: '12px',
                  width: '100%',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                  border: '1px solid #d9d9d9'
                }}>
                  <Typography.Title level={5} style={{ marginBottom: '16px' }}>
                    <RocketOutlined style={{ marginRight: '10px', color: '#1677ff' }} />
                    {msg.text}
                  </Typography.Title>
                  
                  <Input
                    size="large"
                    placeholder="v1.0.0" 
                    prefix={<UserOutlined style={{ color: '#1677ff' }} />}
                    value={versionInput}
                    onChange={e => setVersionInput(e.target.value)}
                    onPressEnter={handleVersionSubmit}
                    style={{ marginBottom: '12px' }}
                    autoFocus
                  />
                  
                  <Button 
                    type="primary" 
                    size="large"
                    onClick={handleVersionSubmit}
                    disabled={!versionInput.trim()}
                    icon={<SendOutlined />}
                    style={{ width: '100%' }}
                  >
                    Continue with this version
                  </Button>
                </div>
              )}
              
              {/* Message timestamp */}
              {!msg.requiresInput && (
                <Typography.Text type="secondary" style={{ 
                  fontSize: '11px', 
                  display: 'block', 
                  marginTop: '4px',
                  textAlign: msg.sender === 'user' ? 'right' : 'left'
                }}>
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Typography.Text>
              )}
            </motion.div>
          ))}
          <div ref={chatEndRef} />
        </div>

        {/* Chat Input */}
        <div style={{ 
          padding: '16px', 
          borderTop: '1px solid #f0f0f0',
          display: 'flex',
          gap: '8px'
        }}>
          <Input
            placeholder="Type a message..."
            value={chatInput}
            onChange={e => setChatInput(e.target.value)}
            onPressEnter={handleSendMessage}
            style={{ flex: 1 }}
          />
          <Button
            type="primary"
            icon={<SendOutlined />}
            onClick={handleSendMessage}
            disabled={!chatInput.trim()}
          />
        </div>
      </motion.div>
    </PageLayout>
  )
}