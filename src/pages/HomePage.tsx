import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { dataService } from '../services/dataService';
import { Series } from '../types';
import Carousel from '../components/Carousel';

const HomePage = () => {
  const [series, setSeries] = useState<Series[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load series data
  useEffect(() => {
    const loadSeries = async () => {
      try {
        setIsLoading(true);
        const data = await dataService.getSeries();
        setSeries(data);
      } catch (error) {
        console.error('Error loading series:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSeries();
  }, []);

  // Get top series for carousel (highest rated)
  const topSeries = series
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 5);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-midnight-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-manga-bg">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-br from-manga-bg via-manga-bg to-manga-card/50" />
        
        {/* Background Carousel */}
        <div className="absolute inset-0 opacity-30">
          <Carousel series={topSeries} />
        </div>
        
        {/* Hero Content */}
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-manga-text mb-6">
              Welcome to <span className="text-midnight-primary-500">ComiTe</span>
            </h1>
            <p className="text-lg md:text-xl text-manga-muted mb-8 max-w-2xl mx-auto">
              Discover and read your favorite manga, manhua, and webtoons in one place. 
              Track your progress, bookmark series, and never miss an update.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/"
                className="btn-primary text-lg px-8 py-4"
              >
                Browse Library
              </Link>
              <Link
                to="/login"
                className="btn-secondary text-lg px-8 py-4"
              >
                Sign In
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-manga-text mb-4">
              Why Choose ComiTe?
            </h2>
            <p className="text-lg text-manga-muted max-w-2xl mx-auto">
              Experience manga reading like never before with our intuitive platform
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Extensive Library",
                description: "Access thousands of manga, manhua, and webtoons from various genres and authors.",
                icon: "📚"
              },
              {
                title: "Smart Search",
                description: "Find exactly what you're looking for with our advanced search and filtering system.",
                icon: "🔍"
              },
              {
                title: "Personal Tracking",
                description: "Keep track of your reading progress, bookmarks, and personal ratings.",
                icon: "⭐"
              }
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                className="text-center p-6 bg-manga-card rounded-lg border border-manga-border"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-manga-text mb-2">
                  {feature.title}
                </h3>
                <p className="text-manga-muted">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
