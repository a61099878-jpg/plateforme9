import React from 'react';
import { CheckCircle, AlertCircle, RefreshCw, Wifi, WifiOff } from 'lucide-react';

interface DataSyncIndicatorProps {
  isLoading?: boolean;
  hasError?: boolean;
  lastUpdated?: Date;
  isOnline?: boolean;
}

export function DataSyncIndicator({ 
  isLoading = false, 
  hasError = false, 
  lastUpdated,
  isOnline = true 
}: DataSyncIndicatorProps) {
  const getIcon = () => {
    if (!isOnline) return <WifiOff className="h-3 w-3" />;
    if (isLoading) return <RefreshCw className="h-3 w-3 animate-spin" />;
    if (hasError) return <AlertCircle className="h-3 w-3" />;
    return <CheckCircle className="h-3 w-3" />;
  };

  const getStatus = () => {
    if (!isOnline) return 'Hors ligne';
    if (isLoading) return 'Synchronisation...';
    if (hasError) return 'Erreur de sync';
    return 'À jour';
  };

  const getStatusColor = () => {
    if (!isOnline) return 'text-gray-500';
    if (isLoading) return 'text-blue-500';
    if (hasError) return 'text-red-500';
    return 'text-green-500';
  };

  const formatLastUpdated = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);

    if (diffSecs < 60) return 'à l\'instant';
    if (diffMins < 60) return `il y a ${diffMins} min`;
    return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex items-center space-x-2 text-xs">
      <div className={`flex items-center space-x-1 ${getStatusColor()}`}>
        {getIcon()}
        <span>{getStatus()}</span>
      </div>
      {lastUpdated && !isLoading && !hasError && (
        <span className="text-gray-400">
          • {formatLastUpdated(lastUpdated)}
        </span>
      )}
    </div>
  );
}