import { Card, Col, Row, Select, Table, Tabs, Tag, Typography, Alert, Button, Space, Badge, Progress, message, Avatar, Input, Collapse } from 'antd'
import { useState, useEffect, useRef } from 'react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, BarChart, Bar, PieChart, Pie, Cell } from 'recharts'
import { InfoCircleOutlined, WarningOutlined, ClockCircleOutlined, CheckCircleOutlined, RobotOutlined, SendOutlined } from '@ant-design/icons'
import { motion } from 'framer-motion'

const { Title, Text, Paragraph } = Typography
const { TabPane } = Tabs
const { Option } = Select

// Define chat message interface
interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  isLog?: boolean;
  logDetails?: any[];
  requiresInput?: boolean;
  inputType?: string;
}

// Mock log data
const generateMockLogs = (system, count = 50) => {
  const logLevels = ['INFO', 'WARN', 'ERROR', 'DEBUG']
  const logMessages = {
    backend: [
      'Server started successfully',
      'Processing API request',
      'Database connection established',
      'Invalid auth token detected',
      'User authentication failed',
      'Request processed successfully',
      'Failed to process request',
      'Memory usage high',
      'Cache miss',
      'Slow query detected'
    ],
    database: [
      'Query executed in 120ms',
      'Connection pool at 80% capacity',
      'Index rebuild completed',
      'Deadlock detected and resolved',
      'Slow query log entry added',
      'Table scan performed',
      'Transaction rolled back',
      'Foreign key constraint violation',
      'Backup operation completed',
      'Database storage at 75% capacity'
    ],
    frontend: [
      'Page loaded in 1.2s',
      'API call failed with status 500',
      'User session expired',
      'Form validation error',
      'DOM rendering complete',
      'Redux state updated',
      'WebSocket connection lost',
      'Image optimization failed',
      'Asset bundle size exceeds threshold',
      'Client-side caching enabled'
    ]
  }

  const timestamp = new Date()
  const logs = []

  for (let i = 0; i < count; i++) {
    const level = logLevels[Math.floor(Math.random() * logLevels.length)]
    const message = logMessages[system][Math.floor(Math.random() * logMessages[system].length)]
    const id = `log-${system}-${i}`
    
    // Adjust timestamp to create a chronological log
    timestamp.setSeconds(timestamp.getSeconds() - Math.floor(Math.random() * 30))
    
    logs.push({
      id,
      timestamp: new Date(timestamp).toISOString(),
      level,
      system,
      message,
      details: `Thread ID: ${Math.floor(Math.random() * 1000)}, Request ID: ${Math.random().toString(36).substring(2, 10)}`
    })
  }

  return logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
}

// Generate mock performance data for charts
const generatePerformanceData = (hours = 24) => {
  const data = []
  const now = new Date()
  
  for (let i = 0; i < hours; i++) {
    const time = new Date(now)
    time.setHours(time.getHours() - (hours - i))
    
    const baseValue = 40 + Math.random() * 20
    const cpuSpike = i === 18 ? 30 : 0 // Create an anomaly
    
    data.push({
      time: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      cpu: Math.min(95, baseValue + cpuSpike + Math.random() * 10),
      memory: baseValue - 10 + Math.random() * 15,
      diskIO: 20 + Math.random() * 15,
      networkIn: 15 + Math.random() * 25,
      networkOut: 10 + Math.random() * 20,
      errorRate: i === 18 ? 8.5 : Math.random() * 2, // Spike in errors
      responseTime: 100 + Math.random() * 50 + (i === 18 ? 150 : 0) // Response time spike
    })
  }
  
  return data
}

// Generate mock alerts
const generateMockAlerts = () => {
  return [
    {
      id: 'alert-1',
      severity: 'high',
      timestamp: new Date(new Date().setMinutes(new Date().getMinutes() - 12)).toISOString(),
      message: 'CPU utilization exceeded 90% for more than 5 minutes',
      service: 'Backend API',
      status: 'active',
      recommendation: 'Check for runaway processes or scale up the service'
    },
    {
      id: 'alert-2',
      severity: 'medium',
      timestamp: new Date(new Date().setHours(new Date().getHours() - 1)).toISOString(),
      message: 'Database connection pool near capacity',
      service: 'PostgreSQL Database',
      status: 'active',
      recommendation: 'Increase connection pool size or optimize connection usage'
    },
    {
      id: 'alert-3',
      severity: 'low',
      timestamp: new Date(new Date().setHours(new Date().getHours() - 3)).toISOString(),
      message: 'Increased 404 responses detected',
      service: 'Frontend',
      status: 'resolved',
      recommendation: 'Check for broken links or recent route changes'
    },
    {
      id: 'alert-4',
      severity: 'critical',
      timestamp: new Date(new Date().setMinutes(new Date().getMinutes() - 5)).toISOString(),
      message: 'Memory leak detected in containerized service',
      service: 'User Authentication Service',
      status: 'active',
      recommendation: 'Restart affected containers and review recent code changes'
    }
  ]
}

export default function ObservabilityDashboard() {
  const [activeTab, setActiveTab] = useState('logs')
  const [selectedSystem, setSelectedSystem] = useState('backend')
  const [logData, setLogData] = useState([])
  const [performanceData, setPerformanceData] = useState([])
  const [alerts, setAlerts] = useState([])
  const [timeRange, setTimeRange] = useState('24h')
  const [deploymentId, setDeploymentId] = useState<string>('')
  
  // Chat state
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [chatInput, setChatInput] = useState('')
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const chatEndRef = useRef<HTMLDivElement>(null)

  // Scroll to bottom of chat when messages change
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [chatMessages])

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

  const addBotMessage = (text: string, isLog: boolean = false, logDetails?: any[], requiresInput: boolean = false, inputType?: string) => {
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

  const handleSendMessage = () => {
    if (!chatInput.trim()) return
    
    addUserMessage(chatInput)
    
    // Find the most recent alert mentioned in the chat
    const lastBotMessage = [...chatMessages].reverse().find(msg => 
      msg.sender === 'bot' && msg.text.includes('alert:')
    )
    
    // Extract alert details from the last bot message
    const alertDetails = lastBotMessage?.text.match(/with the (\w+) alert: "([^"]+)"/)
    
    if (chatInput.toLowerCase().includes('resolve') || 
        chatInput.toLowerCase().includes('fix') || 
        chatInput.toLowerCase().includes('handle')) {
      
      if (alertDetails) {
        const [_, severity, message] = alertDetails
        
        // Find the corresponding alert from our alerts state
        const alert = alerts.find(a => 
          a.severity === severity.toLowerCase() && 
          a.message === message
        )
        
        if (alert) {
          setTimeout(() => {
            // First, acknowledge the request
            addBotMessage("I'll help you analyze and resolve this alert. Let me break down the problem and suggest solutions.")
            
            setTimeout(() => {
              // Send analysis based on alert type
              if (alert.message.includes('CPU utilization')) {
                // First message - Analyzing logs
                addBotMessage(`Analyzing system logs for the CPU utilization spike...`);
                
                setTimeout(() => {
                  // Second message - Checking inbound network calls
                  addBotMessage(`Checking inbound network traffic patterns...`);
                  
                  setTimeout(() => {
                    // Third message - Tracking IPs
                    addBotMessage(`Tracking IP addresses with unusual activity patterns...`);
                    
                    setTimeout(() => {
                      // Fourth message - DDOS alert with button
                      addBotMessage(`⚠️ Alert: Detected potential DDoS attack pattern!
                      
Analysis shows:
- Multiple requests from similar IP ranges
- Abnormal traffic spike (10x normal load)
- Request pattern indicates automated behavior

Would you like me to implement rate limiting to mitigate this attack?`, false, undefined, true, 'button');
                    }, 2000);
                  }, 2000);
                }, 2000);
              } else if (alert.message.includes('connection pool')) {
                addBotMessage(`
Here's my analysis of the database connection pool alert:

1. Root Cause Analysis:
   - Connection pool approaching maximum capacity
   - Possible causes:
     * Connection leaks in application code
     * Inefficient connection management
     * Sudden increase in user traffic
     * Long-running queries holding connections

2. Immediate Actions:
   - Monitor active database connections
   - Check for long-running transactions
   - Review connection timeout settings
   - Consider increasing pool size temporarily

3. Long-term Solutions:
   - Implement connection pooling best practices
   - Add connection leak detection
   - Optimize query patterns
   - Consider read replicas for load distribution

Would you like me to provide more details about any of these solutions?`)
              } else if (alert.message.includes('404 responses')) {
                addBotMessage(`
Here's my analysis of the increased 404 responses:

1. Root Cause Analysis:
   - Spike in "Not Found" responses
   - Possible causes:
     * Recent deployment with broken links
     * Misconfigured routes
     * Cache invalidation issues
     * Client-side routing problems

2. Immediate Actions:
   - Review recent deployments
   - Check server access logs
   - Verify routing configuration
   - Monitor user reports

3. Long-term Solutions:
   - Implement automated link checking
   - Add route testing in CI/CD
   - Improve deployment rollback procedures
   - Set up better monitoring for 4xx errors

Would you like me to explain any of these points in more detail?`)
              } else if (alert.message.includes('Memory leak')) {
                addBotMessage(`
Here's my analysis of the memory leak alert:

1. Root Cause Analysis:
   - Memory usage continuously increasing
   - Possible causes:
     * Unbounded caching
     * Unclosed resources or connections
     * Event listener accumulation
     * Large object retention

2. Immediate Actions:
   - Take heap dumps for analysis
   - Restart affected containers
   - Monitor memory usage patterns
   - Review recent code changes

3. Long-term Solutions:
   - Implement memory profiling
   - Add automated memory monitoring
   - Review garbage collection settings
   - Set up container resource limits

Would you like me to dive deeper into any of these areas?`)
              } else {
                addBotMessage(`
Here's my general analysis for this alert:

1. Root Cause Analysis:
   - Review service logs and metrics
   - Check for correlated events
   - Analyze recent changes
   - Monitor system resources

2. Immediate Actions:
   - Assess impact on service
   - Review related components
   - Check system health
   - Document findings

3. Long-term Solutions:
   - Implement better monitoring
   - Review alert thresholds
   - Update runbooks
   - Plan preventive measures

Would you like me to provide more specific details?`)
              }
            }, 1000)
          }, 500)
        } else {
          addBotMessage("I'm here to help you understand and resolve any alerts. Could you please specify which alert you're asking about?")
        }
      } else {
        addBotMessage("I'm here to help you understand and resolve any alerts. Could you please specify which alert you're asking about?")
      }
    } else {
      // Generic response for other queries
      setTimeout(() => {
        addBotMessage("I'm here to help you understand and resolve any alerts. What would you like to know?")
      }, 1000)
    }
    
    setChatInput('')
  }

  const toggleChat = () => {
    setIsChatOpen(prev => !prev)
    if (!isChatOpen && chatMessages.length === 0) {
      // Add welcome message when opening chat for the first time
      setTimeout(() => {
        addBotMessage("Hello! I'm your alerts assistant. How can I help you understand and resolve any alerts today?")
      }, 500)
    }
  }

  // Check for deployment ID in localStorage
  useEffect(() => {
    try {
      const lastDeploymentId = localStorage.getItem('lastDeploymentId')
      if (lastDeploymentId) {
        setDeploymentId(lastDeploymentId)
        // Show logs tab by default when viewing a deployment
        setActiveTab('logs')
        // Show a welcome notification
        message.success(`Viewing logs for deployment: ${lastDeploymentId.substring(0, 8)}`, 3)
      }
    } catch (error) {
      console.error('Failed to retrieve deployment ID', error)
    }
  }, [])
  
  useEffect(() => {
    // Load initial data
    setLogData(generateMockLogs(selectedSystem))
    setPerformanceData(generatePerformanceData())
    setAlerts(generateMockAlerts())
    
    // Update logs periodically to simulate real-time
    const logInterval = setInterval(() => {
      setLogData(prevLogs => {
        const newLog = {
          id: `log-${selectedSystem}-${Date.now()}`,
          timestamp: new Date().toISOString(),
          level: Math.random() > 0.8 ? 'WARN' : (Math.random() > 0.95 ? 'ERROR' : 'INFO'),
          system: selectedSystem,
          message: `New ${selectedSystem} activity recorded`,
          details: `Thread ID: ${Math.floor(Math.random() * 1000)}, Request ID: ${Math.random().toString(36).substring(2, 10)}`
        }
        return [newLog, ...prevLogs.slice(0, 49)]
      })
    }, 10000)
    
    // Occasionally add a new alert
    const alertInterval = setInterval(() => {
      if (Math.random() > 0.7) {
        const newAlert = {
          id: `alert-${Date.now()}`,
          severity: Math.random() > 0.8 ? 'high' : (Math.random() > 0.5 ? 'medium' : 'low'),
          timestamp: new Date().toISOString(),
          message: `Anomaly detected in ${selectedSystem} performance metrics`,
          service: selectedSystem === 'backend' ? 'API Service' : 
                  (selectedSystem === 'database' ? 'Database Cluster' : 'Web Client'),
          status: 'active',
          recommendation: 'Investigate recent changes and monitor system resources'
        }
        setAlerts(prev => [newAlert, ...prev])
      }
    }, 60000)
    
    return () => {
      clearInterval(logInterval)
      clearInterval(alertInterval)
    }
  }, [selectedSystem])
  
  // Handle system change
  const handleSystemChange = (system) => {
    setSelectedSystem(system)
    setLogData(generateMockLogs(system))
  }
  
  // Handle time range change
  const handleTimeRangeChange = (range) => {
    setTimeRange(range)
    const hours = range === '1h' ? 1 : (range === '6h' ? 6 : (range === '12h' ? 12 : 24))
    setPerformanceData(generatePerformanceData(hours))
  }
  
  // Logic for log level colors
  const getLogLevelColor = (level) => {
    switch (level) {
      case 'ERROR': return 'red'
      case 'WARN': return 'orange'
      case 'INFO': return 'blue'
      case 'DEBUG': return 'green'
      default: return 'default'
    }
  }
  
  // Logic for alert severity colors
  const getAlertSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'red'
      case 'high': return 'orange'
      case 'medium': return 'gold'
      case 'low': return 'blue'
      default: return 'default'
    }
  }
  
  // Component for system health status
  const SystemHealthStatus = () => {
    const systems = [
      { name: 'Backend API', health: 85 },
      { name: 'Database Cluster', health: 92 },
      { name: 'Frontend Client', health: 98 },
      { name: 'Authentication Service', health: 75 },
      { name: 'Storage Service', health: 89 }
    ]
    
    return (
      <Card title="System Health" style={{ marginBottom: '20px' }}>
        <Row gutter={[16, 16]}>
          {systems.map((system, index) => (
            <Col span={8} key={index}>
              <Card size="small">
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Text strong>{system.name}</Text>
                  <Progress 
                    percent={system.health} 
                    status={system.health < 80 ? 'exception' : 'normal'}
                    strokeColor={system.health > 90 ? '#52c41a' : (system.health > 80 ? '#1677ff' : '#fa8c16')}
                  />
                  <Text type={system.health < 80 ? 'warning' : 'secondary'}>
                    {system.health < 80 ? 'Requires attention' : (system.health > 90 ? 'Healthy' : 'Normal')}
                  </Text>
                </Space>
              </Card>
            </Col>
          ))}
        </Row>
      </Card>
    )
  }
  
  // Mock data for pie chart
  const errorDistribution = [
    { name: 'API Errors', value: 42 },
    { name: 'Database Errors', value: 28 },
    { name: 'Authentication Errors', value: 15 },
    { name: 'Client Errors', value: 10 },
    { name: 'Network Errors', value: 5 }
  ]
  
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8']
  
  return (
    <div style={{ padding: '20px', height: '100vh', overflow: 'auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <Title level={2}>DevOps Observability Dashboard</Title>
        {deploymentId && (
          <Alert
            type="info"
            showIcon
            message={
              <Space>
                <span>Viewing Deployment:</span>
                <Tag color="blue">{deploymentId.substring(0, 8)}</Tag>
                <Button size="small" onClick={() => localStorage.removeItem('lastDeploymentId')}>
                  Clear
                </Button>
              </Space>
            }
          />
        )}
      </div>
      
      <SystemHealthStatus />
      
      <Row gutter={[16, 16]} style={{ marginBottom: '20px' }}>
        <Col span={12}>
          <Card title="CPU Requests, Limits and Usage" size="small">
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="cpu" stroke="#8884d8" fill="#8884d8" name="CPU Usage" />
                <Area type="monotone" dataKey="cpu" stroke="#82ca9d" fill="transparent" strokeDasharray="5 5" name="CPU Requests" />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        
        <Col span={12}>
          <Card title="Memory Requests, Limits and Usage" size="small">
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="memory" stroke="#82ca9d" fill="#82ca9d" name="Memory Used" />
                <Area type="monotone" dataKey="memory" stroke="#ffc658" fill="transparent" strokeDasharray="5 5" name="Memory Requests" />
                <Area type="monotone" dataKey="memory" stroke="#ff7300" fill="transparent" strokeDasharray="3 3" name="Memory Limits" stackId="1" />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        
        <Col span={12}>
          <Card title="Network Rate" size="small">
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="networkIn" stroke="#8884d8" name="Bytes Received" />
                <Line type="monotone" dataKey="networkOut" stroke="#82ca9d" name="Bytes Transmitted" />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        
        <Col span={12}>
          <Card title="Container States" size="small">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={performanceData.map(item => ({
                ...item,
                running: 1,
                terminated: 0,
                waiting: 0
              }))}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="running" stackId="a" fill="#52c41a" name="Running" />
                <Bar dataKey="terminated" stackId="a" fill="#ff4d4f" name="Terminated" />
                <Bar dataKey="waiting" stackId="a" fill="#faad14" name="Waiting" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>
      
      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane tab="Logs" key="logs">
          <Row gutter={[16, 16]}>
            <Col span={24}>
              <Card 
                title="System Logs" 
                extra={
                  <Select value={selectedSystem} onChange={handleSystemChange} style={{ width: 150 }}>
                    <Option value="backend">Backend</Option>
                    <Option value="database">Database</Option>
                    <Option value="frontend">Frontend</Option>
                  </Select>
                }
              >
                <Table 
                  dataSource={logData} 
                  rowKey="id"
                  pagination={{ pageSize: 10 }}
                  columns={[
                    {
                      title: 'Timestamp',
                      dataIndex: 'timestamp',
                      key: 'timestamp',
                      render: text => new Date(text).toLocaleString(),
                      width: 180
                    },
                    {
                      title: 'Level',
                      dataIndex: 'level',
                      key: 'level',
                      render: text => <Tag color={getLogLevelColor(text)}>{text}</Tag>,
                      width: 100,
                      filters: [
                        { text: 'INFO', value: 'INFO' },
                        { text: 'WARN', value: 'WARN' },
                        { text: 'ERROR', value: 'ERROR' },
                        { text: 'DEBUG', value: 'DEBUG' }
                      ],
                      onFilter: (value, record) => record.level === value,
                    },
                    {
                      title: 'Message',
                      dataIndex: 'message',
                      key: 'message'
                    },
                    {
                      title: 'Details',
                      dataIndex: 'details',
                      key: 'details',
                      render: text => <Text type="secondary">{text}</Text>
                    }
                  ]}
                  expandable={{
                    expandedRowRender: record => (
                      <pre style={{ whiteSpace: 'pre-wrap' }}>
                        {JSON.stringify({
                          timestamp: record.timestamp,
                          level: record.level,
                          system: record.system,
                          message: record.message,
                          details: record.details,
                          context: {
                            thread: record.details.split(', ')[0].split(': ')[1],
                            requestId: record.details.split(', ')[1].split(': ')[1],
                            user: Math.random() > 0.5 ? 'authenticated' : 'anonymous',
                            source: record.system === 'backend' ? 'api-server' : 
                                    record.system === 'database' ? 'db-cluster' : 'web-client'
                          }
                        }, null, 2)}
                      </pre>
                    )
                  }}
                />
              </Card>
            </Col>
          </Row>
        </TabPane>
        
        <TabPane tab="Performance" key="performance">
          <Space direction="vertical" style={{ width: '100%' }}>
            <Card 
              title="System Performance Metrics" 
              extra={
                <Select value={timeRange} onChange={handleTimeRangeChange} style={{ width: 120 }}>
                  <Option value="1h">Last hour</Option>
                  <Option value="6h">Last 6 hours</Option>
                  <Option value="12h">Last 12 hours</Option>
                  <Option value="24h">Last 24 hours</Option>
                </Select>
              }
            >
              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <Card title="CPU & Memory Utilization" size="small">
                    <ResponsiveContainer width="100%" height={200}>
                      <AreaChart data={performanceData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="time" />
                        <YAxis />
                        <Tooltip />
                        <Area type="monotone" dataKey="cpu" stroke="#8884d8" fill="#8884d8" name="CPU %" />
                        <Area type="monotone" dataKey="memory" stroke="#82ca9d" fill="#82ca9d" name="Memory %" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </Card>
                </Col>
                
                <Col span={12}>
                  <Card title="Network I/O" size="small">
                    <ResponsiveContainer width="100%" height={200}>
                      <AreaChart data={performanceData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="time" />
                        <YAxis />
                        <Tooltip />
                        <Area type="monotone" dataKey="networkIn" stroke="#ffc658" fill="#ffc658" name="Network In (MB/s)" />
                        <Area type="monotone" dataKey="networkOut" stroke="#ff7300" fill="#ff7300" name="Network Out (MB/s)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </Card>
                </Col>
                
                <Col span={12}>
                  <Card title="Response Time (ms)" size="small">
                    <ResponsiveContainer width="100%" height={200}>
                      <LineChart data={performanceData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="time" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="responseTime" stroke="#8884d8" activeDot={{ r: 8 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </Card>
                </Col>
                
                <Col span={12}>
                  <Card title="Error Rate (%)" size="small">
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={performanceData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="time" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="errorRate" fill="#ff4d4f" />
                      </BarChart>
                    </ResponsiveContainer>
                  </Card>
                </Col>
              </Row>
            </Card>
          </Space>
        </TabPane>
        
        <TabPane tab="Alerts" key="alerts">
          <Card title="All Alerts">
            <Table 
              dataSource={alerts} 
              rowKey="id"
              columns={[
                {
                  title: 'Severity',
                  dataIndex: 'severity',
                  key: 'severity',
                  render: text => (
                    <Tag color={getAlertSeverityColor(text)} style={{ textTransform: 'capitalize' }}>
                      {text}
                    </Tag>
                  ),
                  filters: [
                    { text: 'Critical', value: 'critical' },
                    { text: 'High', value: 'high' },
                    { text: 'Medium', value: 'medium' },
                    { text: 'Low', value: 'low' }
                  ],
                  onFilter: (value, record) => record.severity === value,
                },
                {
                  title: 'Status',
                  dataIndex: 'status',
                  key: 'status',
                  render: status => (
                    <Badge 
                      status={status === 'active' ? 'error' : 'success'} 
                      text={status === 'active' ? 'Active' : 'Resolved'}
                    />
                  ),
                  filters: [
                    { text: 'Active', value: 'active' },
                    { text: 'Resolved', value: 'resolved' }
                  ],
                  onFilter: (value, record) => record.status === value,
                },
                {
                  title: 'Time',
                  dataIndex: 'timestamp',
                  key: 'timestamp',
                  render: text => new Date(text).toLocaleString(),
                  sorter: (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
                },
                {
                  title: 'Service',
                  dataIndex: 'service',
                  key: 'service'
                },
                {
                  title: 'Message',
                  dataIndex: 'message',
                  key: 'message'
                },
                {
                  title: 'Actions',
                  key: 'actions',
                  render: (_, record) => (
                    <Space>
                      <Button 
                        size="small" 
                        type="primary"
                        onClick={() => {
                          toggleChat();
                          setTimeout(() => {
                            addBotMessage(`Let me help you with the ${record.severity} alert: "${record.message}". What would you like to know about this alert?`);
                          }, 500);
                        }}
                      >
                        View Details
                      </Button>
                      {record.status === 'active' && (
                        <Button 
                          size="small"
                          onClick={() => {
                            setAlerts(alerts.map(alert => 
                              alert.id === record.id ? { ...alert, status: 'resolved' } : alert
                            ))
                          }}
                        >
                          Resolve
                        </Button>
                      )}
                    </Space>
                  )
                }
              ]}
              expandable={{
                expandedRowRender: record => (
                  <div>
                    <Paragraph strong>Recommended Action:</Paragraph>
                    <Paragraph>{record.recommendation}</Paragraph>
                  </div>
                )
              }}
            />
          </Card>
        </TabPane>
      </Tabs>

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
            <Typography.Title level={5} style={{ margin: 0 }}>Alerts Assistant</Typography.Title>
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
          overflowY: 'auto', 
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}>
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
                              {msg.logDetails.map((log, index) => (
                                <div key={index} style={{ marginBottom: '6px' }}>
                                  {JSON.stringify(log, null, 2)}
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
              
              {/* Message timestamp */}
              <Typography.Text type="secondary" style={{ 
                fontSize: '11px', 
                display: 'block', 
                marginTop: '4px',
                textAlign: msg.sender === 'user' ? 'right' : 'left'
              }}>
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Typography.Text>

              {/* Rate limit button */}
              {msg.requiresInput && msg.inputType === 'button' && (
                <div style={{
                  display: 'flex',
                  justifyContent: 'center',
                  width: '100%',
                  marginTop: '8px',
                  marginBottom: '8px'
                }}>
                  <Button
                    type="primary"
                    danger
                    size="large"
                    onClick={() => {
                      // Handle rate limit implementation
                      addBotMessage("✅ Rate limiting has been implemented successfully! I've configured the following measures:\n\n- Maximum 100 requests per minute per IP\n- IP-based request throttling enabled\n- Automatic blocking of suspicious traffic patterns\n\nThe system is now protected against DDoS attacks.");
                    }}
                    style={{
                      borderRadius: '8px',
                      padding: '0 20px',
                      height: '44px',
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)'
                    }}
                  >
                    Enable Rate Limiting
                  </Button>
                </div>
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
    </div>
  )
}