import { Layout } from '@/components/layout/Layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useAuthStore } from '@/store/auth';
import { useDashboard } from '@/hooks/use-api';
import {
  Activity,
  Server,
  FileText,
  HardDrive,
  Loader2,
  Info
} from 'lucide-react';

// Helper function to convert role codes to display names
const getRoleDisplayName = (role?: string) => {
  switch (role) {
    case 'S': return 'Student';
    case 'T': return 'Teacher';
    case 'A': return 'Admin';
    case 'G': return 'Guest';
    case 'STUDENT': return 'Student';
    case 'TEACHER': return 'Teacher';
    case 'ADMIN': return 'Admin';
    case 'GUEST': return 'Guest';
    default: return 'User';
  }
};

export default function Dashboard() {
  const { user } = useAuthStore();
  const { data: dashboard, isLoading, error } = useDashboard();

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="text-center py-8">
          <p className="text-red-600 dark:text-red-400">
            Failed to load dashboard data
          </p>
        </div>
      </Layout>
    );
  }

  const isAdmin = user?.role === 'ADMIN' || user?.role === 'A';
  const isTeacher = user?.role === 'TEACHER' || user?.role === 'T';

  return (
    <Layout>
      <div className="space-y-8">
        {/* Welcome Section */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Welcome back, {user?.username}!
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            {(user?.role === 'GUEST' || user?.role === 'G')
              ? 'You have guest access to explore the platform.'
              : `Manage your applications and files from your ${getRoleDisplayName(user?.role).toLowerCase()} dashboard.`
            }
          </p>
        </div>

        {/* Quick Actions */}
        <div className={`grid grid-cols-1 ${(isAdmin || isTeacher) ? 'md:grid-cols-3' : 'md:grid-cols-2'} gap-6`}>
          <Card className="p-6 flex flex-col justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <Server className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Manage Apps
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Start, stop, and monitor your applications
                </p>
              </div>
            </div>
            <Button asChild className="w-full mt-4">
              <Link to="/apps">Go to Apps</Link>
            </Button>
          </Card>

          <Card className="p-6 flex flex-col justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
                <FileText className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  File Explorer
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Upload, download, and manage files
                </p>
              </div>
            </div>
            <Button asChild variant="outline" className="w-full mt-4">
              <Link to="/files">Browse Files</Link>
            </Button>
          </Card>

          {/* Show usage stats for admins/teachers */}
          {(isAdmin || isTeacher) && (
            <Card className="p-6 flex flex-col justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                  <Activity className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    System Stats
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Monitor system usage and User Activities
                  </p>
                </div>
              </div>
              <Button asChild variant="outline" className="w-full mt-4">
                <Link to="/admin/activities">View Stats</Link>
              </Button>
            </Card>
          )}
        </div>

        {/* Shared Storage Info */}
        <Card className="p-4 bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <Info className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                Shared Storage
              </p>
              <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                Files in your storage are shared with your applications. Any files you upload or create will be accessible from within your running apps.
              </p>
            </div>
          </div>
        </Card>

        {/* Dashboard Data */}
        {dashboard && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Running Apps
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {dashboard.running_apps || 0}
                  </p>
                </div>
                <Server className="h-8 w-8 text-blue-500" />
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Total Files
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {dashboard.total_files || 0}
                  </p>
                </div>
                <FileText className="h-8 w-8 text-green-500" />
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Storage Used
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {dashboard.storage_used ? `${Math.round(dashboard.storage_used / 1024 / 1024)}MB` : '0MB'}
                  </p>
                </div>
                <HardDrive className="h-8 w-8 text-purple-500" />
              </div>
            </Card>
          </div>
        )}

      </div>
    </Layout>
  );
}