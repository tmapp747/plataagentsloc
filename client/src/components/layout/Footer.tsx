import { Link } from "react-router-dom";
import { Facebook, Twitter, Linkedin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Help & Support</h3>
            <ul className="mt-4 space-y-4">
              <li>
                <Link to="#" className="text-base text-gray-500 hover:text-gray-900">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link to="#" className="text-base text-gray-500 hover:text-gray-900">
                  FAQs
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Legal</h3>
            <ul className="mt-4 space-y-4">
              <li>
                <Link to="#" className="text-base text-gray-500 hover:text-gray-900">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="#" className="text-base text-gray-500 hover:text-gray-900">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">About PlataPay</h3>
            <p className="mt-4 text-base text-gray-500">
              PlataPay is a leading financial services provider specializing in payment solutions for businesses of all sizes.
            </p>
          </div>
        </div>
        <div className="mt-8 border-t border-gray-200 pt-8 md:flex md:items-center md:justify-between">
          <div className="flex space-x-6 md:order-2">
            <a href="#" className="text-gray-400 hover:text-gray-500">
              <span className="sr-only">Facebook</span>
              <Facebook className="h-6 w-6" />
            </a>
            <a href="#" className="text-gray-400 hover:text-gray-500">
              <span className="sr-only">Twitter</span>
              <Twitter className="h-6 w-6" />
            </a>
            <a href="#" className="text-gray-400 hover:text-gray-500">
              <span className="sr-only">LinkedIn</span>
              <Linkedin className="h-6 w-6" />
            </a>
          </div>
          <p className="mt-8 text-base text-gray-400 md:mt-0 md:order-1">
            &copy; {new Date().getFullYear()} PlataPay. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
