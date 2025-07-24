# 🧪 Guide de Test - Améliorations UX et Synchronisation

## 🚀 Préparation des Tests

### Démarrage de l'Application
```bash
cd ensam-stage-management
npm run dev
```
L'application démarre sur `http://localhost:5173`

### Comptes de Test
- **Admin** : `admin@ensam.ma` / `admin123`
- **Étudiant** : `etudiant@ensam.ma` / `etudiant123`

---

## 📋 Scénarios de Test

### 🔐 Test 1 : Déconnexion Simplifiée

#### Objectif
Vérifier que la déconnexion est unifiée et sécurisée par défaut

#### Étapes
1. **Connexion**
   - Aller sur `http://localhost:5173`
   - Se connecter avec `admin@ensam.ma` / `admin123`

2. **Interface de déconnexion**
   - Cliquer sur l'icône utilisateur (coin supérieur droit)
   - ✅ **Vérifier** : Un seul bouton "Déconnexion" visible
   - ✅ **Vérifier** : Pas de mention "Sécurisée" ou "Normale"

3. **Déconnexion**
   - Cliquer sur "Déconnexion"
   - ✅ **Vérifier** : Redirection immédiate vers `/login`

4. **Sécurité au redémarrage**
   - Redémarrer l'application (`Ctrl+C` puis `npm run dev`)
   - Aller sur `http://localhost:5173`
   - ✅ **Vérifier** : Affichage direct de la page de login (pas de session persistante)

#### Résultat Attendu
✅ Interface simplifiée + déconnexion sécurisée automatique

---

### 🔄 Test 2 : Actualisation Sans Déconnexion

#### Objectif
Confirmer que F5/actualisation ne déconnecte plus l'utilisateur

#### Étapes
1. **Connexion et navigation**
   - Se connecter avec `admin@ensam.ma` / `admin123`
   - Aller sur le dashboard admin

2. **Actualisation page**
   - Appuyer sur `F5` ou cliquer sur actualiser
   - ✅ **Vérifier** : Reste sur le dashboard admin
   - ✅ **Vérifier** : Pas de redirection vers login
   - ✅ **Vérifier** : Données rechargées correctement

3. **Actualisation répétée**
   - Faire plusieurs actualisations successives
   - ✅ **Vérifier** : Reste connecté à chaque fois

4. **Test avec étudiant**
   - Se déconnecter et se connecter avec `etudiant@ensam.ma`
   - Répéter le test d'actualisation sur le dashboard étudiant
   - ✅ **Vérifier** : Comportement identique

#### Résultat Attendu
✅ Actualisation conserve la session utilisateur

---

### 📊 Test 3 : Indicateur de Synchronisation

#### Objectif
Vérifier le fonctionnement de l'indicateur d'état des données

#### Étapes
1. **Observation initiale**
   - Se connecter et aller sur le dashboard
   - Localiser l'indicateur de sync (coin supérieur droit)
   - ✅ **Vérifier** : Affichage "À jour" avec icône verte

2. **Rechargement manuel**
   - Cliquer sur le bouton "Actualiser"
   - ✅ **Vérifier** : Statut change temporairement à "Synchronisation..."
   - ✅ **Vérifier** : Icône de chargement animée
   - ✅ **Vérifier** : Retour à "À jour" après chargement

3. **Test de timestamp**
   - Noter l'heure affichée ("il y a X min")
   - Attendre 2-3 minutes
   - Actualiser manuellement
   - ✅ **Vérifier** : Timestamp mis à jour à "à l'instant"

4. **Test hors ligne**
   - Couper la connexion internet (WiFi off)
   - Attendre quelques secondes
   - ✅ **Vérifier** : Statut change à "Hors ligne"
   - ✅ **Vérifier** : Icône WiFi barrée
   - Rétablir la connexion
   - ✅ **Vérifier** : Retour automatique à "À jour"

#### Résultat Attendu
✅ Indicateur reflète fidèlement l'état de synchronisation

---

### ⚡ Test 4 : Auto-Refresh Automatique

#### Objectif
Valider le rechargement automatique des données

#### Étapes
1. **Préparation**
   - Ouvrir 2 onglets sur `http://localhost:5173`
   - Onglet 1 : Dashboard admin connecté
   - Onglet 2 : Page de gestion des étudiants admin

2. **Modification de données**
   - Dans l'onglet 2, ajouter un nouvel étudiant
   - Noter le nombre total d'étudiants avant ajout

3. **Observation auto-refresh**
   - Revenir sur l'onglet 1 (dashboard)
   - Attendre maximum 30 secondes
   - ✅ **Vérifier** : Nombre d'étudiants mis à jour automatiquement
   - ✅ **Vérifier** : Indicateur montre brièvement "Synchronisation..."

4. **Test focus-refresh**
   - Minimiser la fenêtre ou changer d'application
   - Attendre 1 minute
   - Revenir sur la fenêtre de l'app
   - ✅ **Vérifier** : Rafraîchissement automatique au focus

#### Résultat Attendu
✅ Données mises à jour automatiquement sans intervention

---

### 🎯 Test 5 : Optimisation Performance

#### Objectif
Vérifier que l'auto-refresh n'impacte pas les performances

#### Étapes
1. **Test onglet inactif**
   - Se connecter sur le dashboard
   - Ouvrir les outils développeur (F12)
   - Aller sur l'onglet Network
   - Changer d'onglet (laisser l'app en arrière-plan)
   - Attendre 2 minutes
   - ✅ **Vérifier** : Peu ou pas de requêtes réseau pendant l'inactivité

2. **Test onglet actif**
   - Revenir sur l'onglet de l'app
   - Observer les requêtes dans Network
   - ✅ **Vérifier** : Reprise des requêtes automatiques
   - ✅ **Vérifier** : Fréquence raisonnable (~30 secondes)

3. **Test bouton actualiser**
   - Cliquer plusieurs fois rapidement sur "Actualiser"
   - ✅ **Vérifier** : Bouton devient disabled pendant le chargement
   - ✅ **Vérifier** : Pas de requêtes multiples simultanées

#### Résultat Attendu
✅ Performance optimisée et gestion intelligente des requêtes

---

## 🏁 Test Complet de Régression

### Vérification Fonctionnalités Existantes

#### Gestion Admin
1. **Étudiants** : CRUD fonctionne normalement
2. **Conventions** : Validation/rejet opérationnel
3. **Import CSV** : Toujours fonctionnel
4. **Download fichiers** : Pas d'impact

#### Espace Étudiant
1. **Génération convention** : Pas d'impact
2. **Upload fichier** : Toujours opérationnel
3. **Suivi statut** : Mise à jour en temps réel

### Compatibilité Navigateurs
- ✅ **Chrome** : Toutes fonctionnalités OK
- ✅ **Firefox** : Toutes fonctionnalités OK  
- ✅ **Safari** : Toutes fonctionnalités OK
- ✅ **Edge** : Toutes fonctionnalités OK

---

## 🚨 Points d'Attention

### Comportements Attendus
- **Déconnexion** : Toujours sécurisée (logout au restart)
- **Actualisation** : Conserve la session mais recharge les données
- **Auto-refresh** : 30 secondes, pause si onglet inactif
- **Indicateur** : Temps réel, reflète l'état exact

### Dépannage Rapide
- **Indicateur bloqué** : Vérifier la connexion internet
- **Pas d'auto-refresh** : Vérifier que l'onglet est actif
- **Déconnexion inattendue** : Normal au redémarrage serveur

---

## 📊 Checklist de Validation

### ✅ Tests Fonctionnels
- [ ] Déconnexion unifiée et sécurisée
- [ ] Actualisation conserve la session
- [ ] Indicateur de sync fonctionne
- [ ] Auto-refresh opérationnel
- [ ] Performance optimisée

### ✅ Tests Non-Régressifs
- [ ] Toutes fonctionnalités admin préservées
- [ ] Toutes fonctionnalités étudiant préservées
- [ ] Import/export toujours fonctionnel
- [ ] Génération PDF conventions OK

### ✅ Tests UX
- [ ] Interface plus épurée
- [ ] Feedback visuel approprié
- [ ] Pas de déconnexions non désirées
- [ ] Données toujours à jour

---

*Guide de test créé le 24 juillet 2025*  
*Durée estimée des tests complets : 15-20 minutes*