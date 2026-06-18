'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import { Button } from '@/components/ui/button'

const plans = [
  {
    name: 'Starter',
    price: 'Free',
    description: 'Perfect for beginners',
    features: [
      'Basic AI Tutor access',
      '5 vocabulary lessons/month',
      'Limited grammar exercises',
      'Monthly progress report',
    ],
    cta: 'Get Started',
    highlighted: false,
  },
  {
    name: 'Pro',
    price: '$9.99',
    period: '/month',
    description: 'For serious learners',
    features: [
      'Unlimited AI Tutor sessions',
      'Unlimited vocabulary lessons',
      'Full Grammar Lab access',
      'Advanced writing assistant',
      'Speaking practice with feedback',
      'Weekly progress analytics',
      'Priority support',
    ],
    cta: 'Start Free Trial',
    highlighted: true,
  },
  {
    name: 'Premium',
    price: '$19.99',
    period: '/month',
    description: 'For fluency mastery',
    features: [
      'All Pro features',
      '1-on-1 tutor sessions',
      'Custom learning plans',
      'Certification programs',
      'Real-time conversation practice',
      'Daily progress tracking',
      '24/7 priority support',
      'Ad-free experience',
    ],
    cta: 'Start Free Trial',
    highlighted: false,
  },
]

export function Pricing() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  }

  return (
    <section id="pricing" className="py-20 sm:py-32 px-4 sm:px-6 lg:px-8 bg-muted/30">
      <div className="max-w-7xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={containerVariants}
        >
          <motion.h2 variants={itemVariants} className="text-4xl sm:text-5xl font-bold mb-4">
            Simple, Transparent Pricing
          </motion.h2>
          <motion.p variants={itemVariants} className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Choose the perfect plan for your learning journey
          </motion.p>
        </motion.div>

        <motion.div
          className="grid md:grid-cols-3 gap-8 lg:gap-6"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={containerVariants}
        >
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className={`relative rounded-2xl p-8 transition-all duration-300 ${
                plan.highlighted
                  ? 'border-2 border-primary bg-gradient-to-br from-primary/5 to-purple-500/5 shadow-xl'
                  : 'border border-border/40 bg-card hover:border-primary/30'
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-bold rounded-full">
                  Most Popular
                </div>
              )}

              <div className="mb-8">
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <p className="text-muted-foreground mb-4">{plan.description}</p>
                <div className="flex items-baseline">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  {plan.period && <span className="text-muted-foreground ml-2">{plan.period}</span>}
                </div>
              </div>

              <Button
                asChild
                className="w-full mb-8"
                variant={plan.highlighted ? 'default' : 'outline'}
              >
                <Link href="/dashboard">{plan.cta}</Link>
              </Button>

              <ul className="space-y-4">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
