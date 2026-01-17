// API Response Types based on DRF_MIGRATION_PLAN.md

export type UserRole = 'STUDENT' | 'TEACHER' | 'ADMIN' | 'GUEST' | 'S' | 'T' | 'A' | 'G';

export interface User {
  id: number;
  username: string;
  email: string;
  role: UserRole;
  apps_available: string;
}

// Deployment stage status
export type StageStatus = 'pending' | 'creating' | 'ready' | 'running' | 'error';

// Deployment stages for granular progress tracking
export interface DeploymentStages {
  deployment: StageStatus;
  pod: StageStatus;
  service: StageStatus;
  ingress: StageStatus;
}

export interface App {
  id: string;
  name: string;
  description?: string;
  status: string;
  deployment_status: boolean;
  is_deployed: boolean;
  novnc_url?: string;
  vnc_pass?: string;
  // New granular status fields
  stages?: DeploymentStages;
  message?: string;
  ready?: boolean;
}

export interface AppsResponse {
  apps: Record<string, App>;
}

export interface DashboardResponse {
  user: User;
  template_type: string;
  role: string;
  apps_available: string;
  running_apps?: number;
  total_files?: number;
  storage_used?: number;
}

export interface FileItem {
  name: string;
  path: string; // base64 encoded
  is_dir: boolean;
  size?: number;
  escaped_name: string;
}

export interface StorageUsage {
  current_mb: number;
  limit_mb: number;
  percentage: number;
}

export interface FilePermissions {
  can_upload: boolean;
  can_delete: boolean;
  can_download: boolean;
}

export interface FilesResponse {
  current_path: string;
  parent_path_encoded?: string;
  files: FileItem[];
  directories: FileItem[];
  is_readonly: boolean;
  storage_usage: StorageUsage;
  permissions: FilePermissions;
}

export interface ActivityStats {
  total_activities: number;
  today_activities: number;
  week_activities: number;
  unique_users: number;
}

export interface UserActivity {
  id: number;
  user: number;
  user_username: string;
  user_email: string;
  username: string;
  activity_type: string;
  activity_display: string;
  timestamp: string;
  ip_address?: string;
  user_agent?: string;
  details: Record<string, any>;
}

export interface UsageStatsResponse {
  stats: ActivityStats;
  activities: UserActivity[];
  pagination: {
    count: number;
    num_pages: number;
    current_page: number;
    has_next: boolean;
    has_previous: boolean;
    next_page_number?: number;
    previous_page_number?: number;
  };
  filters: Record<string, any>;
}

// Authentication Types
export interface LoginRequest {
  username: string;
  password: string;
}

export interface SignupRequest {
  username: string;
  email: string;
  password: string;
  password_confirm: string;
}

export interface AuthResponse {
  access: string;
  refresh: string;
  user: User;
}

export interface TokenRefreshRequest {
  refresh: string;
}

export interface TokenRefreshResponse {
  access: string;
  refresh?: string; // Optional because it depends on ROTATE_REFRESH_TOKENS setting
}

// API Error Types
export interface APIError {
  message: string;
  status: number;
  details?: Record<string, any>;
}