import { PageLayout } from '@/designSystem/layouts/PageLayout'
import { Card, Typography, List, Button, Input, Form, Space, Divider, message, Alert, Spin, Avatar, Progress, Collapse, Tag, Tooltip } from 'antd'
import { useState, useEffect, useRef } from 'react'
import { FolderOutlined, PlusOutlined, DeleteOutlined, FolderOpenOutlined, SendOutlined, RobotOutlined, CheckCircleOutlined, LoadingOutlined, GlobalOutlined, CodeOutlined, BarChartOutlined, LineChartOutlined, ToolOutlined, ApiOutlined, CodeSandboxOutlined, ConsoleSqlOutlined, CloseCircleOutlined } from '@ant-design/icons'
import { Api } from '@/core/trpc'
import { motion } from 'framer-motion'
import { useNavigate } from '@remix-run/react'
import { GitHubRepoSelector } from '~/components/GitHubRepoSelector'
import { io, Socket } from 'socket.io-client'

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
  toolCalls?: Array<{name: string, input: any}>;
}

// Define deployment log interface
interface DeploymentLog {
  id: string;
  message: string;
  type: 'info' | 'success' | 'error' | 'warning';
  timestamp: Date;
}

// Helper function to get tool icon based on tool name
const getToolIcon = (toolName: string) => {
  const iconProps = { style: { fontSize: '16px' } };
  
  switch (toolName.toLowerCase()) {
    case 'docker_cli':
      return <CodeSandboxOutlined {...iconProps} />;
    case 'github_clone':
      return <CodeOutlined {...iconProps} />;
    case 'api_call':
      return <ApiOutlined {...iconProps} />;
    case 'database_query':
      return <ConsoleSqlOutlined {...iconProps} />;
    default:
      return <ToolOutlined {...iconProps} />;
  }
};

// Command Display Component
const CommandDisplay = ({ command }) => {
  const [copied, setCopied] = useState(false);
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(command);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  return (
    <div style={{
      backgroundColor: '#282c34',
      borderRadius: '4px',
      marginTop: '8px',
      overflow: 'hidden',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    }}>
      {/* Terminal header */}
      <div style={{
        backgroundColor: '#1e1e1e',
        padding: '6px 12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid #333'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#ff5f56' }}></div>
          <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#ffbd2e' }}></div>
          <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#27c93f' }}></div>
        </div>
        <Typography.Text style={{ color: '#aaa', fontSize: '12px' }}>
          terminal
        </Typography.Text>
      </div>
      
      {/* Command content */}
      <div style={{ padding: '12px', position: 'relative' }}>
        <pre style={{ 
          margin: 0, 
          color: '#f8f8f2',
          fontFamily: 'monospace',
          fontSize: '13px',
          overflowX: 'auto'
        }}>
          <code>{command}</code>
        </pre>
        
        <Tooltip title={copied ? "Copied!" : "Copy to clipboard"}>
          <Button 
            type="text" 
            size="small"
            icon={copied ? <CheckCircleOutlined /> : <CodeOutlined />}
            onClick={copyToClipboard}
            style={{
              position: 'absolute',
              top: '6px',
              right: '6px',
              color: copied ? '#52c41a' : '#aaa',
              backgroundColor: 'rgba(0,0,0,0.2)',
              borderRadius: '4px',
              padding: '4px 8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          />
        </Tooltip>
      </div>
    </div>
  );
};

// Tool Call Component
const ToolCallDisplay = ({ toolName, input }) => {
  const [status, setStatus] = useState('running');
  const [showOutput, setShowOutput] = useState(false);
  
  // Simulate tool execution status (in a real app, this would come from the backend)
  useEffect(() => {
    const statusTimer = setTimeout(() => {
      setStatus('completed');
    }, 1500);
    
    const outputTimer = setTimeout(() => {
      setShowOutput(true);
    }, 800);
    
    return () => {
      clearTimeout(statusTimer);
      clearTimeout(outputTimer);
    };
  }, []);
  
  // Format the input parameters for display
  const formatParams = () => {
    if (!input) return null;
    
    // Filter out command parameters that are displayed separately
    return Object.entries(input)
      .filter(([key]) => key !== 'command' && !(toolName.toLowerCase() === 'docker_cli' && key === 'args'))
      .map(([key, value]) => {
        const displayValue = typeof value === 'string' 
          ? value 
          : JSON.stringify(value, null, 2);
          
        return (
          <div key={key} style={{ marginBottom: '4px' }}>
            <Typography.Text type="secondary" style={{ marginRight: '8px' }}>
              {key}:
            </Typography.Text>
            <Typography.Text code style={{ 
              maxWidth: '100%', 
              wordBreak: 'break-word',
              whiteSpace: 'pre-wrap'
            }}>
              {displayValue}
            </Typography.Text>
          </div>
        );
      });
  };
  
  // Extract command from input if it exists
  const getCommand = () => {
    if (!input) return null;
    
    if (toolName.toLowerCase() === 'docker_cli') {
      // For Docker CLI, construct the full command
      if (input.command) return input.command;
      if (input.args) return `docker ${input.args}`;
    }
    
    return input.command || null;
  };
  
  const command = getCommand();
  
  // Get status indicator
  const getStatusIndicator = () => {
    switch(status) {
      case 'running':
        return <LoadingOutlined style={{ color: '#1677ff' }} />;
      case 'completed':
        return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
      case 'failed':
        return <CloseCircleOutlined style={{ color: '#ff4d4f' }} />;
      default:
        return null;
    }
  };
  
  // Simulate command output for Docker commands
  const getCommandOutput = () => {
    if (toolName.toLowerCase() === 'docker_cli' && command && command.includes('run')) {
      return `Unable to find image 'pokemonlabs-dummy:latest' locally
Pulling from docker.io/library/pokemonlabs-dummy
Digest: sha256:a1c3ed906cdad4f4305e4f897e07c1f864c6634a2c19a01a6d1a9e8c30bdcca3
Status: Downloaded newer image for pokemonlabs-dummy:latest
Container started successfully on port 3001`;
    }
    
    return null;
  };
  
  const commandOutput = getCommandOutput();
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.03)',
        borderRadius: '6px',
        padding: '12px',
        marginTop: '8px',
        marginBottom: '8px',
        border: '1px solid rgba(0, 0, 0, 0.06)',
        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
      }}
    >
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        marginBottom: '8px',
        borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
        paddingBottom: '8px',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ 
            backgroundColor: '#1677ff', 
            borderRadius: '50%', 
            width: '24px', 
            height: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: '8px',
            color: 'white'
          }}>
            {getToolIcon(toolName)}
          </div>
          <Typography.Text strong style={{ fontSize: '14px' }}>
            Using tool: {toolName}
          </Typography.Text>
        </div>
        
        <Tag color={
          status === 'running' ? 'processing' : 
          status === 'completed' ? 'success' : 
          status === 'failed' ? 'error' : 'default'
        } icon={getStatusIndicator()}>
          {status === 'running' ? 'Running' : 
           status === 'completed' ? 'Completed' : 
           status === 'failed' ? 'Failed' : 'Unknown'}
        </Tag>
      </div>
      
      {/* If we have a command, display it prominently */}
      {command && (
        <CommandDisplay command={command} />
      )}
      
      {/* Command output */}
      {commandOutput && showOutput && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          transition={{ duration: 0.5 }}
        >
          <div style={{
            backgroundColor: '#282c34',
            borderRadius: '4px',
            padding: '12px',
            marginTop: '8px',
            color: '#a9b7c6',
            fontFamily: 'monospace',
            fontSize: '12px',
            whiteSpace: 'pre-wrap',
            maxHeight: '200px',
            overflowY: 'auto'
          }}>
            {commandOutput}
          </div>
        </motion.div>
      )}
      
      {/* Other parameters */}
      <div style={{ paddingLeft: '8px', marginTop: command ? '12px' : 0 }}>
        {formatParams()}
      </div>
    </motion.div>
  );
};

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
  const socketRef = useRef<Socket | null>(null)
  const [agentStatus, setAgentStatus] = useState('Disconnected')
  const [currentAgentMessageId, setCurrentAgentMessageId] = useState<string | null>(null)
  const [isAgentThinking, setIsAgentThinking] = useState(false)
  const [thinkingDots, setThinkingDots] = useState('')
  
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
  
  // Thinking animation effect
  useEffect(() => {
    let interval;
    if (isAgentThinking) {
      interval = setInterval(() => {
        setThinkingDots(prev => {
          if (prev.length >= 3) return '';
          return prev + '.';
        });
      }, 500);
    } else {
      setThinkingDots('');
    }
    
    return () => clearInterval(interval);
  }, [isAgentThinking]);
  
  // Initialize socket connection
  useEffect(() => {
    // Create socket connection
    socketRef.current = io();
    
    // Set up event listeners
    socketRef.current.on('connect', () => {
      setAgentStatus('Connected');
      console.log('Socket connected');
    });
    
    socketRef.current.on('disconnect', () => {
      setAgentStatus('Disconnected');
      console.log('Socket disconnected');
    });
    
    socketRef.current.on('agentResponse', (chunk) => {
      console.log('Agent response:', chunk);
      
      // Show that the agent is thinking
      setIsAgentThinking(true);
      
      // Process the agent response
      if (Array.isArray(chunk)) {
        // Handle array of response items (thinking + tool calls)
        processAgentResponseArray(chunk);
      } else if (chunk.kwargs && chunk.kwargs.content) {
        // Handle single response item
        processAgentResponseItem(chunk.kwargs.content);
      } else {
        // Fallback for unexpected formats
        addBotMessageToChat('Received response in unsupported format');
      }
    });
    
    socketRef.current.on('agentComplete', () => {
      setAgentStatus('Connected');
      setCurrentAgentMessageId(null); // Reset for next message
      setIsAgentThinking(false); // Stop thinking animation
    });
    
    socketRef.current.on('agentError', (error) => {
      setAgentStatus(`Error: ${error.message}`);
      message.error(`Agent error: ${error.message}`);
      setIsAgentThinking(false); // Stop thinking animation
    });
    
    // Helper function to process an array of agent response items
    const processAgentResponseArray = (responseArray) => {
      // Combine all text items into a single message
      let messageText = '';
      let toolCalls = [];
      
      responseArray.forEach(item => {
        if (item.type === 'text' && item.text) {
          messageText += item.text + '\n\n';
        } else if (item.type === 'tool_use') {
          // Store tool calls separately
          toolCalls.push({
            name: item.name,
            input: item.input
          });
        }
      });
      
      // Add the message with text and tool calls
      addBotMessageToChat(messageText.trim(), toolCalls);
    };
    
    // Helper function to process a single agent response item
    const processAgentResponseItem = (content) => {
      if (typeof content === 'string') {
        addBotMessageToChat(content);
      } else if (typeof content === 'object') {
        if (content.text) {
          addBotMessageToChat(content.text);
        } else if (Array.isArray(content)) {
          processAgentResponseArray(content);
        } else {
          // Fallback to JSON stringification
          addBotMessageToChat(JSON.stringify(content));
        }
      }
    };
    
    // Helper function to add a bot message to chat
    const addBotMessageToChat = (text, toolCalls = []) => {
      if (currentAgentMessageId) {
        // Update existing message
        setChatMessages(prev => 
          prev.map(msg => 
            msg.id === currentAgentMessageId 
              ? { ...msg, text, toolCalls } 
              : msg
          )
        );
      } else {
        // Create new message with a unique ID
        const newMessageId = Date.now().toString();
        setCurrentAgentMessageId(newMessageId);
        
        setChatMessages(prev => [
          ...prev,
          {
            id: newMessageId,
            text,
            toolCalls,
            sender: 'bot',
            timestamp: new Date()
          }
        ]);
      }
    };
    
    // Clean up on unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);
  
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

  const openDirectoryPicker = async () => {
    if (!isFileApiSupported) {
      message.error('File System Access API is not supported in this browser')
      return
    }
    
    try {
      // Show the system's directory picker dialog
      const directoryHandle = await window.showDirectoryPicker()
      
      // Get the directory name
      const dirName = directoryHandle.name
      
      // Store the original directory name for later use
      const originalPath = dirName
      
      // Set the path to be in the extras folder
      const extrasPath = `extras/${dirName}`
      
      setSelectedPath(originalPath)
      form.setFieldsValue({ 
        path: originalPath,
        // Store the original path as a data attribute to use when submitting
        originalPath: originalPath 
      })
      
      // Notify the user that the directory will be stored in the extras folder
      message.success(`Directory selected. Project will be stored in ${extrasPath}`)
    } catch (error) {
      // User likely canceled the dialog
      console.log('Directory selection was canceled or failed', error)
    }
  }

  const addProject = async (values: {name: string, path: string, originalPath?: string}) => {
    try {
      // If we have an originalPath, we need to copy the files to the extras folder
      if (values.originalPath) {
        // Call our API to copy the files
        const response = await fetch('/api/project-files/copy-to-extras', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            sourcePath: values.originalPath,
            projectName: values.name,
          }),
        })
        
        const data = await response.json()
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to copy project files')
        }
        
        // Use the path returned by the API
        values.path = data.path
      } else if (!values.path.startsWith('extras/')) {
        // If the path is not in the extras folder format, convert it
        values.path = `extras/${values.name}`
      }
      
      // Create the project in the database
      createProject.mutate({
        data: {
          name: values.name,
          path: values.path,
          description: '',
        }
      })
      
      message.success(`Project added successfully in ${values.path}`)
    } catch (error) {
      console.error('Error adding project:', error)
      message.error(`Failed to add project: ${error.message}`)
    }
  }

  const handleGitHubRepoSelect = (repo: any) => {
    // Extract only the properties that are valid for ProjectCreateInput
    createProject.mutate({
      data: {
        name: repo.name,
        path: repo.html_url,
        description: repo.description || '',
        // Remove the properties that are causing linter errors
        // and handle them separately if needed
      }
    })
    
    // If you need to store GitHub-specific data, consider using a separate API call
    // or modifying your schema to include these fields
  }

  const removeProject = (id: string) => {
    deleteProject.mutate({
      where: { id }
    })
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
  
  // Handle domain input submission
  const handleDomainSubmit = () => {
    if (!domainName.trim()) return
    
    // Add user message with domain
    addUserMessage(domainName)
    
    // Send domain to agent
    if (socketRef.current) {
      socketRef.current.emit('runAgent', `Use this domain for deployment: ${domainName}`);
    }
    
    // Reset domain state
    setWaitingForDomain(false)
    setDomainName('')
  }

  const handleSendMessage = () => {
    if (!chatInput.trim()) return
    
    // If waiting for domain input, treat the input as domain name
    if (waitingForDomain) {
      setDomainName(chatInput)
      handleDomainSubmit()
      setChatInput('')
      return
    }
    
    // Add user message to chat
    addUserMessage(chatInput)
    
    // Set agent status to thinking
    setAgentStatus('Agent is thinking...')
    setIsAgentThinking(true); // Start thinking animation
    
    // Send message to agent via socket
    if (socketRef.current) {
      // Include project context in the message
      let contextMessage = chatInput;
      
      // Add project information if available
      if (projects && projects.length > 0) {
        contextMessage += "\n\nAvailable projects:";
        projects.forEach(project => {
          contextMessage += `\n- ${project.name} (${project.path})`;
        });
      }
      
      socketRef.current.emit('runAgent', contextMessage);
    }
    
    setChatInput('')
  }

  const toggleChat = () => {
    setIsChatOpen(prev => !prev)
    if (!isChatOpen && chatMessages.length === 0) {
      // Add welcome message when opening chat for the first time
      setTimeout(() => {
        if (socketRef.current) {
          socketRef.current.emit('runAgent', 'Introduce yourself as a deployment assistant');
        }
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
            <Typography.Title level={4}>Projects</Typography.Title>
            <Space>
              <GitHubRepoSelector onSelect={handleGitHubRepoSelect} />
              <Button 
                type="primary" 
                icon={<PlusOutlined />} 
                onClick={() => setEditMode(true)}
                disabled={editMode || createProject.isLoading}
              >
                Add Local Project
              </Button>
            </Space>
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
                {/* Hidden field to store the original path */}
                <Form.Item name="originalPath" hidden>
                  <Input />
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
          {chatMessages.map(msg => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              style={{
                alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '80%',
              }}
            >
              {/* Message bubble */}
              <div style={{
                backgroundColor: msg.sender === 'user' ? '#1677ff' : '#f0f0f0',
                color: msg.sender === 'user' ? 'white' : 'black',
                padding: '10px 14px',
                borderRadius: '18px',
                borderBottomRightRadius: msg.sender === 'user' ? '4px' : '18px',
                borderBottomLeftRadius: msg.sender === 'bot' ? '4px' : '18px',
              }}>
                {/* Regular text content */}
                {msg.text && (
                  <div>
                    {msg.text.split('\n').map((line, i) => (
                      <div key={i} style={{ 
                        marginBottom: i < msg.text.split('\n').length - 1 ? '8px' : 0,
                      }}>
                        {line}
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Tool calls */}
                {msg.toolCalls && msg.toolCalls.length > 0 && (
                  <div>
                    {msg.toolCalls.map((tool, index) => (
                      <ToolCallDisplay 
                        key={index} 
                        toolName={tool.name} 
                        input={tool.input} 
                      />
                    ))}
                  </div>
                )}
              </div>
              
              {/* Message timestamp */}
              <Typography.Text type="secondary" style={{ 
                fontSize: '11px', 
                display: 'block', 
                marginTop: '4px',
                textAlign: msg.sender === 'user' ? 'right' : 'left'
              }}>
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Typography.Text>
            </motion.div>
          ))}
          
          {/* Thinking indicator */}
          {isAgentThinking && (
            <div
              style={{
                alignSelf: 'flex-start',
                backgroundColor: '#f0f0f0',
                padding: '8px 12px',
                borderRadius: '18px',
                marginBottom: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <LoadingOutlined style={{ fontSize: '14px', color: '#1677ff' }} />
              <span>Thinking{thinkingDots}</span>
            </div>
          )}
          
          <div ref={chatEndRef} />
        </div>

        {/* Chat Input */}
        <div style={{ 
          padding: '16px', 
          borderTop: '1px solid #f0f0f0',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          {/* Agent Status */}
          <Typography.Text type="secondary" style={{ 
            fontSize: '12px', 
            fontStyle: 'italic',
            color: agentStatus.includes('thinking') ? '#faad14' : 
                  agentStatus.includes('Error') ? '#ff4d4f' : 
                  agentStatus === 'Connected' ? '#52c41a' : '#666'
          }}>
            {agentStatus}
          </Typography.Text>
          
          {/* Input and Send Button */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <Input
              placeholder="Type a message..."
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              onPressEnter={handleSendMessage}
              style={{ flex: 1 }}
              disabled={agentStatus.includes('thinking')}
            />
            <Button
              type="primary"
              icon={<SendOutlined />}
              onClick={handleSendMessage}
              disabled={!chatInput.trim() || agentStatus.includes('thinking')}
            />
          </div>
        </div>
      </motion.div>
    </PageLayout>
  )
}