# 📋 Récapitulatif des Routes API - Horas

> **Documentation complète des routes avec permissions**  
> Date: 12 Octobre 2025

---

## 🎯 Vue d'ensemble

Cette API est documentée dans **Swagger** accessible via `/api/docs`.

**Organisation :**
- ✅ **Routes actives** (implémentées)
- 🔮 **Routes à venir** (documentées dans Swagger, non implémentées)

---

## ✅ ROUTES ACTIVES

### 1. Health Check

| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| GET | `/api/health` | Vérifier l'état de l'API | Non |

---

### 2. Authentication

| Méthode | Endpoint | Description | Permissions | Auth |
|---------|----------|-------------|-------------|------|
| POST | `/api/users/register` | Auto-inscription (employe) | Public | Non |
| POST | `/api/users/register/employe` | Créer un employé | Manager, Admin | JWT |
| POST | `/api/users/register/manager` | Créer un manager | Admin | JWT |
| POST | `/api/users/login` | Connexion | Public | Non |

---

## 🔮 ROUTES À VENIR

### 3. Users Management

| Méthode | Endpoint | Description | Permissions | Auth |
|---------|----------|-------------|-------------|------|
| GET | `/api/users` | Liste des utilisateurs | Tous | JWT |
| GET | `/api/users/:id` | Détail d'un utilisateur | Tous | JWT |
| PATCH | `/api/users/:id` | Modifier un utilisateur | Employé (soi-même), Manager (son équipe), Admin (tous) | JWT |
| DELETE | `/api/users/:id` | Supprimer un utilisateur | Admin | JWT |
| PATCH | `/api/users/:id/password` | Changer son mot de passe | Propriétaire uniquement | JWT |

**Query Params (GET /users) :**
- `role` : 'admin' \| 'manager' \| 'employe'
- `teamId` : number
- `isActive` : boolean
- `search` : string (lastName/prélastName/email)

---

### 4. Équipes

| Méthode | Endpoint | Description | Permissions | Auth |
|---------|----------|-------------|-------------|------|
| GET | `/api/teams` | Liste des équipes | Tous | JWT |
| GET | `/api/teams/:id` | Détail d'une équipe | Tous | JWT |
| POST | `/api/teams` | Créer une équipe | Admin | JWT |
| PATCH | `/api/teams/:id` | Modifier une équipe | Admin | JWT |
| DELETE | `/api/teams/:id` | Supprimer une équipe | Admin | JWT |

**Query Params (GET /teams/:id) :**
- `include=members` : Inclure la liste complète des members

---

### 5. Schedules

| Méthode | Endpoint | Description | Permissions | Auth |
|---------|----------|-------------|-------------|------|
| GET | `/api/schedules` | Liste des schedules | Tous | JWT |
| GET | `/api/schedules/:id` | Détail d'un schedule | Tous | JWT |
| POST | `/api/schedules` | Créer un schedule | Admin, Manager | JWT |
| PATCH | `/api/schedules/:id` | Modifier un schedule | Admin, Manager | JWT |
| DELETE | `/api/schedules/:id` | Supprimer un schedule | Admin | JWT |

**Query Params (GET /schedules/:id) :**
- `include=utilisateurs` : Inclure la liste des utilisateurs assignés

**Format des données :**
- `heureDebut` / `heureFin` : "HH:mm" (ex: "09:00")
- `joursActifs` : Array de 1 à 7 (1=Lundi, 7=Dimanche)

---

### 6. Timesheets

#### 🔑 Architecture Simplifiée

**Pas de DTO de création côté client** — Tout est géré automatiquement :
- ✅ `employeId` extrait du JWT
- ✅ Date et heure au moment de la requête
- ✅ Statut calculé automatiquement selon l'schedule de l'employé

#### Routes

| Méthode | Endpoint | Description | Permissions | Auth |
|---------|----------|-------------|-------------|------|
| POST | `/api/timesheets/clockin` | Pointer l'entrée | Tous (employé pointe lui-même) | JWT |
| POST | `/api/timesheets/clockout` | Pointer la sortie | Tous (employé pointe lui-même) | JWT |
| GET | `/api/timesheets` | Liste des timesheets | Employé (ses timesheets), Manager (son équipe), Admin (tous) | JWT |
| GET | `/api/timesheets/:id` | Détail d'un timesheet | Selon permissions | JWT |
| GET | `/api/timesheets/stats` | Statistiques de timesheet | Employé (ses stats), Manager (son équipe), Admin (tous) | JWT |
| PATCH | `/api/timesheets/:id` | ⚠️ Corriger un timesheet | **Manager, Admin** | JWT |
| DELETE | `/api/timesheets/:id` | ⚠️ Supprimer un timesheet | **Manager, Admin** | JWT |

**Query Params (GET /timesheets) :**
- `employeId` : number (Manager/Admin uniquement)
- `dateDebut` : YYYY-MM-DD
- `dateFin` : YYYY-MM-DD
- `status` : 'normal' \| 'retard' \| 'absence' \| 'incomplet'
- `clockin` : boolean (true=entrées, false=sorties)

**Query Params (GET /timesheets/stats) :**
- `employeId` : number (requis)
- `dateDebut` : YYYY-MM-DD (requis)
- `dateFin` : YYYY-MM-DD (requis)

---

## 🔐 Matrice des Permissions

### Légende
- 👤 **Employé** : Peut voir/modifier ses propres données
- 👔 **Manager** : Peut gérer son équipe
- 👑 **Admin** : Accès total

### Tableau Récapitulatif

| Ressource | GET List | GET Detail | POST | PATCH | DELETE |
|-----------|----------|------------|------|-------|--------|
| **Users** | 👤👔👑 | 👤👔👑 | 👔👑 | 👤(soi)👔(équipe)👑 | 👑 |
| **Équipes** | 👤👔👑 | 👤👔👑 | 👑 | 👑 | 👑 |
| **Schedules** | 👤👔👑 | 👤👔👑 | 👔👑 | 👔👑 | 👑 |
| **Timesheets** | 👤(soi)👔(équipe)👑 | 👤(soi)👔(équipe)👑 | 👤👔👑 | 👔👑 | 👔👑 |

### Cas Particuliers

**Timesheets :**
- **POST /clockin & /clockout** : Tous peuvent pointer pour eux-mêmes uniquement
- **PATCH & DELETE** : Uniquement Manager et Admin (corrections manuelles)

**Users :**
- Un employé peut **modifier son propre profil** (lastName, téléphone, etc.)
- Seul un Admin peut **changer le rôle** d'un utilisateur

---

## 📊 Codes de Réponse HTTP

| Code | Signification | Exemples |
|------|--------------|----------|
| 200 | Succès | GET, PATCH réussi |
| 201 | Créé | POST réussi |
| 400 | Requête invalide | Données manquantes ou invalides |
| 401 | Non authentifié | Token manquant ou expiré |
| 403 | Non autorisé | Permissions insuffisantes |
| 404 | Non trouvé | Ressource inexistante |
| 409 | Conflit | Email déjà utilisé, timesheet en double |
| 500 | Erreur serveur | Erreur interne |

---

## 🔑 Authentification JWT

### Header requis pour les routes protégées

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Contenu du JWT (payload décodé)

```json
{
  "sub": 10,
  "email": "pierre.martin@example.com",
  "firstName": "Pierre",
  "lastName": "Martin",
  "role": "employe",
  "isActive": true,
  "lastLoginAt": "2025-10-12T10:00:00.000Z",
  "exp": 1728737400,
  "iat": 1728735600,
  "type": "access"
}
```

### Durée de validité
- **30 minutes** par défaut (configurable via `JWT_EXPIRE_MINUTES`)

---

## 📝 Exemples d'Utilisation

### Exemple 1 : Timesheet d'entrée

```bash
# L'employé pointe son arrivée
POST /api/timesheets/clockin
Authorization: Bearer {token}

# Pas de body nécessaire !
# Réponse automatique avec tous les détails
```

### Exemple 2 : Correction de timesheet (Manager)

```bash
# Le manager corrige l'heure d'arrivée d'un employé
PATCH /api/timesheets/42
Authorization: Bearer {token_manager}
Content-Type: application/json

{
  "heure": "09:00:00"
}
```

### Exemple 3 : Statistiques d'un employé

```bash
# Récupérer les stats d'un employé pour le mois d'octobre
GET /api/timesheets/stats?employeId=10&dateDebut=2025-10-01&dateFin=2025-10-31
Authorization: Bearer {token}
```

---

## 🚀 Prochaines Étapes

### Phase 1 - Gestion des Utilisateurs ✅
- [x] DTOs créés
- [x] Schémas Swagger documentés
- [ ] Implémentation des contrôleurs
- [ ] Implémentation des use cases
- [ ] Tests unitaires

### Phase 2 - Gestion des Équipes
- [x] DTOs créés
- [x] Schémas Swagger documentés
- [ ] Entités métier
- [ ] Repositories
- [ ] Use cases
- [ ] Contrôleurs
- [ ] Tests

### Phase 3 - Gestion des Schedules
- [x] DTOs créés
- [x] Schémas Swagger documentés
- [ ] Entités métier
- [ ] Repositories
- [ ] Use cases
- [ ] Contrôleurs
- [ ] Tests

### Phase 4 - Gestion des Timesheets
- [x] DTOs créés
- [x] Schémas Swagger documentés
- [ ] Logique métier (calcul statut automatique)
- [ ] Repositories
- [ ] Use cases
- [ ] Contrôleurs
- [ ] Tests

---

## 📚 Documentation Complète

- **Swagger Interactive** : `http://localhost/api/docs`
- **Référence DTOs** : Voir `FRONTEND_TYPES.ts`
- **Types Frontend** : Copier dans votre projet Next.js

---

## ✅ Cohérence Vérifiée

### Architecture
✅ Clean Architecture respectée (Domain → Application → Infrastructure → Presentation)  
✅ DTOs bien séparés des entités métier  
✅ Swagger organisé par domaine métier  
✅ Permissions clairement définies  

### Sécurité
✅ Toutes les routes sensibles protégées par JWT  
✅ Permissions par rôle bien documentées  
✅ Correction de timesheets réservée aux Managers/Admins  
✅ Validation des données entrantes via DTOs  

### Logique Métier
✅ Timesheets automatiques (pas de création manuelle côté client)  
✅ Statut calculé automatiquement côté serveur  
✅ Employé ne peut modifier que ses propres données  
✅ Manager peut gérer son équipe uniquement  
✅ Admin a tous les droits  

### Documentation
✅ Swagger complet avec exemples  
✅ Types TypeScript exportés pour le frontend  
✅ Permissions documentées par route  
✅ Erreurs possibles documentées  

---

**Document maintenu par :** Équipe Backend  
**Dernière mise à jour :** 12 Octobre 2025  
**Version API :** 1.0.0

