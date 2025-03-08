import {
  LandingContainer,
  LandingCTA,
  LandingFAQ,
  LandingFeatures,
  LandingHero,
  LandingHowItWorks,
  LandingPainPoints,
  LandingPricing,
  LandingSocialProof,
  LandingSocialRating,
  LandingTestimonials,
} from '~/designSystem'

export default function LandingPage() {
  const features = [
    {
      heading: `Smart Task Management`,
      description: `Organize and prioritize tasks with intuitive drag-and-drop interfaces and automated workflows.`,
      icon: <i className="las la-tasks"></i>,
    },
    {
      heading: `Real-Time Collaboration`,
      description: `Keep your team aligned with instant updates, comments, and file sharing in one central hub.`,
      icon: <i className="las la-users"></i>,
    },
    {
      heading: `Progress Tracking`,
      description: `Get a clear view of project status with visual dashboards, timelines and progress indicators.`,
      icon: <i className="las la-chart-line"></i>,
    },
    {
      heading: `Deadline Management`,
      description: `Never miss a deadline with automated reminders and calendar integrations.`,
      icon: <i className="las la-calendar-check"></i>,
    },
    {
      heading: `Resource Planning`,
      description: `Optimize team workload and resource allocation with capacity planning tools.`,
      icon: <i className="las la-balance-scale"></i>,
    },
    {
      heading: `Performance Analytics`,
      description: `Make data-driven decisions with detailed project analytics and team performance metrics.`,
      icon: <i className="las la-chart-bar"></i>,
    },
  ]

  const testimonials = [
    {
      name: `Sarah Chen`,
      designation: `Product Manager at TechFlow`,
      content: `Since implementing this platform, our team productivity increased by 45%. Tasks that used to fall through the cracks are now completed on time.`,
      avatar: 'https://randomuser.me/api/portraits/women/6.jpg',
    },
    {
      name: `Mark Thompson`,
      designation: `CEO at GrowthLabs`,
      content: `The visibility this tool provides has transformed how we manage projects. We've cut meeting time by 60% and improved delivery times.`,
      avatar: 'https://randomuser.me/api/portraits/men/7.jpg',
    },
    {
      name: `Lisa Rodriguez`,
      designation: `Team Lead at InnovateCo`,
      content: `Finally, a project management tool that's both powerful and easy to use. Our team adopted it within days, not weeks.`,
      avatar: 'https://randomuser.me/api/portraits/women/27.jpg',
    },
  ]

  const navItems = [
    {
      title: `Features`,
      link: `#features`,
    },
    {
      title: `Pricing`,
      link: `#pricing`,
    },
    {
      title: `FAQ`,
      link: `#faq`,
    },
  ]

  const packages = [
    {
      title: `Starter`,
      description: `Perfect for small teams getting started`,
      monthly: 29,
      yearly: 290,
      features: [
        `Up to 10 team members`,
        `Basic task management`,
        `File sharing`,
        `Email support`,
      ],
    },
    {
      title: `Professional`,
      description: `Ideal for growing businesses`,
      monthly: 79,
      yearly: 790,
      features: [
        `Up to 50 team members`,
        `Advanced workflows`,
        `Analytics dashboard`,
        `Priority support`,
      ],
      highlight: true,
    },
    {
      title: `Enterprise`,
      description: `For large organizations`,
      monthly: 199,
      yearly: 1990,
      features: [
        `Unlimited team members`,
        `Custom integrations`,
        `Dedicated success manager`,
        `24/7 support`,
      ],
    },
  ]

  const questionAnswers = [
    {
      question: `How quickly can we get started?`,
      answer: `You can be up and running in minutes. Our intuitive interface requires minimal training, and we provide comprehensive onboarding resources.`,
    },
    {
      question: `Can I integrate with other tools?`,
      answer: `Yes, we integrate seamlessly with popular tools like Slack, Google Workspace, and Microsoft Office 365.`,
    },
    {
      question: `What kind of support do you offer?`,
      answer: `We provide email support for all plans, with priority support and dedicated success managers for higher tiers.`,
    },
    {
      question: `Is my data secure?`,
      answer: `We use enterprise-grade encryption and regular security audits to ensure your data is always protected.`,
    },
  ]

  const steps = [
    {
      heading: `Sign Up`,
      description: `Create your account in minutes and invite your team members.`,
    },
    {
      heading: `Import Projects`,
      description: `Easily import existing projects or start fresh with our templates.`,
    },
    {
      heading: `Customize Workflow`,
      description: `Set up workflows that match your team's unique processes.`,
    },
    {
      heading: `Track Progress`,
      description: `Monitor progress and celebrate team achievements.`,
    },
  ]

  const painPoints = [
    {
      emoji: `😫`,
      title: `Drowning in endless email threads and scattered communications`,
    },
    {
      emoji: `😤`,
      title: `Missing deadlines due to poor task visibility`,
    },
    {
      emoji: `😩`,
      title: `Wasting time in unnecessary status update meetings`,
    },
  ]

  return (
    <LandingContainer navItems={navItems}>
      <LandingHero
        title={`Transform Chaos into Clarity: Manage Projects Like a Pro`}
        subtitle={`Stop losing 9.3 hours per week searching for information. Start delivering projects on time with our intuitive project management platform.`}
        buttonText={`Start Free Trial`}
        pictureUrl={undefined}
        socialProof={
          <LandingSocialRating
            numberOfUsers={10000}
            suffixText={`from happy teams`}
          />
        }
      />
      <LandingSocialProof title={`Trusted by Industry Leaders`} />
      <LandingPainPoints
        title={`Teams waste 28% of their workweek on unproductive tasks - Sound familiar?`}
        painPoints={painPoints}
      />
      <LandingHowItWorks
        title={`Your Journey to Project Success`}
        steps={steps}
      />
      <LandingFeatures
        id="features"
        title={`Everything You Need to Take Control of Your Projects`}
        subtitle={`Powerful features that transform how your team works`}
        features={features}
      />
      <LandingTestimonials
        title={`Success Stories from Teams Like Yours`}
        subtitle={`Join thousands of teams who've revolutionized their project management`}
        testimonials={testimonials}
      />
      <LandingPricing
        id="pricing"
        title={`Invest in Your Team's Productivity`}
        subtitle={`Choose the plan that fits your team's needs`}
        packages={packages}
      />
      <LandingFAQ
        id="faq"
        title={`Common Questions`}
        subtitle={`Everything you need to know about getting started`}
        questionAnswers={questionAnswers}
      />
      <LandingCTA
        title={`Ready to Transform Your Project Management?`}
        subtitle={`Join 10,000+ teams already delivering better projects`}
        buttonText={`Start Free Trial`}
        buttonLink={`/register`}
      />
    </LandingContainer>
  )
}
