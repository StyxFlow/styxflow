import Link from "next/link";
import { FaTwitter, FaLinkedin, FaGithub } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="bg-[#F9F8F4] py-20 border-t border-gray-200">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="text-2xl font-bold tracking-tighter text-gray-900 mb-6 block">
              StyxFlow
            </Link>
            <p className="text-gray-600 max-w-md text-lg leading-relaxed">
              The AI-powered job portal that revolutionizes hiring. 
              Smart matching, automated interviews, and instant results.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold text-gray-900 mb-6">Platform</h4>
            <ul className="space-y-4">
              <li><Link href="#" className="text-gray-600 hover:text-main transition-colors">For Candidates</Link></li>
              <li><Link href="#" className="text-gray-600 hover:text-main transition-colors">For Employers</Link></li>
              <li><Link href="#" className="text-gray-600 hover:text-main transition-colors">Pricing</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-6">Company</h4>
            <ul className="space-y-4">
              <li><Link href="#" className="text-gray-600 hover:text-mainsition-colors">About</Link></li>
              <li><Link href="#" className="text-gray-600 hover:text-main transition-colors">Blog</Link></li>
              <li><Link href="#" className="text-gray-600 hover:text-main transition-colors">Contact</Link></li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-gray-200">
          <p className="text-gray-500 text-sm mb-4 md:mb-0">
            © {new Date().getFullYear()} StyxFlow. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link href="#" className="text-gray-400 hover:text-main transition-colors text-xl"><FaTwitter /></Link>
            <Link href="#" className="text-gray-400 hover:text-main transition-colors text-xl"><FaLinkedin /></Link>
            <Link href="#" className="text-gray-400 hover:text-main transition-colors text-xl"><FaGithub /></Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
