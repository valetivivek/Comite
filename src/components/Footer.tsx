import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = [
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' },
    { name: 'Terms', href: '/terms' },
    { name: 'Privacy', href: '/privacy' },
  ];

  return (
    <footer className="bg-manga-card border-t border-manga-border mt-auto">
      <div className="container mx-auto px-4 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link to="/" className="text-2xl font-bold text-teal-500 hover:text-teal-400 transition-colors">
              📚 ComiTe
            </Link>
            <p className="text-manga-muted mt-2 max-w-md">
              Your ultimate destination for reading comics, manga, and manhua. 
              Discover new stories, track your progress, and enjoy reading with our modern interface.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-manga-text font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {footerLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-manga-muted hover:text-teal-400 transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-manga-text font-semibold mb-4">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/terms"
                  className="text-manga-muted hover:text-teal-400 transition-colors"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  to="/privacy"
                  className="text-manga-muted hover:text-teal-400 transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  to="/dmca"
                  className="text-manga-muted hover:text-teal-400 transition-colors"
                >
                  DMCA
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-manga-border mt-8 pt-6 flex flex-col sm:flex-row justify-between items-center">
          <p className="text-manga-muted text-sm">
            © {currentYear} ComiTe. All rights reserved.
          </p>
          <p className="text-manga-muted text-sm mt-2 sm:mt-0">
            Made with ❤️ for comic lovers
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
