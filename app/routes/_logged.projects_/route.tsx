import { PageLayout } from '@/designSystem/layouts/PageLayout'
import { Card, Typography, List, Button, Input, Form, Space, Divider, message, Alert, Spin, Avatar, Progress, Collapse, Tag } from 'antd'
import { useState, useEffect, useRef } from 'react'
import { FolderOutlined, PlusOutlined, DeleteOutlined, FolderOpenOutlined, SendOutlined, RobotOutlined, CheckCircleOutlined, LoadingOutlined, GlobalOutlined, CodeOutlined, BarChartOutlined, LineChartOutlined } from '@ant-design/icons'
import { Api } from '@/core/trpc'
import { motion } from 'framer-motion'
import { useNavigate } from '@remix-run/react'

// Add FileSystem Access API types
declare global {
  interface Window {
    showDirectoryPicker: () => Promise<any>
  }
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
  inputType?: 'domain';
}

// Define deployment log interface
interface DeploymentLog {
  id: string;
  message: string;
  type: 'info' | 'success' | 'error' | 'warning';
  timestamp: Date;
}

export default function ProjectsPage() {
  const navigate = useNavigate()
  const [form] = Form.useForm()
  const [editMode, setEditMode] = useState(false)
  const [selectedPath, setSelectedPath] = useState('')
  const [isFileApiSupported, setIsFileApiSupported] = useState(true)
  
  // Chat state
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [chatInput, setChatInput] = useState('')
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [isDeploying, setIsDeploying] = useState(false)
  const [currentDeployStep, setCurrentDeployStep] = useState(0)
  const [domainName, setDomainName] = useState('')
  const [waitingForDomain, setWaitingForDomain] = useState(false)
  const [deployProgress, setDeployProgress] = useState(0)
  const [deployLogs, setDeployLogs] = useState<DeploymentLog[]>([])
  const [deploymentId, setDeploymentId] = useState<string>('')
  const chatEndRef = useRef<HTMLDivElement>(null)
  
  // Navigate to observability page for a specific deployment
  const viewDeploymentLogs = () => {
    // Use the full path format matching the route pattern
    navigate('/devops/observability')
  }
  
  // Query projects from the database
  const { data: projects, isLoading, refetch } = Api.project.findMany.useQuery()
  
  // Create project mutation
  const createProject = Api.project.create.useMutation({
    onSuccess: () => {
      refetch()
      form.resetFields()
      setEditMode(false)
      message.success('Project added successfully!')
    },
    onError: (error) => {
      message.error(`Failed to add project: ${error.message}`)
    },
  })
  
  // Delete project mutation
  const deleteProject = Api.project.delete.useMutation({
    onSuccess: () => {
      refetch()
      message.success('Project removed')
    },
    onError: (error) => {
      message.error(`Failed to remove project: ${error.message}`)
    },
  })
  
  // Check if File System Access API is available
  useEffect(() => {
    if (!window.showDirectoryPicker) {
      setIsFileApiSupported(false)
      console.warn('File System Access API is not supported in this browser')
    }
  }, [])

  // Scroll to bottom of chat when messages change
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [chatMessages])

  // Deployment animation steps
  const deploymentSteps = [
    { message: "Do you own a domain name?", requiresInput: true, inputType: 'domain' },
    { message: "Great! We'll deploy your app to {domainName}", requiresInput: false },
    { message: "Gathering requirements and analyzing project structure", requiresInput: false },
    { message: "Building frontend assets for production", requiresInput: false },
    { message: "Building docker image for backend services", requiresInput: false },
    { message: "Provisioning cloud infrastructure", requiresInput: false },
    { message: "Deploying backend services", requiresInput: false },
    { message: "Configuring DNS and routing", requiresInput: false },
    { message: "Setting up environment variables", requiresInput: false },
    { message: "Configuring API endpoints", requiresInput: false },
    { message: "Connecting frontend with backend services", requiresInput: false },
    { message: "Running final checks and tests", requiresInput: false },
    { message: "Voila! Your app is now live at https://{domainName}", requiresInput: false }
  ]

  // Function to add a deployment log
  const addDeploymentLog = (message: string, type: 'info' | 'success' | 'error' | 'warning' = 'info') => {
    const newLog = {
      id: Date.now().toString(),
      message,
      type,
      timestamp: new Date()
    }
    
    setDeployLogs(prev => [...prev, newLog])
    return newLog
  }

  // Generate realistic logs for each deployment step
  const generateLogsForStep = (step: number): DeploymentLog[] => {
    const logs: DeploymentLog[] = []
    
    switch(step) {
      case 2: // Gathering requirements
        logs.push(
          { id: crypto.randomUUID(), message: 'Scanning project files...', type: 'info', timestamp: new Date() },
          { id: crypto.randomUUID(), message: 'Detecting dependencies...', type: 'info', timestamp: new Date() },
          { id: crypto.randomUUID(), message: 'Found package.json with React dependencies', type: 'success', timestamp: new Date() },
          { id: crypto.randomUUID(), message: 'Detected TypeScript configuration', type: 'info', timestamp: new Date() },
          { id: crypto.randomUUID(), message: 'Requirements analysis complete', type: 'success', timestamp: new Date() }
        )
        break
      case 3: // Building frontend
        logs.push(
          { id: crypto.randomUUID(), message: 'Running npm build...', type: 'info', timestamp: new Date() },
          { id: crypto.randomUUID(), message: 'Optimizing assets...', type: 'info', timestamp: new Date() },
          { id: crypto.randomUUID(), message: 'Compressing images...', type: 'info', timestamp: new Date() },
          { id: crypto.randomUUID(), message: 'Bundle size: 2.4MB', type: 'info', timestamp: new Date() },
          { id: crypto.randomUUID(), message: 'Build successful!', type: 'success', timestamp: new Date() }
        )
        break
      case 4: // Building docker
        logs.push(
          { id: crypto.randomUUID(), message: 'Creating Dockerfile...', type: 'info', timestamp: new Date() },
          { id: crypto.randomUUID(), message: 'Building base layer...', type: 'info', timestamp: new Date() },
          { id: crypto.randomUUID(), message: 'Installing dependencies...', type: 'info', timestamp: new Date() },
          { id: crypto.randomUUID(), message: 'Copying application code...', type: 'info', timestamp: new Date() },
          { id: crypto.randomUUID(), message: 'Finalizing image...', type: 'info', timestamp: new Date() },
          { id: crypto.randomUUID(), message: 'Docker image built successfully: app:latest (245MB)', type: 'success', timestamp: new Date() }
        )
        break
      case 5: // Provisioning infrastructure
        logs.push(
          { id: crypto.randomUUID(), message: 'Connecting to cloud provider...', type: 'info', timestamp: new Date() },
          { id: crypto.randomUUID(), message: 'Provisioning virtual machines...', type: 'info', timestamp: new Date() },
          { id: crypto.randomUUID(), message: 'Setting up networking...', type: 'info', timestamp: new Date() },
          { id: crypto.randomUUID(), message: 'Creating database instance...', type: 'info', timestamp: new Date() },
          { id: crypto.randomUUID(), message: 'Infrastructure ready', type: 'success', timestamp: new Date() }
        )
        break
      case 6: // Deploying backend
        logs.push(
          { id: crypto.randomUUID(), message: 'Pushing docker image to registry...', type: 'info', timestamp: new Date() },
          { id: crypto.randomUUID(), message: 'Deploying container to production...', type: 'info', timestamp: new Date() },
          { id: crypto.randomUUID(), message: 'Initializing database schema...', type: 'info', timestamp: new Date() },
          { id: crypto.randomUUID(), message: 'Starting backend services...', type: 'info', timestamp: new Date() },
          { id: crypto.randomUUID(), message: 'Backend deployment complete', type: 'success', timestamp: new Date() }
        )
        break
      case 7: // Configuring DNS
        logs.push(
          { id: crypto.randomUUID(), message: `Configuring DNS for ${domainName}...`, type: 'info', timestamp: new Date() },
          { id: crypto.randomUUID(), message: 'Setting up SSL certificate...', type: 'info', timestamp: new Date() },
          { id: crypto.randomUUID(), message: 'Configuring load balancer...', type: 'info', timestamp: new Date() },
          { id: crypto.randomUUID(), message: 'DNS propagation in progress (may take up to 24 hours)...', type: 'warning', timestamp: new Date() },
          { id: crypto.randomUUID(), message: 'Initial DNS configuration complete', type: 'success', timestamp: new Date() }
        )
        break
      case 8: // Setting up env variables
        logs.push(
          { id: crypto.randomUUID(), message: 'Creating environment configuration...', type: 'info', timestamp: new Date() },
          { id: crypto.randomUUID(), message: 'Generating secure API keys...', type: 'info', timestamp: new Date() },
          { id: crypto.randomUUID(), message: 'Configuring database connection...', type: 'info', timestamp: new Date() },
          { id: crypto.randomUUID(), message: 'Environment setup complete', type: 'success', timestamp: new Date() }
        )
        break
      case 9: // Configuring API endpoints
        logs.push(
          { id: crypto.randomUUID(), message: 'Setting up API gateway...', type: 'info', timestamp: new Date() },
          { id: crypto.randomUUID(), message: 'Configuring API routes...', type: 'info', timestamp: new Date() },
          { id: crypto.randomUUID(), message: 'Setting up rate limiting...', type: 'info', timestamp: new Date() },
          { id: crypto.randomUUID(), message: 'Implementing API security...', type: 'info', timestamp: new Date() },
          { id: crypto.randomUUID(), message: 'API configuration complete', type: 'success', timestamp: new Date() }
        )
        break
      case 10: // Connecting frontend with backend
        logs.push(
          { id: crypto.randomUUID(), message: 'Updating frontend API configuration...', type: 'info', timestamp: new Date() },
          { id: crypto.randomUUID(), message: 'Deploying frontend to CDN...', type: 'info', timestamp: new Date() },
          { id: crypto.randomUUID(), message: 'Configuring CORS...', type: 'info', timestamp: new Date() },
          { id: crypto.randomUUID(), message: 'Frontend-backend integration complete', type: 'success', timestamp: new Date() }
        )
        break
      case 11: // Running checks and tests
        logs.push(
          { id: crypto.randomUUID(), message: 'Running health checks...', type: 'info', timestamp: new Date() },
          { id: crypto.randomUUID(), message: 'Running integration tests...', type: 'info', timestamp: new Date() },
          { id: crypto.randomUUID(), message: 'Checking performance metrics...', type: 'info', timestamp: new Date() },
          { id: crypto.randomUUID(), message: 'All tests passed successfully!', type: 'success', timestamp: new Date() }
        )
        break
      default:
        break
    }
    
    return logs
  }

  // Handle deployment animation
  useEffect(() => {
    if (isDeploying && currentDeployStep < deploymentSteps.length) {
      // Don't auto-advance if waiting for domain input
      if (currentDeployStep === 0 && !domainName) {
        if (!waitingForDomain) {  // Only show the prompt once
          setWaitingForDomain(true)
          const step = deploymentSteps[currentDeployStep]
          addBotMessage(step.message, false, true, 'domain')
        }
        return
      }
      
      const randomDelay = Math.floor(Math.random() * 2000) + 1500 // Random delay between 1.5-3.5 seconds
      
      const timer = setTimeout(() => {
        const step = deploymentSteps[currentDeployStep]
        const stepMessage = step.message.replace('{domainName}', domainName)
        
        // Generate logs for this step
        const logs = generateLogsForStep(currentDeployStep)
        
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
          // Generate a unique deployment ID
          const newDeploymentId = `deploy-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
          setDeploymentId(newDeploymentId);
          
          // Add the View Logs button after a short delay
          setTimeout(() => {
            addBotMessage(
              `View detailed logs and metrics for this deployment:`,
              false,
              false,
              undefined,
              undefined,
              'view-logs-button'
            );
          }, 1000);
          
          setIsDeploying(false);
        }
      }, randomDelay)
      
      return () => clearTimeout(timer)
    }
  }, [isDeploying, currentDeployStep, domainName, waitingForDomain])

  const addProject = (values: {name: string, path: string}) => {
    createProject.mutate({
      data: {
        name: values.name,
        path: values.path,
        description: '',
      }
    })
  }

  const removeProject = (id: string) => {
    deleteProject.mutate({
      where: { id }
    })
  }
  
  const openDirectoryPicker = async () => {
    if (!isFileApiSupported) {
      message.error('File System Access API is not supported in this browser')
      return
    }
    
    try {
      // Show the system's directory picker dialog
      const directoryHandle = await window.showDirectoryPicker()
      
      // Get the directory path using its name and parent hierarchy
      const path = directoryHandle.name
      
      setSelectedPath(path)
      form.setFieldsValue({ path })
      
      message.success('Directory selected')
    } catch (error) {
      // User likely canceled the dialog
      console.log('Directory selection was canceled or failed', error)
    }
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
    inputType?: 'domain',
    logDetails?: DeploymentLog[],
    messageId?: string
  ) => {
    setChatMessages(prev => [
      ...prev, 
      { 
        id: messageId || Date.now().toString(), 
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
  
  // Handle domain input submission
  const handleDomainSubmit = () => {
    if (!domainName.trim()) return
    
    // Add user message with domain
    addUserMessage(domainName)
    
    // Continue deployment process
    setWaitingForDomain(false)
    setCurrentDeployStep(1) // Move to next step
    setIsDeploying(true)
  }

  const handleSendMessage = () => {
    if (!chatInput.trim()) return
    
    // If waiting for domain input, treat the input as domain name
    if (waitingForDomain) {
      setDomainName(chatInput)
      addUserMessage(chatInput)
      
      // Continue deployment process
      setWaitingForDomain(false)
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
            break
          }
        }
      }
      
      // Reset deployment state
      setDeployProgress(0)
      setDeployLogs([])
      setDomainName('')
      setWaitingForDomain(false)
      
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
        addBotMessage("Hello! I'm your deployment assistant. How can I help you today?")
      }, 500)
    }
  }

  return (
    <PageLayout>
      {!isFileApiSupported && (
        <Alert
          type="warning"
          style={{ marginBottom: '16px' }}
          message="File System Access API Not Supported"
          description="Your browser doesn't support the File System Access API needed for directory selection. Please try a different browser like Chrome or Edge."
          showIcon
        />
      )}
      
      <Card>
        <Space direction="vertical" style={{ width: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography.Title level={4}>Local Projects</Typography.Title>
            <Button 
              type="primary" 
              icon={<PlusOutlined />} 
              onClick={() => setEditMode(true)}
              disabled={editMode || createProject.isLoading}
            >
              Add Project
            </Button>
          </div>
          
          {editMode && (
            <>
              <Form form={form} layout="vertical" onFinish={addProject}>
                <Form.Item 
                  name="name" 
                  label="Project Name" 
                  rules={[{ required: true, message: 'Please enter project name' }]}
                >
                  <Input placeholder="My Project" />
                </Form.Item>
                <Form.Item 
                  name="path" 
                  label="Project Path" 
                  rules={[{ required: true, message: 'Please enter project path' }]}
                >
                  <Input.Group compact>
                    <Input 
                      style={{ width: 'calc(100% - 40px)' }}
                      placeholder="/Users/username/projects/my-project"
                      value={selectedPath}
                      readOnly
                    />
                    <Button 
                      icon={<FolderOpenOutlined />}
                      onClick={openDirectoryPicker}
                      disabled={!isFileApiSupported}
                      title={isFileApiSupported ? "Select directory" : "Feature not supported in this browser"}
                      style={{ width: '40px' }}
                    />
                  </Input.Group>
                  {!isFileApiSupported && (
                    <Typography.Text type="secondary">
                      Directory selection requires a compatible browser (Chrome, Edge, etc.)
                    </Typography.Text>
                  )}
                </Form.Item>
                <Form.Item>
                  <Space>
                    <Button 
                      type="primary" 
                      htmlType="submit" 
                      loading={createProject.isLoading}
                    >
                      Save Project
                    </Button>
                    <Button onClick={() => setEditMode(false)}>
                      Cancel
                    </Button>
                  </Space>
                </Form.Item>
              </Form>
              <Divider />
            </>
          )}

          {isLoading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
              <Spin size="large" />
            </div>
          ) : projects?.length === 0 && !editMode ? (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <FolderOutlined style={{ fontSize: '3rem', color: '#d9d9d9', marginBottom: '1rem' }} />
              <Typography.Text type="secondary" style={{ display: 'block' }}>
                No projects added yet. Click 'Add Project' to get started.
              </Typography.Text>
            </div>
          ) : (
            <List
              dataSource={projects}
              renderItem={(project) => (
                <List.Item
                  actions={[
                    <Button 
                      key="delete" 
                      type="text" 
                      danger 
                      icon={<DeleteOutlined />}
                      onClick={() => removeProject(project.id)}
                      loading={deleteProject.isLoading}
                    />
                  ]}
                >
                  <List.Item.Meta
                    avatar={<FolderOutlined style={{ fontSize: '1.5rem', color: '#1677ff' }} />}
                    title={project.name}
                    description={project.path}
                  />
                </List.Item>
              )}
            />
          )}
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
            <Avatar icon={<RobotOutlined />} style={{ backgroundColor: '#1677ff' }} />
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
              {!msg.requiresInput && msg.id !== 'view-logs-button' && (
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
                        defaultActiveKey={['1']}
                        items={[
                          {
                            key: '1',
                            label: <Typography.Text strong>Operation Details</Typography.Text>,
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
              
              {/* Domain input field */}
              {msg.requiresInput && msg.inputType === 'domain' && (
                <div style={{
                  backgroundColor: '#f0f0f0',
                  padding: '20px',
                  borderRadius: '12px',
                  width: '100%',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                  border: '1px solid #d9d9d9'
                }}>
                  <Typography.Title level={5} style={{ marginBottom: '16px' }}>
                    <GlobalOutlined style={{ marginRight: '10px', color: '#1677ff' }} />
                    {msg.text}
                  </Typography.Title>
                  
                  <Input
                    size="large"
                    placeholder="yourdomain.com" 
                    prefix={<GlobalOutlined style={{ color: '#1677ff' }} />}
                    value={domainName}
                    onChange={e => setDomainName(e.target.value)}
                    onPressEnter={handleDomainSubmit}
                    style={{ marginBottom: '12px' }}
                    autoFocus
                  />
                  
                  <Button 
                    type="primary" 
                    size="large"
                    onClick={handleDomainSubmit}
                    disabled={!domainName.trim()}
                    icon={<SendOutlined />}
                    style={{ width: '100%' }}
                  >
                    Continue with this domain
                  </Button>
                </div>
              )}
              
              {/* View Logs button */}
              {msg.id === 'view-logs-button' && (
                <div style={{
                  display: 'flex',
                  justifyContent: 'center',
                  width: '100%',
                  marginTop: '8px',
                  marginBottom: '8px'
                }}>
                  <Button
                    type="primary"
                    icon={<BarChartOutlined />}
                    size="large"
                    onClick={viewDeploymentLogs}
                    style={{
                      borderRadius: '8px',
                      padding: '0 20px',
                      height: '44px',
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)'
                    }}
                  >
                    View Deployment Logs & Metrics
                  </Button>
                </div>
              )}
              
              {/* Message timestamp */}
              {!msg.requiresInput && msg.id !== 'view-logs-button' && (
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