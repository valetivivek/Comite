import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = [
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' },
  ];

  return (
    <footer className="bg-midnight-secondary-800 border-t border-midnight-secondary-700 mt-auto">
      <div className="container-spacing py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link 
              to="/" 
              className="text-3xl font-bold text-midnight-primary-500 hover:text-midnight-primary-400 transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-midnight-primary-500 focus:ring-offset-2 focus:ring-offset-midnight-secondary-800 rounded-lg px-2 py-1 -ml-2"
            >
              📚 ComiTe
            </Link>
            <p className="body-text mt-4 max-w-lg text-midnight-neutral-300">
              Your ultimate destination for reading comics, manga, and manhua. 
              Discover new stories, track your progress, and enjoy reading with our modern, 
              mobile-first platform designed for seamless comic reading.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="heading-4 mb-6 text-midnight-secondary-50">Quick Links</h3>
            <ul className="space-y-3">
              {footerLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-midnight-neutral-400 hover:text-midnight-primary-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-midnight-primary-500 focus:ring-offset-2 focus:ring-offset-midnight-secondary-800 rounded px-2 py-1 -ml-2"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="heading-4 mb-6 text-midnight-secondary-50">Legal</h3>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/legal/terms"
                  className="text-midnight-neutral-400 hover:text-midnight-primary-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-midnight-primary-500 focus:ring-offset-2 focus:ring-offset-midnight-secondary-800 rounded px-2 py-1 -ml-2"
                >
                  Terms of Use
                </Link>
              </li>
              <li>
                <Link
                  to="/legal/license"
                  className="text-midnight-neutral-400 hover:text-midnight-primary-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-midnight-primary-500 focus:ring-offset-2 focus:ring-offset-midnight-secondary-800 rounded px-2 py-1 -ml-2"
                >
                  License
                </Link>
              </li>
              <li>
                <Link
                  to="/legal/privacy"
                  className="text-midnight-neutral-400 hover:text-midnight-primary-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-midnight-primary-500 focus:ring-offset-2 focus:ring-offset-midnight-secondary-800 rounded px-2 py-1 -ml-2"
                >
                  Privacy
                </Link>
              </li>
              <li>
                <Link
                  to="/legal/dmca"
                  className="text-midnight-neutral-400 hover:text-midnight-primary-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-midnight-primary-500 focus:ring-offset-2 focus:ring-offset-midnight-secondary-800 rounded px-2 py-1 -ml-2"
                >
                  DMCA
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-midnight-secondary-700 mt-12 pt-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <p className="caption text-midnight-neutral-400 max-w-2xl">
              © {currentYear} ComiTe. All rights reserved. Templates and UI are proprietary. 
              Do not reuse without written permission from Vishnu Vivek Valeti.
            </p>
            <div className="flex flex-wrap gap-6">
              <Link 
                to="/legal/terms" 
                className="caption text-midnight-neutral-400 hover:text-midnight-primary-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-midnight-primary-500 focus:ring-offset-2 focus:ring-offset-midnight-secondary-800 rounded px-2 py-1"
              >
                Terms of Use
              </Link>
              <Link 
                to="/legal/license" 
                className="caption text-midnight-neutral-400 hover:text-midnight-primary-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-midnight-primary-500 focus:ring-offset-2 focus:ring-offset-midnight-secondary-800 rounded px-2 py-1"
              >
                License
              </Link>
              <Link 
                to="/legal/privacy" 
                className="caption text-midnight-neutral-400 hover:text-midnight-primary-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-midnight-primary-500 focus:ring-offset-2 focus:ring-offset-midnight-secondary-800 rounded px-2 py-1"
              >
                Privacy
              </Link>
              <Link 
                to="/legal/dmca" 
                className="caption text-midnight-neutral-400 hover:text-midnight-primary-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-midnight-primary-500 focus:ring-offset-2 focus:ring-offset-midnight-secondary-800 rounded px-2 py-1"
              >
                DMCA
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
