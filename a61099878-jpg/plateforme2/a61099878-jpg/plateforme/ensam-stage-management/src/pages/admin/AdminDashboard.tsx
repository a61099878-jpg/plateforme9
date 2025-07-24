import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { useAutoRefresh } from '@/hooks/use-auto-refresh';
import { DataSyncIndicator } from '@/components/DataSyncIndicator';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';

import { 
  Users, 
  FileText, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  XCircle,
  TrendingUp,
  Download,
  Upload,
  RefreshCw,
  Trash2
} from 'lucide-react';

export function AdminDashboard() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isClearingDatabase, setIsClearingDatabase] = useState(false);
  const queryClient = useQueryClient();
  
  const { data: studentsData, isLoading: studentsLoading, error: studentsError } = useQuery({
    queryKey: ['admin', 'students'],
    queryFn: () => api.getStudents(),
  });

  const { data: conventionsData, isLoading: conventionsLoading, error: conventionsError } = useQuery({
    queryKey: ['admin', 'conventions'],
    queryFn: () => api.getConventions(),
  });

  // Update last updated time when data changes
  useEffect(() => {
    if (studentsData || conventionsData) {
      setLastUpdated(new Date());
    }
  }, [studentsData, conventionsData]);

  // Auto-refresh every 30 seconds
  const { refreshNow } = useAutoRefresh({
    queryKeys: [['admin', 'students'], ['admin', 'conventions']],
    intervalMs: 30000,
    enabled: true
  });

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await refreshNow();
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const handleClearDatabase = async () => {
    setIsClearingDatabase(true);
    try {
      const response = await api.clearDatabase();
      toast.success(`Base vidée avec succès! ${response.deletedStudents} étudiants et ${response.deletedConventions} conventions supprimés.`);
      // Invalidate all admin queries to force refresh
      await queryClient.invalidateQueries({ queryKey: ['admin'] });
      await refreshNow();
    } catch (error: any) {
      toast.error(`Erreur: ${error.message}`);
    } finally {
      setIsClearingDatabase(false);
    }
  };

  const students = studentsData?.students || [];
  const conventions = conventionsData?.conventions || [];

  // Calculate statistics
  const stats = {
    totalStudents: students.length,
    registeredStudents: students.filter((s: any) => s.isRegistered).length,
    totalConventions: conventions.length,
    pendingConventions: conventions.filter((c: any) => c.status === 'en_attente').length,
    submittedConventions: conventions.filter((c: any) => c.status === 'envoye').length,
    validatedConventions: conventions.filter((c: any) => c.status === 'valide').length,
    rejectedConventions: conventions.filter((c: any) => c.status === 'rejete').length,
  };

  // Calculate registration percentage
  const registrationPercentage = stats.totalStudents > 0 
    ? (stats.registeredStudents / stats.totalStudents) * 100 
    : 0;

  // Group conventions by type
  const conventionsByType = conventions.reduce((acc: any, conv: any) => {
    acc[conv.typeStage] = (acc[conv.typeStage] || 0) + 1;
    return acc;
  }, {});

  // Group students by filiere
  const studentsByFiliere = students.reduce((acc: any, student: any) => {
    acc[student.filiere] = (acc[student.filiere] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tableau de Bord</h1>
          <p className="text-gray-600">Vue d'ensemble des étudiants et conventions de stage</p>
        </div>
        <div className="flex items-center space-x-4">
          <DataSyncIndicator 
            isLoading={studentsLoading || conventionsLoading || isRefreshing}
            hasError={!!(studentsError || conventionsError)}
            lastUpdated={lastUpdated}
            isOnline={navigator.onLine}
          />
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleManualRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Actualiser
            </Button>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="destructive" 
                  size="sm"
                  disabled={isClearingDatabase}
                >
                  <Trash2 className={`h-4 w-4 mr-2 ${isClearingDatabase ? 'animate-pulse' : ''}`} />
                  Vider la base
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-red-600 flex items-center">
                    <AlertCircle className="h-5 w-5 mr-2" />
                    ⚠️ Attention - Action irréversible
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    Vous êtes sur le point de <strong>supprimer définitivement</strong> toutes les données de la base :
                    <ul className="mt-2 space-y-1">
                      <li className="flex items-center"><XCircle className="h-4 w-4 mr-2 text-red-500" />Tous les étudiants ({stats.totalStudents})</li>
                      <li className="flex items-center"><XCircle className="h-4 w-4 mr-2 text-red-500" />Toutes les conventions ({stats.totalConventions})</li>
                      <li className="flex items-center"><XCircle className="h-4 w-4 mr-2 text-red-500" />Tous les fichiers uploadés</li>
                    </ul>
                    <p className="mt-3 font-semibold text-red-600">
                      Cette action ne peut pas être annulée !
                    </p>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Annuler</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={handleClearDatabase}
                    className="bg-red-600 hover:bg-red-700"
                    disabled={isClearingDatabase}
                  >
                    {isClearingDatabase ? 'Suppression...' : 'Oui, vider la base'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Étudiants</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalStudents}</div>
            <p className="text-xs text-muted-foreground">
              {stats.registeredStudents} comptes créés
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conventions</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalConventions}</div>
            <p className="text-xs text-muted-foreground">
              {stats.submittedConventions} soumises
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Validées</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.validatedConventions}</div>
            <p className="text-xs text-muted-foreground">
              Conventions approuvées
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En Attente</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.pendingConventions + stats.submittedConventions}</div>
            <p className="text-xs text-muted-foreground">
              À traiter
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Progress and Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Registration Progress */}
        <Card>
          <CardHeader>
            <CardTitle>Progression des Inscriptions</CardTitle>
            <CardDescription>
              Pourcentage d'étudiants ayant créé leur compte
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Comptes créés</span>
              <span className="text-sm text-muted-foreground">
                {stats.registeredStudents}/{stats.totalStudents}
              </span>
            </div>
            <Progress value={registrationPercentage} className="h-2" />
            <p className="text-xs text-muted-foreground">
              {registrationPercentage.toFixed(1)}% des étudiants sont inscrits
            </p>
          </CardContent>
        </Card>

        {/* Convention Status */}
        <Card>
          <CardHeader>
            <CardTitle>État des Conventions</CardTitle>
            <CardDescription>
              Répartition par statut
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-orange-500" />
                <span className="text-sm">En attente</span>
              </div>
              <Badge variant="secondary">{stats.pendingConventions}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Upload className="h-4 w-4 text-blue-500" />
                <span className="text-sm">Envoyées</span>
              </div>
              <Badge variant="secondary">{stats.submittedConventions}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">Validées</span>
              </div>
              <Badge variant="secondary">{stats.validatedConventions}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <XCircle className="h-4 w-4 text-red-500" />
                <span className="text-sm">Rejetées</span>
              </div>
              <Badge variant="secondary">{stats.rejectedConventions}</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Students by Filiere */}
        <Card>
          <CardHeader>
            <CardTitle>Étudiants par Filière</CardTitle>
            <CardDescription>
              Répartition des étudiants
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {Object.entries(studentsByFiliere).map(([filiere, count]) => (
              <div key={filiere} className="flex items-center justify-between">
                <span className="text-sm font-medium">{filiere}</span>
                <Badge variant="outline">{count as number}</Badge>
              </div>
            ))}
            {Object.keys(studentsByFiliere).length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                Aucune donnée disponible
              </p>
            )}
          </CardContent>
        </Card>

        {/* Conventions by Type */}
        <Card>
          <CardHeader>
            <CardTitle>Conventions par Type</CardTitle>
            <CardDescription>
              Répartition par type de stage
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {Object.entries(conventionsByType).map(([type, count]) => {
              const typeLabels: Record<string, string> = {
                'initiation': 'Stage d\'initiation (1ère année)',
                'fin_annee': 'Stage de fin d\'année (2ème année)',
                'fin_etudes': 'Stage de fin d\'études (3ème année)'
              };
              
              return (
                <div key={type} className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    {typeLabels[type] || type}
                  </span>
                  <Badge variant="outline">{count as number}</Badge>
                </div>
              );
            })}
            {Object.keys(conventionsByType).length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                Aucune convention générée
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Activité Récente</CardTitle>
          <CardDescription>
            Dernières conventions soumises
          </CardDescription>
        </CardHeader>
        <CardContent>
          {conventions.slice(0, 5).map((convention: any) => (
            <div key={convention.id} className="flex items-center justify-between py-2 border-b last:border-b-0">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 rounded-full bg-primary"></div>
                <div>
                  <p className="text-sm font-medium">
                    {convention.student?.nom || 'Étudiant inconnu'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {convention.typeStage} • {convention.student?.filiere}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <Badge 
                  variant={
                    convention.status === 'valide' ? 'default' :
                    convention.status === 'rejete' ? 'destructive' :
                    convention.status === 'envoye' ? 'secondary' : 'outline'
                  }
                >
                  {convention.status === 'en_attente' && 'En attente'}
                  {convention.status === 'envoye' && 'Envoyée'}
                  {convention.status === 'valide' && 'Validée'}
                  {convention.status === 'rejete' && 'Rejetée'}
                </Badge>
                <p className="text-xs text-muted-foreground mt-1">
                  {convention.generatedAt && new Date(convention.generatedAt).toLocaleDateString('fr-FR')}
                </p>
              </div>
            </div>
          ))}
          {conventions.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-8">
              Aucune activité récente
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}