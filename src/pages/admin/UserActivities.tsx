import { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from '@/components/ui/dropdown-menu';
import { useUsageStats } from '@/hooks/use-api';
import type { UserActivity } from '@/types/api';
import {
  Activity,
  Users,
  Calendar,
  Search,
  Loader2,
  ChevronLeft,
  ChevronRight,
  LogIn,
  LogOut,
  Play,
  Square,
  Upload,
  Download,
  Trash2,
  UserPlus,
  Eye,
  Monitor,
  Filter,
  X,
  ChevronDown
} from 'lucide-react';

// Activity type color and icon mapping
const getActivityTypeInfo = (activityType: string) => {
  const typeMap: Record<string, { icon: typeof LogIn; color: string; bgColor: string }> = {
    login: { icon: LogIn, color: 'text-green-600', bgColor: 'bg-green-100 dark:bg-green-900/20' },
    logout: { icon: LogOut, color: 'text-red-600', bgColor: 'bg-red-100 dark:bg-red-900/20' },
    pod_start: { icon: Play, color: 'text-blue-600', bgColor: 'bg-blue-100 dark:bg-blue-900/20' },
    pod_stop: { icon: Square, color: 'text-yellow-600', bgColor: 'bg-yellow-100 dark:bg-yellow-900/20' },
    file_upload: { icon: Upload, color: 'text-purple-600', bgColor: 'bg-purple-100 dark:bg-purple-900/20' },
    file_download: { icon: Download, color: 'text-teal-600', bgColor: 'bg-teal-100 dark:bg-teal-900/20' },
    file_delete: { icon: Trash2, color: 'text-orange-600', bgColor: 'bg-orange-100 dark:bg-orange-900/20' },
    account_created: { icon: UserPlus, color: 'text-pink-600', bgColor: 'bg-pink-100 dark:bg-pink-900/20' },
    page_view: { icon: Eye, color: 'text-gray-600', bgColor: 'bg-gray-100 dark:bg-gray-900/20' },
  };

  return typeMap[activityType] || { icon: Activity, color: 'text-gray-600', bgColor: 'bg-gray-100 dark:bg-gray-900/20' };
};

// Parse activity details for better display
const parseActivityDetails = (activity: UserActivity) => {
  const details = activity.details;
  const components = [];

  if (details.app_name) {
    components.push(
      <span key="app" className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 mr-2 mb-1">
        <Monitor className="h-3 w-3 mr-1" />
        {details.app_name}
      </span>
    );
  }

  if (details.filename) {
    components.push(
      <div key="file" className="text-xs text-gray-600 dark:text-gray-400 mb-1">
        <span className="font-medium">{details.filename}</span>
        {details.file_size_mb && (
          <span className="text-gray-500 ml-1">({parseFloat(details.file_size_mb).toFixed(2)} MB)</span>
        )}
      </div>
    );
  }

  if (details.pod_name) {
    components.push(
      <div key="pod" className="text-xs text-gray-500 dark:text-gray-400 mb-1">
        Pod: {details.pod_name}
      </div>
    );
  }

  if (details.error_message) {
    components.push(
      <div key="error" className="text-xs text-red-600 dark:text-red-400 mb-1">
        Error: {details.error_message}
      </div>
    );
  }

  if (details.page_path) {
    components.push(
      <div key="page" className="text-xs text-gray-600 dark:text-gray-400 mb-1">
        <span className="font-mono">{details.page_path}</span>
        {details.http_method && (
          <span className="ml-2 px-1 py-0.5 rounded text-xs bg-gray-200 dark:bg-gray-700">
            {details.http_method}
          </span>
        )}
      </div>
    );
  }

  return components.length > 0 ? components : null;
};

// Activity type options for filtering
const activityTypeOptions = [
  { value: '', label: 'All Activities' },
  { value: 'login', label: 'Login' },
  { value: 'logout', label: 'Logout' },
  { value: 'pod_start', label: 'Pod Started' },
  { value: 'pod_stop', label: 'Pod Stopped' },
  { value: 'file_upload', label: 'File Uploaded' },
  { value: 'file_download', label: 'File Downloaded' },
  { value: 'file_delete', label: 'File Deleted' },
  { value: 'account_created', label: 'Account Created' },
  { value: 'page_view', label: 'Page View' },
];

export default function UserActivities() {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Individual filter states for better UX
  const [selectedActivityTypes, setSelectedActivityTypes] = useState<string[]>([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Build filters object
  const filters: Record<string, string> = {};
  if (selectedActivityTypes.length > 0) {
    filters.activity_type = selectedActivityTypes.join(','); // Backend might expect comma-separated or we'll use first one
    // For now, use first selected activity type (backend expects single value)
    filters.activity_type = selectedActivityTypes[0];
  }
  if (startDate) filters.start_date = startDate;
  if (endDate) filters.end_date = endDate;

  // Build query parameters
  const queryParams = {
    ...filters,
    ...(searchQuery && { search: searchQuery }),
    page: currentPage.toString(),
  };

  const { data, isLoading, error } = useUsageStats(queryParams);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handleActivityTypeToggle = (activityType: string) => {
    if (activityType === '') {
      // "All Activities" selected
      setSelectedActivityTypes([]);
    } else {
      setSelectedActivityTypes(prev => {
        if (prev.includes(activityType)) {
          return prev.filter(type => type !== activityType);
        } else {
          return [...prev, activityType];
        }
      });
    }
    setCurrentPage(1);
  };

  const handleDateChange = (type: 'start' | 'end', value: string) => {
    if (type === 'start') {
      setStartDate(value);
    } else {
      setEndDate(value);
    }
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSelectedActivityTypes([]);
    setStartDate('');
    setEndDate('');
    setSearchQuery('');
    setCurrentPage(1);
  };

  const hasActiveFilters = selectedActivityTypes.length > 0 || startDate || endDate || searchQuery;
  const activeFiltersCount = [
    selectedActivityTypes.length > 0,
    startDate,
    endDate,
    searchQuery
  ].filter(Boolean).length;

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
            Failed to load user activities
          </p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            User Activities Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Monitor user activities and system usage across the platform
          </p>
        </div>

        {/* Statistics Cards */}
        {data?.stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Total Activities
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {data.stats.total_activities}
                  </p>
                </div>
                <Activity className="h-8 w-8 text-blue-500" />
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Today's Activities
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {data.stats.today_activities}
                  </p>
                </div>
                <Calendar className="h-8 w-8 text-green-500" />
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    This Week
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {data.stats.week_activities}
                  </p>
                </div>
                <Activity className="h-8 w-8 text-purple-500" />
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Active Users
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {data.stats.unique_users}
                  </p>
                </div>
                <Users className="h-8 w-8 text-orange-500" />
              </div>
            </Card>
          </div>
        )}

        {/* Search and Filters */}
        <Card className="p-6">
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="flex items-center space-x-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by username, email, or IP address..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-2"
              >
                <Filter className="h-4 w-4" />
                <span>Filters</span>
                {activeFiltersCount > 0 && (
                  <span className="bg-blue-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] h-5 flex items-center justify-center">
                    {activeFiltersCount}
                  </span>
                )}
                <ChevronDown className={`h-4 w-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </Button>
            </div>

            {/* Filters Panel */}
            {showFilters && (
              <div className="border-t pt-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Activity Type Filter */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Activity Type</Label>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="w-full justify-between">
                          {selectedActivityTypes.length === 0
                            ? 'All Activities'
                            : selectedActivityTypes.length === 1
                            ? activityTypeOptions.find(opt => opt.value === selectedActivityTypes[0])?.label
                            : `${selectedActivityTypes.length} selected`
                          }
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-56">
                        {activityTypeOptions.map((option) => (
                          <DropdownMenuCheckboxItem
                            key={option.value}
                            checked={option.value === '' ? selectedActivityTypes.length === 0 : selectedActivityTypes.includes(option.value)}
                            onCheckedChange={() => handleActivityTypeToggle(option.value)}
                          >
                            {option.label}
                          </DropdownMenuCheckboxItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* Start Date Filter */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Start Date</Label>
                    <Input
                      type="datetime-local"
                      value={startDate}
                      onChange={(e) => handleDateChange('start', e.target.value)}
                      className="w-full"
                    />
                  </div>

                  {/* End Date Filter */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">End Date</Label>
                    <Input
                      type="datetime-local"
                      value={endDate}
                      onChange={(e) => handleDateChange('end', e.target.value)}
                      className="w-full"
                    />
                  </div>
                </div>

                {/* Filter Actions */}
                {hasActiveFilters && (
                  <div className="flex items-center justify-between mt-4 pt-4 border-t">
                    <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                      <span>{activeFiltersCount} filter{activeFiltersCount !== 1 ? 's' : ''} applied</span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={clearFilters}
                      className="flex items-center space-x-1"
                    >
                      <X className="h-4 w-4" />
                      <span>Clear All</span>
                    </Button>
                  </div>
                )}

                {/* Active Filter Chips */}
                {hasActiveFilters && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {selectedActivityTypes.map((type) => {
                      const option = activityTypeOptions.find(opt => opt.value === type);
                      return (
                        <div key={type} className="inline-flex items-center bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full text-xs">
                          <span>{option?.label}</span>
                          <button
                            onClick={() => handleActivityTypeToggle(type)}
                            className="ml-1 hover:bg-blue-200 dark:hover:bg-blue-800 rounded-full p-0.5"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      );
                    })}
                    {startDate && (
                      <div className="inline-flex items-center bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded-full text-xs">
                        <span>From: {new Date(startDate).toLocaleDateString()}</span>
                        <button
                          onClick={() => handleDateChange('start', '')}
                          className="ml-1 hover:bg-green-200 dark:hover:bg-green-800 rounded-full p-0.5"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    )}
                    {endDate && (
                      <div className="inline-flex items-center bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 px-2 py-1 rounded-full text-xs">
                        <span>Until: {new Date(endDate).toLocaleDateString()}</span>
                        <button
                          onClick={() => handleDateChange('end', '')}
                          className="ml-1 hover:bg-orange-200 dark:hover:bg-orange-800 rounded-full p-0.5"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    )}
                    {searchQuery && (
                      <div className="inline-flex items-center bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 px-2 py-1 rounded-full text-xs">
                        <span>Search: "{searchQuery}"</span>
                        <button
                          onClick={() => handleSearch('')}
                          className="ml-1 hover:bg-purple-200 dark:hover:bg-purple-800 rounded-full p-0.5"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </Card>

        {/* Activities Table */}
        <Card className="p-0">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Recent Activities {data?.pagination && `(${data.pagination.count} total)`}
            </h3>
          </div>

          {data?.activities && data.activities.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-xs text-gray-500 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                    <tr>
                      <th className="px-6 py-3 text-left">User</th>
                      <th className="px-6 py-3 text-left">Activity</th>
                      <th className="px-6 py-3 text-left">Details</th>
                      <th className="px-6 py-3 text-left">IP Address</th>
                      <th className="px-6 py-3 text-left">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                    {data.activities.map((activity) => {
                      const typeInfo = getActivityTypeInfo(activity.activity_type);
                      const IconComponent = typeInfo.icon;
                      const detailsComponents = parseActivityDetails(activity);

                      return (
                        <tr
                          key={activity.id}
                          className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-3">
                              <div className="flex-shrink-0">
                                <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-medium">
                                  {(activity.user_username || activity.username || 'A').charAt(0).toUpperCase()}
                                </div>
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                  {activity.user_username || activity.username || 'Anonymous'}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                  {activity.user_email || 'No email'}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-2">
                              <div className={`p-2 rounded-full ${typeInfo.bgColor}`}>
                                <IconComponent className={`h-4 w-4 ${typeInfo.color}`} />
                              </div>
                              <span className="text-sm font-medium text-gray-900 dark:text-white">
                                {activity.activity_display}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            {detailsComponents ? (
                              <div className="space-y-1">
                                {detailsComponents}
                              </div>
                            ) : (
                              <span className="text-xs text-gray-400">No details</span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            {activity.ip_address ? (
                              <code className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                                {activity.ip_address}
                              </code>
                            ) : (
                              <span className="text-xs text-gray-400">-</span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm">
                              <div className="text-gray-900 dark:text-white">
                                {new Date(activity.timestamp).toLocaleDateString()}
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                {new Date(activity.timestamp).toLocaleTimeString()}
                              </div>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {data.pagination && data.pagination.num_pages > 1 && (
                <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Showing page {data.pagination.current_page} of {data.pagination.num_pages}
                      ({data.pagination.count} total activities)
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={!data.pagination.has_previous}
                      >
                        <ChevronLeft className="h-4 w-4 mr-1" />
                        Previous
                      </Button>
                      <span className="text-sm text-gray-600 dark:text-gray-400 px-2">
                        {currentPage}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={!data.pagination.has_next}
                      >
                        Next
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No activities found
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Try adjusting your search criteria or check back later.
              </p>
            </div>
          )}
        </Card>
      </div>
    </Layout>
  );
}