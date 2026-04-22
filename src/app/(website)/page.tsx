import ComplianceSplitCollapsedRight from '@/components/pages/home/compliance--split-collapsed-right';
import CtaColumnCentered from '@/components/pages/home/cta--column-centered';
import FeaturesSplit from '@/components/pages/home/features--split';
import HeroCover from '@/components/pages/home/hero--cover';
import SectionSplitMediaLeft from '@/components/pages/home/section-split--media-left';
import SectionSplitMediaRight from '@/components/pages/home/section-split--media-right';
import SectionTabsUnderlineEnhanced from '@/components/pages/home/section-tabs--underline-enhanced';
import { Button } from '@/components/ui/button';
import { getMetadata } from '@/lib/get-metadata';
import { ShieldCheck, TrendingUp, Users, Zap } from 'lucide-react';
import { Metadata } from 'next';
import NextLink from 'next/link';

const contentData = {
  'hero--cover': {
    actions: (
      <div className="flex w-full flex-col flex-wrap items-center gap-2.5 md:w-auto md:flex-row lg:flex-nowrap lg:gap-4 xl:gap-2.5 [&_a]:w-full [&_a]:md:w-auto">
        <Button variant="default" asChild>
          <NextLink href={'/placeholder'}>Request a demo</NextLink>
        </Button>{' '}
        <Button variant="secondary" asChild>
          <NextLink href={'/pricing'}>View pricing</NextLink>
        </Button>
      </div>
    ),
    command: 'npx create-prime@latest',
    description:
      'Reduce manual review by 80%, accelerate deal cycles, and ensure compliance with AI-powered contract intelligence.',
    image: {
      alt: 'AI platform cover image',
      height: 684,
      src: '/images/cover-5.jpg',
      width: 1216,
    },
    title: 'Automate your contract workflows',
  },
  'features--split': {
    description:
      'Leading organizations choose our platform to transform their contract processes, gaining a competitive edge through speed, accuracy, and seamless collaboration.',
    items: [
      {
        description:
          'Close deals faster with automated contract generation and approval workflows.',
        lucideIcon: <Zap />,
        title: 'Accelerate deal cycles',
      },
      {
        description:
          'Minimize risk with built-in regulatory checks and audit trails for every contract.',
        lucideIcon: <ShieldCheck />,
        title: 'Ensure ironclad compliance',
      },
      {
        description: 'Bring legal, sales, and finance teams onto a single, collaborative platform.',
        lucideIcon: <Users />,
        title: 'Unify your legal ops',
      },
      {
        description:
          'Leverage data analytics to identify trends and optimize contract performance.',
        lucideIcon: <TrendingUp />,
        title: 'Gain actionable insights',
      },
    ],
    label: 'Why teams switch',
    title: 'Unlock unparalleled efficiency and control',
  },
  'section-split--media-left': {
    actions: (
      <div className="mt-5 flex max-w-md flex-wrap items-center gap-x-2.5 gap-y-6 md:mt-6 lg:max-w-xl lg:flex-nowrap lg:gap-x-4">
        <Button variant="default" asChild>
          <NextLink href={'/placeholder'}>Request a demo</NextLink>
        </Button>{' '}
        <Button variant="secondary" asChild>
          <NextLink href={'/docs'}>See it in action</NextLink>
        </Button>
      </div>
    ),
    description:
      'Manual contract review is slow and error-prone. Our AI automates clause identification, risk scoring, and approval routing, cutting review time by 70%.',
    image: {
      alt: '',
      height: 544,
      src: '/images/cover-2.jpg',
      width: 544,
    },
    label: 'Core capability',
    title: 'Automate contract review and approval',
  },
  'section-split--media-right': {
    actions: (
      <div className="mt-5 flex max-w-md flex-wrap items-center gap-x-2.5 gap-y-6 md:mt-6 lg:max-w-xl lg:flex-nowrap lg:gap-x-4">
        <Button variant="default" asChild>
          <NextLink href={'/placeholder'}>Request a demo</NextLink>
        </Button>{' '}
        <Button variant="secondary" asChild>
          <NextLink href={'/docs'}>View documentation</NextLink>
        </Button>
      </div>
    ),
    description:
      'Eliminate inconsistencies and accelerate drafting. Our platform provides dynamic templates and guided workflows, ensuring every contract is compliant and on-brand from the start, reducing legal review cycles by 50%.',
    image: {
      alt: '',
      height: 544,
      src: '/images/cover-8.jpg',
      width: 544,
    },
    label: 'Core capability',
    title: 'Standardize contract creation for efficiency',
  },
  'section-split--media-left-2': {
    actions: (
      <div className="mt-5 flex max-w-md flex-wrap items-center gap-x-2.5 gap-y-6 md:mt-6 lg:max-w-xl lg:flex-nowrap lg:gap-x-4">
        <Button variant="default" asChild>
          <NextLink href={'/placeholder'}>Request a demo</NextLink>
        </Button>{' '}
        <Button variant="secondary" asChild>
          <NextLink href={'/docs'}>View documentation</NextLink>
        </Button>
      </div>
    ),
    description:
      'Centralize all contract data for actionable insights. Our platform unifies data, making it searchable, auditable, and ready for analysis. Transform reactive management into proactive strategy.',
    image: {
      alt: '',
      height: 544,
      src: '/images/cover-7.jpg',
      width: 544,
    },
    label: 'Core capability',
    title: 'Centralize contract data for actionable insights',
  },
  'section-tabs--underline-enhanced': {
    description:
      'Our platform ensures rapid deployment and intuitive use, quickly harnessing AI for contract management.',
    items: [
      {
        description:
          'Integrate with your existing CRM, ERP, and document management systems in minutes. Our secure connectors ensure seamless data flow and minimal disruption.',
        image: {
          alt: 'Intake stage',
          height: 684,
          src: '/images/cover-9.jpg',
          width: 1216,
        },
        key: 'connect',
        label: 'Connect',
      },
      {
        description:
          'Tailor AI models and workflow rules to match your specific contract types and business processes. No coding required, just intuitive drag-and-drop customization.',
        image: {
          alt: 'Build stage',
          height: 684,
          src: '/images/cover-2.jpg',
          width: 1216,
        },
        key: 'configure',
        label: 'Configure',
      },
      {
        description:
          'Automate contract generation, review, and approval. Monitor performance with real-time dashboards and continuously refine your processes for maximum efficiency.',
        image: {
          alt: 'Deploy stage',
          height: 684,
          src: '/images/cover-5.jpg',
          width: 1216,
        },
        key: 'optimize',
        label: 'Optimize',
      },
      {
        description:
          'Leverage advanced analytics to track contract performance, identify bottlenecks, and uncover opportunities for further optimization and strategic decision-making.',
        image: {
          alt: 'Review stage',
          height: 684,
          src: '/images/cover-3.jpg',
          width: 1216,
        },
        key: 'analyze',
        label: 'Analyze',
      },
    ],
    label: 'Your workflow',
    title: 'From setup to insights in 3 simple steps',
  },
  'compliance--split-collapsed-right': {
    badges: [
      {
        alt: 'SOC 2 Type II',
        height: 72,
        src: '/images/compliance-badges/soc2.svg',
        width: 72,
      },
      {
        alt: 'ISO 27001',
        height: 72,
        src: '/images/compliance-badges/iso-27001.svg',
        width: 72,
      },
      {
        alt: 'GDPR',
        height: 72,
        src: '/images/compliance-badges/gdpr.svg',
        width: 72,
      },
      {
        alt: 'ISO 42001',
        height: 72,
        src: '/images/compliance-badges/iso-42001.svg',
        width: 72,
      },
    ],
    description:
      'Our platform is engineered with robust security measures and operational excellence, ensuring your data is protected and accessible.',
    items: [
      {
        answer:
          'We employ end-to-end encryption, regular security audits, and adhere to industry best practices to protect your sensitive contract information.',
        question: 'How secure is our data?',
      },
      {
        answer:
          'We guarantee 99.9% uptime with redundant infrastructure and continuous monitoring, ensuring your operations are never interrupted.',
        question: "What is the platform's uptime guarantee?",
      },
      {
        answer:
          'Our dedicated onboarding team ensures a smooth setup, with most clients fully operational within days, not weeks.',
        question: 'How quickly can we get started?',
      },
      {
        answer:
          '24/7 premium support is available via chat, email, and phone, with dedicated account managers for enterprise clients.',
        question: 'What kind of support is available?',
      },
    ],
    title: 'Built for enterprise trust',
  },
  'cta--column-centered': {
    actions: (
      <div className="mt-5 flex flex-wrap items-center gap-x-2.5 gap-y-6 md:mt-6 md:justify-center lg:flex-nowrap lg:gap-x-4">
        <Button variant="default" asChild>
          <NextLink href={'/placeholder'}>Request a demo</NextLink>
        </Button>{' '}
        <Button variant="secondary" asChild>
          <NextLink href={'/pricing'}>View pricing</NextLink>
        </Button>
      </div>
    ),
    description:
      'Join leading organizations that have transformed their contract processes. Explore our documentation to learn more, or get started now.',
    title: 'Ready to transform your contract management?',
  },
};

const pageData = {
  pathname: '/',
  metadata: {
    title: 'Home',
    description: 'Build your next generation website with ease',
    pathname: '/',
  },
};

export const metadata: Metadata = getMetadata({
  title: pageData.metadata?.title,
  description: pageData.metadata?.description,
  pathname: pageData.pathname,
});

export default function HomePage() {
  return (
    <main className="pb-14 md:pb-16 lg:pb-16 xl:pb-24">
      <HeroCover {...contentData['hero--cover']} />
      <FeaturesSplit {...contentData['features--split']} />
      <SectionSplitMediaLeft {...contentData['section-split--media-left']} />
      <SectionSplitMediaRight {...contentData['section-split--media-right']} />
      <SectionSplitMediaLeft {...contentData['section-split--media-left-2']} />
      <SectionTabsUnderlineEnhanced {...contentData['section-tabs--underline-enhanced']} />
      <ComplianceSplitCollapsedRight {...contentData['compliance--split-collapsed-right']} />
      <CtaColumnCentered {...contentData['cta--column-centered']} />
    </main>
  );
}
