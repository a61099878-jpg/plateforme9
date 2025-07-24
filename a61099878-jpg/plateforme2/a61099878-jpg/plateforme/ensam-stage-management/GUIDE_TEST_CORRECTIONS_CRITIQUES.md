# 🧪 Guide de Test - Corrections Critiques Finales

## 🚀 Préparation
```bash
cd ensam-stage-management
npm run dev
```
Application sur `http://localhost:5173`

**Comptes de test :**
- **Admin** : `admin@ensam.ma` / `admin123`
- **Étudiant 1** : `etudiant1@ensam.ma` / `etudiant123`
- **Étudiant 2** : `etudiant2@ensam.ma` / `etudiant123`

---

## 🔒 **Test 1 : Cache Utilisateur Sécurisé** (CRITIQUE)

### Objectif
Vérifier qu'un étudiant ne voit jamais les données d'un autre étudiant

### Étapes
1. **Première connexion**
   - Se connecter avec `etudiant1@ensam.ma` / `etudiant123`
   - Noter le nom/profil affiché
   - Se déconnecter proprement

2. **Deuxième connexion**
   - Se connecter avec `etudiant2@ensam.ma` / `etudiant123`
   - ✅ **CRITIQUE** : Vérifier immédiatement que le nom/profil correspond à l'étudiant 2
   - ✅ **CRITIQUE** : Aucune donnée de l'étudiant 1 ne doit apparaître

3. **Test de persistence**
   - Actualiser la page (F5)
   - ✅ **Vérifier** : Données toujours correctes pour l'étudiant 2

### ❌ Échec si
- Nom de l'étudiant 1 apparaît temporairement
- Profil incohérent affiché
- Données mélangées entre utilisateurs

---

## 🗑️ **Test 2 : Bouton "Vider la Base"**

### Objectif
Valider le fonctionnement sécurisé du bouton de vidage pour admin

### Étapes
1. **Préparation**
   - Se connecter en tant qu'admin
   - Aller sur le Dashboard Admin
   - Ajouter quelques étudiants de test (si aucun)

2. **Localisation du bouton**
   - Chercher en haut à droite : bouton rouge "Vider la base"
   - ✅ **Vérifier** : Icône corbeille visible

3. **Dialog de confirmation**
   - Cliquer sur "Vider la base"
   - ✅ **Vérifier** : Dialog avec ⚠️ "Attention - Action irréversible"
   - ✅ **Vérifier** : Liste détaillée (X étudiants, X conventions, fichiers)
   - ✅ **Vérifier** : Bouton rouge "Oui, vider la base"

4. **Vidage complet**
   - Cliquer "Oui, vider la base"
   - ✅ **Vérifier** : Message de succès avec statistiques
   - ✅ **Vérifier** : Dashboard admin affiche 0 étudiants/conventions
   - ✅ **Vérifier** : Auto-refresh actualise les données

### ❌ Échec si
- Bouton non visible ou non fonctionnel
- Pas de confirmation ou confirmation insuffisante
- Données non supprimées complètement

---

## 🎯 **Test 3 : Convention Unique**

### Objectif
Confirmer qu'un étudiant ne peut générer qu'une seule convention

### Étapes
1. **Première génération**
   - Se connecter avec un étudiant n'ayant pas de convention
   - Aller sur "Ma Convention"
   - ✅ **Vérifier** : Bouton "Générer Convention (HTML → PDF)" actif
   - ✅ **Vérifier** : Message d'avertissement "Une seule convention autorisée"

2. **Génération réussie**
   - Cliquer sur "Générer Convention"
   - ✅ **Vérifier** : Nouvel onglet avec convention PDF
   - ✅ **Vérifier** : Toast de succès

3. **Retour sur la page**
   - Revenir sur "Ma Convention"
   - ✅ **CRITIQUE** : Bouton devient "Convention déjà générée" (grisé)
   - ✅ **CRITIQUE** : Card verte "Convention déjà générée" visible
   - ✅ **CRITIQUE** : Plus de possibilité de régénérer

4. **Test d'erreur backend**
   - Tenter d'accéder directement à `/api/student/convention/generate`
   - ✅ **Vérifier** : Erreur 400 avec message approprié

### ❌ Échec si
- Possibilité de générer plusieurs conventions
- Bouton reste actif après génération
- Pas de feedback visuel approprié

---

## 🧹 **Test 4 : Interface Simplifiée**

### Objectif
Valider la suppression des éléments UI non désirés

### Étapes
1. **Menu utilisateur simplifié**
   - Se connecter (admin ou étudiant)
   - Cliquer sur l'icône utilisateur (coin supérieur droit)
   - ✅ **Vérifier** : Seulement "Déconnexion" visible
   - ✅ **Vérifier** : Pas d'option "Paramètres"

2. **Espace étudiant épuré**
   - Se connecter en tant qu'étudiant
   - Aller sur "Ma Convention"
   - ✅ **Vérifier** : Pas de bouton "Options avancées"
   - Aller sur "Tableau de bord"
   - ✅ **Vérifier** : Pas de bouton "Générer Convention" redondant

3. **Navigation fluide**
   - Tester la navigation entre pages
   - ✅ **Vérifier** : Interface cohérente et épurée

### ❌ Échec si
- Boutons/options supprimés toujours visibles
- Interface confuse ou éléments redondants

---

## 🔄 **Test 5 : Régression Générale**

### Objectif
S'assurer que toutes les fonctionnalités existantes marchent toujours

### Fonctionnalités Admin
- ✅ Gestion étudiants (CRUD)
- ✅ Import/Export CSV
- ✅ Gestion conventions (validation/rejet)
- ✅ Download fichiers étudiants

### Fonctionnalités Étudiant
- ✅ Génération convention (une fois)
- ✅ Upload fichier signé
- ✅ Suivi statut en temps réel
- ✅ Dashboard informatif

### Auto-refresh et Sync
- ✅ Données mises à jour automatiquement
- ✅ Indicateur de synchronisation
- ✅ Bouton actualiser manuel

---

## 📊 **Checklist de Validation Complète**

### ✅ Sécurité
- [ ] Cache utilisateur nettoyé entre connexions
- [ ] Aucune fuite de données entre comptes
- [ ] Bouton "Vider la base" sécurisé et fonctionnel
- [ ] Règle convention unique respectée

### ✅ Interface Utilisateur
- [ ] Menu simplifié (pas de "Paramètres")
- [ ] Pas de boutons "Options avancées" redondants
- [ ] Feedback visuel approprié (boutons désactivés)
- [ ] Messages d'erreur clairs et utiles

### ✅ Fonctionnalités
- [ ] Toutes fonctionnalités admin préservées
- [ ] Toutes fonctionnalités étudiant préservées
- [ ] Auto-refresh fonctionne
- [ ] Données persistent correctement

### ✅ Stabilité
- [ ] Pas de crash ou erreurs console
- [ ] Performance maintenue
- [ ] Comportement cohérent sur actualisation

---

## 🚨 **Tests Prioritaires en Production**

### Tests Obligatoires Avant Déploiement
1. **Test cache utilisateur** avec comptes réels
2. **Test règle convention unique** avec étudiants test
3. **Backup base de données** avant test bouton "Vider"

### Tests de Stress
- Connexions/déconnexions rapides multiples
- Tentatives de génération convention multiple
- Actualisation répétée des pages

---

## 📞 **Dépannage Rapide**

### Problème : Cache utilisateur incorrect
- **Solution** : Vider localStorage du navigateur
- **Prévention** : Tester en navigation privée

### Problème : Bouton "Vider la base" inactif
- **Vérification** : S'assurer d'être connecté en tant qu'admin
- **Solution** : Réactualiser la page admin

### Problème : Convention multiple autorisée
- **Vérification** : Base de données contient-elle déjà une convention ?
- **Solution** : Vérifier logs backend pour erreurs

---

*Guide de test créé le 24 juillet 2025*  
*Durée estimée pour tests complets : 20-25 minutes*