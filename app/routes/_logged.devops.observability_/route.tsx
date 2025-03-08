import { Card, Col, Row, Select, Table, Tabs, Tag, Typography, Alert, Button, Space, Badge, Progress, message } from 'antd'
import { useState, useEffect } from 'react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, BarChart, Bar, PieChart, Pie, Cell } from 'recharts'
import { InfoCircleOutlined, WarningOutlined, ClockCircleOutlined, CheckCircleOutlined } from '@ant-design/icons'

const { Title, Text, Paragraph } = Typography
const { TabPane } = Tabs
const { Option } = Select

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
                      <Button size="small" type="primary">View Details</Button>
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
    </div>
  )
}