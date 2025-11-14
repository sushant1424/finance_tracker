"use client";

import { motion } from "motion/react";
import { 
  PieChart, 
  TrendingUp, 
  Target, 
  Bell, 
  Shield, 
  Smartphone,
  Calendar,
  BarChart3,
  Repeat
} from "lucide-react";

const features = [
  {
    icon: PieChart,
    title: "Smart Budgeting",
    description: "Create custom budgets that adapt to your spending patterns and financial goals.",
    color: "from-blue-500 to-cyan-500"
  },
  {
    icon: TrendingUp,
    title: "Expense Tracking",
    description: "Automatically categorize transactions and track where your money goes.",
    color: "from-purple-500 to-pink-500"
  },
  {
    icon: Target,
    title: "Financial Goals",
    description: "Set and achieve your financial goals with personalized recommendations.",
    color: "from-green-500 to-emerald-500"
  },
  {
    icon: Bell,
    title: "Smart Alerts",
    description: "Get notified about bill due dates, unusual spending, and budget limits.",
    color: "from-orange-500 to-red-500"
  },
  {
    icon: BarChart3,
    title: "Detailed Reports",
    description: "Visualize your financial data with beautiful charts and insights.",
    color: "from-teal-500 to-cyan-500"
  },
  {
    icon: Repeat,
    title: "Recurring Transactions",
    description: "Automate recurring income and expenses for effortless tracking.",
    color: "from-violet-500 to-purple-500"
  }
];

export default function FeaturesSection() {
  return (
    <section id="features" className="py-24 bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4 max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent leading-tight">
            Everything you need to succeed
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl mx-auto">
            Powerful features to help you take control of your financial future
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="group"
              >
                <div className="bg-gradient-to-b from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 rounded-2xl p-8 border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 transition-all hover:shadow-xl">
                  <div className={`inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br ${feature.color} mb-6 group-hover:scale-110 transition-transform`}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
