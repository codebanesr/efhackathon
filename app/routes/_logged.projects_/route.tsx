import { PageLayout } from '@/designSystem/layouts/PageLayout'
import { Card, Typography, List, Button, Input, Form, Space, Divider, message, Alert, Spin } from 'antd'
import { useState, useEffect } from 'react'
import { FolderOutlined, PlusOutlined, DeleteOutlined, FolderOpenOutlined } from '@ant-design/icons'
import { Api } from '@/core/trpc'

// Add FileSystem Access API types
declare global {
  interface Window {
    showDirectoryPicker: () => Promise<any>
  }
}

export default function ProjectsPage() {
  const [form] = Form.useForm()
  const [editMode, setEditMode] = useState(false)
  const [selectedPath, setSelectedPath] = useState('')
  const [isFileApiSupported, setIsFileApiSupported] = useState(true)
  
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

  return (
    <PageLayout
      title="Projects"
      subtitle="Manage your local project paths"
    >
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
    </PageLayout>
  )
}