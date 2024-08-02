import React from "react";
import { motion } from "framer-motion";
import { FileText, Users, Cloud } from "lucide-react";
import { Link } from "react-router-dom";

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-100 relative overflow-hidden">
      <div className="absolute inset-0 z-0">
        <svg
          className="w-full h-full"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          <motion.path
            d="M0,0 L100,0 L100,100 L0,100 Z"
            fill="none"
            stroke="rgba(59, 130, 246, 0.1)"
            strokeWidth="0.5"
            initial={{ pathLength: 0, pathOffset: 1 }}
            animate={{ pathLength: 1, pathOffset: 0 }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatType: "loop",
              ease: "linear",
            }}
          />
        </svg>
      </div>

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex flex-col justify-between min-h-screen">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h1 className="text-6xl font-bold text-gray-900 mb-4">
            Welcome to DocNest
          </h1>
          <p className="text-2xl text-gray-700 mb-8">
            Create, edit, and collaborate on documents in real-time.
          </p>
          <Link to={"/docs"}>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="mt-12 bg-blue-600 text-white px-8 py-4 rounded-md text-lg font-semibold transition duration-300"
            >
              Get Started
            </motion.button>
          </Link>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <FeatureCard
            icon={<FileText size={32} />}
            title="Easy Document Creation"
            description="Create and edit documents with a user-friendly interface."
          />
          <FeatureCard
            icon={<Users size={32} />}
            title="Real-time Collaboration"
            description="Work together with your team in real-time, seeing changes instantly."
          />
          <FeatureCard
            icon={<Cloud size={32} />}
            title="Cloud Storage"
            description="Access your documents from anywhere, anytime with secure cloud storage."
          />
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="text-center"
        >
          <p className="text-xl text-gray-600">
            Join thousands of users who trust DocNest for their document needs.
          </p>
        </motion.div>
      </main>
    </div>
  );
};

const FeatureCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  description: string;
}> = ({ icon, title, description }) => (
  <motion.div
    whileHover={{ scale: 1.05 }}
    className="bg-white bg-opacity-80 p-6 rounded-lg shadow-md"
  >
    <div className="text-blue-500 mb-4">{icon}</div>
    <h3 className="text-xl font-semibold mb-2">{title}</h3>
    <p className="text-gray-600">{description}</p>
  </motion.div>
);

export default LandingPage;
