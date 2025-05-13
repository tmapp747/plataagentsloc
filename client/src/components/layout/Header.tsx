import { Link } from "react-router-dom";
import { HelpCircle } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

const Header = () => {
  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <div className="flex items-center">
          <Link to="/" className="flex items-center">
            <h1 className="text-2xl font-bold text-primary">PlataPay</h1>
            <span className="ml-2 text-sm text-gray-500">Agent Onboarding</span>
          </Link>
        </div>
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon">
            <HelpCircle className="h-5 w-5 text-gray-500" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center text-sm font-medium text-gray-700 hover:text-gray-900">
                <span className="mr-1">EN</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>English</DropdownMenuItem>
              <DropdownMenuItem>Filipino</DropdownMenuItem>
              <DropdownMenuItem>Spanish</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default Header;
