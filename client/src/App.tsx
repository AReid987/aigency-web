import { useState, useEffect, useCallback } from 'react';
import { trpc } from '@/utils/trpc';
import { ProjectsList } from '@/components/ProjectsList';
import { ProjectCanvas } from '@/components/ProjectCanvas';
import { Header } from '@/components/Header';
import { CreateProjectDialog } from '@/components/CreateProjectDialog';
import { LandingPage } from '@/components/LandingPage';
import { AuthDialog } from '@/components/AuthDialog';
import { Button } from '@/components/ui/button';
import { Plus, FolderOpen } from 'lucide-react';
import type { Project, User } from '../../server/src/schema';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loggedInUser, setLoggedInUser] = useState<User | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const loadProjects = useCallback(async () => {
    if (!loggedInUser) return;
    
    try {
      setIsLoading(true);
      const result = await trpc.getUserProjects.query();
      setProjects(result);
    } catch (error) {
      console.error('Failed to load projects:', error);
    } finally {
      setIsLoading(false);
    }
  }, [loggedInUser]);

  useEffect(() => {
    if (loggedInUser) {
      loadProjects();
    }
  }, [loadProjects, loggedInUser]);

  const handleCreateProject = async (projectData: { name: string; description: string | null }) => {
    try {
      const newProject = await trpc.createProject.mutate({
        name: projectData.name,
        description: projectData.description
      });
      setProjects((prev: Project[]) => [...prev, newProject]);
      setSelectedProject(newProject);
      setIsCreateDialogOpen(false);
    } catch (error) {
      console.error('Failed to create project:', error);
    }
  };

  const handleProjectSelect = (project: Project) => {
    setSelectedProject(project);
  };

  const handleBackToProjects = () => {
    setSelectedProject(null);
  };

  const onLoginSuccess = (user: User) => {
    setLoggedInUser(user);
    setIsAuthenticated(true);
    setIsAuthDialogOpen(false);
  };

  const handleLogout = () => {
    setLoggedInUser(null);
    setIsAuthenticated(false);
    setProjects([]);
    setSelectedProject(null);
  };

  const handleLogin = () => {
    setIsAuthDialogOpen(true);
  };

  // Show landing page if not authenticated
  if (!isAuthenticated) {
    return (
      <>
        <LandingPage onLogin={handleLogin} />
        <AuthDialog
          open={isAuthDialogOpen}
          onOpenChange={setIsAuthDialogOpen}
          onLogin={onLoginSuccess}
          onSignup={onLoginSuccess}
        />
      </>
    );
  }

  // Show project canvas if a project is selected
  if (selectedProject) {
    return (
      <div className="h-screen bg-gray-50">
        <Header 
          user={loggedInUser}
          project={selectedProject}
          isAuthenticated={isAuthenticated}
          onBackToProjects={handleBackToProjects}
          onLogout={handleLogout}
        />
        <ProjectCanvas project={selectedProject} user={loggedInUser!} />
      </div>
    );
  }

  // Show projects list
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      <Header 
        user={loggedInUser}
        isAuthenticated={isAuthenticated}
        onLogout={handleLogout}
      />
      
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Welcome back, {loggedInUser?.name} ✨
            </h1>
            <p className="text-lg text-gray-600">
              Continue building your next big idea or start a new project
            </p>
          </div>
          <Button 
            onClick={() => setIsCreateDialogOpen(true)}
            size="lg"
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          >
            <Plus className="mr-2 h-5 w-5" />
            New Project
          </Button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-12">
            <FolderOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No projects yet</h3>
            <p className="text-gray-600 mb-6">
              Create your first project to start bringing your ideas to life
            </p>
            <Button 
              onClick={() => setIsCreateDialogOpen(true)}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              <Plus className="mr-2 h-4 w-4" />
              Create Project
            </Button>
          </div>
        ) : (
          <ProjectsList 
            projects={projects}
            onProjectSelect={handleProjectSelect}
          />
        )}

        <CreateProjectDialog
          open={isCreateDialogOpen}
          onOpenChange={setIsCreateDialogOpen}
          onCreateProject={handleCreateProject}
        />
      </main>
    </div>
  );
}

export default App;