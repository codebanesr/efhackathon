import { Typography, Card, Space, Row, Col } from 'antd'
const { Title, Text } = Typography
import { useUserContext } from '@/core/context'
import dayjs from 'dayjs'
import { useLocation, useNavigate, useParams } from '@remix-run/react'
import { useUploadPublic } from '@/plugins/upload/client'
import { Api } from '@/core/trpc'
import { PageLayout } from '@/designSystem'

export default function HomePage() {
  const { user, organization } = useUserContext()

  return (
    <PageLayout layout="full-width">
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px' }}>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          {/* Welcome Section */}
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <Title level={1}>
              <i className="las la-home" style={{ marginRight: '12px' }}></i>
              Welcome to {organization?.name}
            </Title>
            <Text type="secondary">
              Your digital workspace for collaboration and productivity
            </Text>
          </div>

          {/* Info Cards */}
          <Row gutter={[24, 24]}>
            <Col xs={24} sm={12} lg={8}>
              <Card
                hoverable
                style={{ height: '100%' }}
                cover={
                  <div style={{ padding: '24px', textAlign: 'center' }}>
                    <i
                      className="las la-user"
                      style={{ fontSize: '48px', color: '#1890ff' }}
                    ></i>
                  </div>
                }
              >
                <Card.Meta
                  title="Your Profile"
                  description={
                    <Space direction="vertical">
                      <Text>Name: {user?.name}</Text>
                      <Text>Email: {user?.email}</Text>
                      <Text>
                        Member since:{' '}
                        {dayjs(user?.createdAt).format('MMMM D, YYYY')}
                      </Text>
                    </Space>
                  }
                />
              </Card>
            </Col>

            <Col xs={24} sm={12} lg={8}>
              <Card
                hoverable
                style={{ height: '100%' }}
                cover={
                  <div style={{ padding: '24px', textAlign: 'center' }}>
                    <i
                      className="las la-building"
                      style={{ fontSize: '48px', color: '#52c41a' }}
                    ></i>
                  </div>
                }
              >
                <Card.Meta
                  title="Organization Info"
                  description={
                    <Space direction="vertical">
                      <Text>Name: {organization?.name}</Text>
                      <Text>
                        Created:{' '}
                        {dayjs(organization?.createdAt).format('MMMM D, YYYY')}
                      </Text>
                    </Space>
                  }
                />
              </Card>
            </Col>

            <Col xs={24} sm={12} lg={8}>
              <Card
                hoverable
                style={{ height: '100%' }}
                cover={
                  <div style={{ padding: '24px', textAlign: 'center' }}>
                    <i
                      className="las la-rocket"
                      style={{ fontSize: '48px', color: '#722ed1' }}
                    ></i>
                  </div>
                }
              >
                <Card.Meta
                  title="Quick Actions"
                  description={
                    <Space direction="vertical">
                      <Text>
                        <i className="las la-check-circle"></i> View Dashboard
                      </Text>
                      <Text>
                        <i className="las la-users"></i> Team Members
                      </Text>
                      <Text>
                        <i className="las la-cog"></i> Settings
                      </Text>
                    </Space>
                  }
                />
              </Card>
            </Col>
          </Row>
        </Space>
      </div>
    </PageLayout>
  )
}
