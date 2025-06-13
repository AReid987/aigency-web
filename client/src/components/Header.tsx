
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowLeft, Share2, Users, LogOut } from 'lucide-react';
import type { User, Project } from '../../../server/src/schema';

interface HeaderProps {
  user?: User | null;
  project?: Project;
  isAuthenticated: boolean;
  onBackToProjects?: () => void;
  onLogin?: () => void;
  onLogout?: () => void;
}

export function Header({ user, project, isAuthenticated, onBackToProjects, onLogin, onLogout }: HeaderProps) {
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <header className="bg-white border-b border-gray-200 px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {project && onBackToProjects && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onBackToProjects}
              className="text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Projects
            </Button>
          )}
          
          <div className="flex items-center space-x-2">
            <div className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Aigency
            </div>
            {project && (
              <>
                <span className="text-gray-400">/</span>
                <h1 className="text-xl font-semibold text-gray-900">{project.name}</h1>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {project && (
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <Users className="h-4 w-4 mr-1" />
                Collaborate
              </Button>
              <Button variant="outline" size="sm">
                <Share2 className="h-4 w-4 mr-1" />
                Share
              </Button>
            </div>
          )}
          
          {isAuthenticated && user ? (
            <div className="flex items-center space-x-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user.avatar_url || undefined} alt={user.name} />
                <AvatarFallback className="bg-gradient-to-r from-purple-500 to-blue-500 text-white">
                  {getInitials(user.name)}
                </AvatarFallback>
              </Avatar>
              <Button
                variant="ghost"
                size="sm"
                onClick={onLogout}
                className="text-gray-600 hover:text-gray-900"
              >
                <LogOut className="h-4 w-4 mr-1" />
                Logout
              </Button>
            </div>
          ) : (
            <Button
              onClick={onLogin}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              Login
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
