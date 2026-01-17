import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useApps, useStartApp, useStopApp } from '@/hooks/use-api';
import type { DeploymentStages, StageStatus } from '@/types/api';
import {
  Play,
  Square,
  ExternalLink,
  Loader2,
  AlertCircle,
  Server,
  Copy,
  Link as LinkIcon,
  ArrowLeft,
  CheckCircle2,
  Circle,
  XCircle,
  ChevronRight
} from 'lucide-react';

// Warming up delay in ms after all stages are ready (for Cloudflare propagation)
const WARMING_UP_DELAY_MS = 1500;

// Deployment stage configuration
const DEPLOYMENT_STEPS = [
  { key: 'deployment' as const, label: 'Deployment', shortLabel: 'Deploy' },
  { key: 'pod' as const, label: 'Container', shortLabel: 'Pod' },
  { key: 'service' as const, label: 'Network', shortLabel: 'Net' },
  { key: 'ingress' as const, label: 'Routing', shortLabel: 'Route' },
];

// Stage status icon component
const StageStatusIcon = ({ status }: { status: StageStatus }) => {
  switch (status) {
    case 'ready':
    case 'running':
      return <CheckCircle2 className="w-4 h-4 text-green-500" />;
    case 'creating':
      return <Loader2 className="w-4 h-4 text-yellow-500 animate-spin" />;
    case 'error':
      return <XCircle className="w-4 h-4 text-red-500" />;
    case 'pending':
    default:
      return <Circle className="w-4 h-4 text-gray-400" />;
  }
};

// Deployment progress stepper component
const DeploymentProgress = ({
  stages,
  message,
}: {
  stages: DeploymentStages;
  message?: string;
}) => {
  return (
    <div className="space-y-3 p-4 bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800 rounded-lg">
      {/* Progress steps */}
      <div className="flex items-center justify-between gap-1">
        {DEPLOYMENT_STEPS.map((step, index) => (
          <div key={step.key} className="flex items-center">
            <div className="flex flex-col items-center">
              <StageStatusIcon status={stages[step.key]} />
              <span className="text-xs text-gray-600 dark:text-gray-400 mt-1 hidden sm:block">
                {step.label}
              </span>
              <span className="text-xs text-gray-600 dark:text-gray-400 mt-1 sm:hidden">
                {step.shortLabel}
              </span>
            </div>
            {index < DEPLOYMENT_STEPS.length - 1 && (
              <ChevronRight className="w-4 h-4 text-gray-400 mx-1 flex-shrink-0" />
            )}
          </div>
        ))}
      </div>

      {/* Status message */}
      {message && (
        <p className="text-sm text-yellow-700 dark:text-yellow-300 text-center">
          {message}
        </p>
      )}
    </div>
  );
};

export default function Apps() {
  const { data: apps, isLoading, error } = useApps();
  const startAppMutation = useStartApp();
  const stopAppMutation = useStopApp();

  // Track which apps have completed warming up (after ready=true + delay)
  const [warmedUpApps, setWarmedUpApps] = useState<Set<string>>(new Set());
  // Track when each app became ready (to calculate warming up timer)
  const readyTimestamps = useRef<Map<string, number>>(new Map());

  // Handle warming up delay when apps become ready
  useEffect(() => {
    if (!apps) return;

    apps.forEach((app) => {
      const isReady = app.status === 'running' && app.ready;
      const isWarmedUp = warmedUpApps.has(app.id);
      const hasTimestamp = readyTimestamps.current.has(app.id);

      if (isReady && !isWarmedUp && !hasTimestamp) {
        // App just became ready - record timestamp and start timer
        readyTimestamps.current.set(app.id, Date.now());

        setTimeout(() => {
          setWarmedUpApps((prev) => new Set(prev).add(app.id));
        }, WARMING_UP_DELAY_MS);
      } else if (!isReady && (isWarmedUp || hasTimestamp)) {
        // App is no longer ready - clear warming up state
        readyTimestamps.current.delete(app.id);
        setWarmedUpApps((prev) => {
          const next = new Set(prev);
          next.delete(app.id);
          return next;
        });
      }
    });
  }, [apps, warmedUpApps]);

  const handleStartApp = (appId: string) => {
    startAppMutation.mutate(appId);
  };

  const handleStopApp = (appId: string) => {
    stopAppMutation.mutate(appId);
  };

  // Check if an app is fully ready (backend ready + warming up complete)
  const isAppFullyReady = (appId: string, backendReady: boolean | undefined) => {
    return backendReady && warmedUpApps.has(appId);
  };

  // Check if an app is in warming up state
  const isAppWarmingUp = (appId: string, backendReady: boolean | undefined) => {
    return backendReady && !warmedUpApps.has(appId);
  };

  // Build VNC URL with full parameters for direct connection
  const buildVncUrl = (novncUrl: string, vncPassword: string) => {
    return `${novncUrl}/vnc.html?password=${vncPassword}&path=vnc&autoconnect=true&resize=remote&reconnect=true&show_dot=true`;
  };

  // Copy to clipboard functionality
  const copyToClipboard = async (text: string, event: React.MouseEvent<HTMLButtonElement>) => {
    try {
      await navigator.clipboard.writeText(text);
      const button = event.currentTarget;
      const originalContent = button.innerHTML;

      // Show success feedback
      button.innerHTML = '<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>';
      button.style.color = '#10b981';

      setTimeout(() => {
        button.innerHTML = originalContent;
        button.style.color = '';
      }, 2000);
    } catch (err) {
      console.error('Could not copy text: ', err);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'running':
        return 'text-green-600 bg-green-100 dark:bg-green-900/20 dark:text-green-400';
      case 'stopped':
        return 'text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-400';
      case 'starting':
        return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'stopping':
        return 'text-orange-600 bg-orange-100 dark:bg-orange-900/20 dark:text-orange-400';
      case 'error':
        return 'text-red-600 bg-red-100 dark:bg-red-900/20 dark:text-red-400';
      default:
        return 'text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'running':
        return <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />;
      case 'stopped':
        return <div className="w-2 h-2 bg-gray-400 rounded-full" />;
      case 'starting':
      case 'stopping':
        return <Loader2 className="w-3 h-3 animate-spin" />;
      case 'error':
        return <AlertCircle className="w-3 h-3" />;
      default:
        return <div className="w-2 h-2 bg-gray-400 rounded-full" />;
    }
  };

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
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 dark:text-red-400">
            Failed to load applications
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
          <div className="flex items-center gap-4 mb-2">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/dashboard" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Dashboard
              </Link>
            </Button>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Applications
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage your cloud applications. Start, stop, and monitor their status.
          </p>
        </div>

        {/* Apps Grid */}
        {!apps || apps.length === 0 ? (
          <div className="text-center py-12">
            <Server className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No applications available
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Contact your administrator to get access to applications.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {apps.map((app) => (
              <Card key={app.id} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {app.name}
                    </h3>
                    {app.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {app.description}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(app.status)}
                    <span
                      className={`text-xs font-medium px-2 py-1 rounded-full ${getStatusColor(
                        app.status
                      )}`}
                    >
                      {app.status}
                    </span>
                  </div>
                </div>

                {/* App Details */}
                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
                  <div className="flex justify-between">
                    <span>Deployed:</span>
                    <span>{app.is_deployed ? 'Yes' : 'No'}</span>
                  </div>
                </div>

                {/* Deployment Progress - show when starting/transitioning */}
                {app.status === 'starting' && app.stages && (
                  <div className="mb-4">
                    <DeploymentProgress stages={app.stages} message={app.message} />
                  </div>
                )}

                {/* Warming up indicator - show when backend ready but still warming up */}
                {app.status === 'running' && isAppWarmingUp(app.id, app.ready) && (
                  <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800 rounded-lg">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="w-4 h-4 text-green-600 dark:text-green-400 animate-spin" />
                      <p className="text-sm text-green-700 dark:text-green-300">
                        Warming up connection...
                      </p>
                    </div>
                  </div>
                )}

                {/* VNC Connection Info - only show when FULLY READY (all stages + warming up complete) */}
                {app.status === 'running' && isAppFullyReady(app.id, app.ready) && app.novnc_url && app.vnc_pass && (
                  <div className="space-y-4 mb-6 p-4 bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-lg">
                    {/* Direct VNC Link */}
                    <div>
                      <label className="block text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
                        Direct Link to your machine:
                      </label>
                      <a
                        href={buildVncUrl(app.novnc_url, app.vnc_pass)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm font-medium bg-blue-100 dark:bg-blue-900/20 px-3 py-2 rounded-lg border border-blue-200 dark:border-blue-700 hover:bg-blue-200 dark:hover:bg-blue-900/30 transition-colors w-full"
                      >
                        <LinkIcon className="h-4 w-4 flex-shrink-0" />
                        <span className="truncate">{app.novnc_url}</span>
                        <ExternalLink className="h-3 w-3 flex-shrink-0 ml-auto" />
                      </a>
                    </div>

                    {/* VNC Password */}
                    <div>
                      <label className="block text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
                        VNC Password:
                      </label>
                      <div className="flex items-center gap-2">
                        <code className="flex-1 bg-gray-100 dark:bg-gray-800 px-3 py-2 rounded border text-sm font-mono text-gray-900 dark:text-gray-100 min-w-0">
                          {app.vnc_pass}
                        </code>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => copyToClipboard(app.vnc_pass!, e)}
                          className="h-8 w-8 p-0 flex-shrink-0"
                          title="Copy password"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex space-x-2">
                  {app.status === 'running' ? (
                    <>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleStopApp(app.id)}
                        disabled={stopAppMutation.isPending}
                        className="flex-1"
                      >
                        {stopAppMutation.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <Square className="h-4 w-4 mr-2" />
                        )}
                        Stop
                      </Button>
                      {/* Only show Direct Access button when app is fully ready (including warming up) */}
                      {isAppFullyReady(app.id, app.ready) && app.novnc_url && (
                        <Button
                          variant="outline"
                          size="sm"
                          asChild
                          className="flex-1"
                        >
                          <a
                            href={app.vnc_pass ? buildVncUrl(app.novnc_url, app.vnc_pass) : app.novnc_url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Direct Access
                          </a>
                        </Button>
                      )}
                    </>
                  ) : (
                    <Button
                      onClick={() => handleStartApp(app.id)}
                      disabled={
                        startAppMutation.isPending ||
                        ['starting', 'stopping'].includes(app.status.toLowerCase())
                      }
                      className="flex-1"
                    >
                      {startAppMutation.isPending ||
                      app.status.toLowerCase() === 'starting' ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <Play className="h-4 w-4 mr-2" />
                      )}
                      Start
                    </Button>
                  )}
                </div>

                {/* Demo notice - show for stopped apps */}
                {app.status === 'stopped' && (
                  <p className="mt-2 text-xs text-gray-500 dark:text-gray-400 text-center">
                    Demo mode: Sessions are limited to 3 minutes.
                  </p>
                )}

                {/* Error Messages */}
                {(startAppMutation.error || stopAppMutation.error) && (
                  <div className="mt-3 p-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs rounded">
                    {startAppMutation.error?.message || stopAppMutation.error?.message}
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}

        {/* Quick Stats */}
        {apps && apps.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {apps.filter((app) => app.status === 'running').length}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Running</p>
              </div>
            </Card>
            <Card className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-600 dark:text-gray-400">
                  {apps.filter((app) => app.status === 'stopped').length}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Stopped</p>
              </div>
            </Card>
            <Card className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                  {apps.filter((app) => ['starting', 'stopping'].includes(app.status.toLowerCase())).length}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Transitioning</p>
              </div>
            </Card>
            <Card className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {apps.length}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total</p>
              </div>
            </Card>
          </div>
        )}
      </div>
    </Layout>
  );
}