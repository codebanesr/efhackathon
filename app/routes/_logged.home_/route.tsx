import { Typography, Row, Col, Card } from 'antd'
const { Title, Paragraph } = Typography
import { useUserContext } from '@/core/context'
import dayjs from 'dayjs'
import { useLocation, useNavigate, useParams } from '@remix-run/react'
import { useUploadPublic } from '@/plugins/upload/client'
import { Api } from '@/core/trpc'
import { PageLayout } from '@/designSystem'

export default function HomePage() {
  const { user } = useUserContext()

  return (
    <PageLayout layout="full-width">
      <Row justify="center" style={{ padding: '2rem' }}>
        <Col xs={24} sm={20} md={16} lg={14}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <Title level={1}>
              <i className="las la-home" style={{ marginRight: '0.5rem' }}></i>
              Welcome to Our Platform
            </Title>
            <Paragraph>
              Your one-stop solution for managing organizations and connecting
              with others
            </Paragraph>
          </div>

          <Card>
            <Row gutter={[16, 16]}>
              <Col xs={24} md={12}>
                <Card bordered={false}>
                  <i
                    className="las la-user-circle"
                    style={{ fontSize: '2rem', color: '#1890ff' }}
                  ></i>
                  <Title level={4}>Personal Space</Title>
                  <Paragraph>
                    {user ? (
                      <>Welcome back, {user.name || 'Guest'}!</>
                    ) : (
                      <>Sign in to access your personal dashboard</>
                    )}
                  </Paragraph>
                </Card>
              </Col>

              <Col xs={24} md={12}>
                <Card bordered={false}>
                  <i
                    className="las la-building"
                    style={{ fontSize: '2rem', color: '#52c41a' }}
                  ></i>
                  <Title level={4}>Organizations</Title>
                  <Paragraph>
                    Manage your organizations and collaborate with team members
                  </Paragraph>
                </Card>
              </Col>

              <Col xs={24} md={12}>
                <Card bordered={false}>
                  <i
                    className="las la-comments"
                    style={{ fontSize: '2rem', color: '#722ed1' }}
                  ></i>
                  <Title level={4}>Communication</Title>
                  <Paragraph>
                    Stay connected with your team through our integrated chat
                    system
                  </Paragraph>
                </Card>
              </Col>

              <Col xs={24} md={12}>
                <Card bordered={false}>
                  <i
                    className="las la-chart-line"
                    style={{ fontSize: '2rem', color: '#fa8c16' }}
                  ></i>
                  <Title level={4}>Analytics</Title>
                  <Paragraph>
                    Track your progress and monitor important metrics
                  </Paragraph>
                </Card>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
    </PageLayout>
  )
}
