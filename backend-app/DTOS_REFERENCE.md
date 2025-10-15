# 📚 Référence Complète des DTOs - API Horas

> **Document pour l'équipe Frontend**  
> Ce document liste tous les formats de requêtes et réponses disponibles pour le mock.  
> Date: 12 Octobre 2025

---

## 🎯 Vue d'ensemble

Cette API suit une architecture REST avec des réponses standardisées :

```typescript
// Format de réponse standard (succès)
{
  "success": true,
  "data": { /* ... */ },
  "message": "Message de confirmation",
  "timestamp": "2025-10-12T10:00:00.000Z"
}

// Format de réponse standard (erreur)
{
  "success": false,
  "error": "lastName de l'erreur",
  "code": "ERROR_CODE",
  "timestamp": "2025-10-12T10:00:00.000Z"
}
```

---

## 👤 1. USER / AUTHENTICATION

### 1.1 Inscription (Register)

**Endpoint:** `POST /api/users/register`

**Request Body:**
```json
{
  "firstName": "Jean",
  "lastName": "Dupont",
  "email": "jean.dupont@example.com",
  "password": "SecureP@ss123",
  "role": "employe",
  "telephone": "+33 6 12 34 56 78",
  "equipeId": 5,
  "plageHoraireId": 2
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "tokenType": "bearer",
    "expiresIn": 1800,
    "user": {
      "id": 1,
      "firstName": "Jean",
      "lastName": "Dupont",
      "email": "jean.dupont@example.com",
      "role": "employe",
      "isActive": false,
      "telephone": "+33 6 12 34 56 78",
      "equipeId": 5,
      "plageHoraireId": 2,
      "createdAt": "2025-10-12T10:00:00.000Z",
      "updatedAt": "2025-10-12T10:00:00.000Z",
      "deletedAt": null
    },
    "role": "employe"
  },
  "message": "Utilisateur inscrit avec succès",
  "timestamp": "2025-10-12T10:00:00.000Z"
}
```

---

### 1.2 Connexion (Login)

**Endpoint:** `POST /api/users/login`

**Request Body:**
```json
{
  "email": "jean.dupont@example.com",
  "password": "SecureP@ss123"
}
```

**Response (200):** *(même format que Register)*

---

### 1.3 Création d'employé (Manager/Admin uniquement)

**Endpoint:** `POST /api/users/register/employe`  
**Headers:** `Authorization: Bearer {token}`  
**Permissions:** Manager ou Admin

**Request Body:** *(même que Register)*

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": 10,
    "firstName": "Pierre",
    "lastName": "Martin",
    "email": "pierre.martin@example.com",
    "role": "employe",
    "isActive": false,
    "telephone": null,
    "equipeId": null,
    "plageHoraireId": null,
    "createdAt": "2025-10-12T10:00:00.000Z",
    "updatedAt": "2025-10-12T10:00:00.000Z",
    "deletedAt": null
  },
  "message": "Utilisateur inscrit avec succès",
  "timestamp": "2025-10-12T10:00:00.000Z"
}
```

---

### 1.4 Création de manager (Admin uniquement)

**Endpoint:** `POST /api/users/register/manager`  
**Headers:** `Authorization: Bearer {token}`  
**Permissions:** Admin uniquement

**Request Body:** *(même que Register avec role="manager")*

---

### 1.5 Liste des utilisateurs

**Endpoint:** `GET /api/users`  
**Query Params (optionnels):**
- `role` : 'admin' | 'manager' | 'employe'
- `equipeId` : number
- `isActive` : boolean
- `search` : string (recherche lastName/prélastName/email)

**Example:** `GET /api/users?role=employe&equipeId=5&isActive=true`

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 10,
      "firstName": "Pierre",
      "lastName": "Martin",
      "email": "pierre.martin@example.com",
      "role": "employe",
      "isActive": true,
      "equipeId": 5,
      "equipelastName": "Équipe Production"
    },
    {
      "id": 11,
      "firstName": "Marie",
      "lastName": "Durand",
      "email": "marie.durand@example.com",
      "role": "employe",
      "isActive": true,
      "equipeId": 5,
      "equipelastName": "Équipe Production"
    }
  ],
  "message": "Liste des utilisateurs récupérée avec succès",
  "timestamp": "2025-10-12T10:00:00.000Z"
}
```

---

### 1.6 Détail d'un utilisateur

**Endpoint:** `GET /api/users/:id`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 10,
    "firstName": "Pierre",
    "lastName": "Martin",
    "email": "pierre.martin@example.com",
    "role": "employe",
    "isActive": true,
    "telephone": "+33 6 12 34 56 78",
    "equipeId": 5,
    "plageHoraireId": 2,
    "createdAt": "2025-10-01T10:00:00.000Z",
    "updatedAt": "2025-10-12T10:00:00.000Z",
    "deletedAt": null,
    "equipe": {
      "id": 5,
      "lastName": "Équipe Production"
    },
    "horaire": {
      "id": 2,
      "lastName": "Horaire de journée",
      "heureDebut": "09:00",
      "heureFin": "17:30"
    }
  },
  "message": "Utilisateur récupéré avec succès",
  "timestamp": "2025-10-12T10:00:00.000Z"
}
```

---

### 1.7 Mise à jour d'un utilisateur

**Endpoint:** `PATCH /api/users/:id`  
**Headers:** `Authorization: Bearer {token}`

**Request Body (tous les champs optionnels):**
```json
{
  "firstName": "Pierre",
  "lastName": "Martin-Dupont",
  "email": "pierre.martin@example.com",
  "telephone": "+33 6 99 88 77 66",
  "role": "manager",
  "isActive": true,
  "equipeId": 7,
  "plageHoraireId": 3
}
```

**Response (200):** *(UserReadDTO complet)*

---

### 1.8 Changer le mot de passe

**Endpoint:** `PATCH /api/users/:id/password`  
**Headers:** `Authorization: Bearer {token}`

**Request Body:**
```json
{
  "oldPassword": "OldP@ss123",
  "newPassword": "NewP@ss456"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Mot de passe modifié avec succès",
  "timestamp": "2025-10-12T10:00:00.000Z"
}
```

---

## 🏢 2. ÉQUIPES (EQUIPE)

### 2.1 Créer une équipe

**Endpoint:** `POST /api/equipes`  
**Headers:** `Authorization: Bearer {token}`  
**Permissions:** Admin

**Request Body:**
```json
{
  "lastName": "Équipe Production",
  "description": "Équipe responsable de la production du matin",
  "managerId": 5
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "lastName": "Équipe Production",
    "description": "Équipe responsable de la production du matin",
    "managerId": 5,
    "createdAt": "2025-10-12T10:00:00.000Z",
    "updatedAt": "2025-10-12T10:00:00.000Z",
    "deletedAt": null,
    "manager": {
      "id": 5,
      "firstName": "Marie",
      "lastName": "Durand",
      "email": "marie.durand@example.com",
      "role": "manager"
    },
    "membresCount": 0
  },
  "message": "Équipe créée avec succès",
  "timestamp": "2025-10-12T10:00:00.000Z"
}
```

---

### 2.2 Liste des équipes

**Endpoint:** `GET /api/equipes`

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "lastName": "Équipe Production",
      "description": "Équipe responsable de la production",
      "managerId": 5,
      "managerlastName": "Marie Durand",
      "membresCount": 12,
      "createdAt": "2025-10-01T10:00:00.000Z"
    },
    {
      "id": 2,
      "lastName": "Équipe Logistique",
      "description": null,
      "managerId": 6,
      "managerlastName": "Jean Martin",
      "membresCount": 8,
      "createdAt": "2025-10-05T10:00:00.000Z"
    }
  ],
  "message": "Liste des équipes récupérée avec succès",
  "timestamp": "2025-10-12T10:00:00.000Z"
}
```

---

### 2.3 Détail d'une équipe

**Endpoint:** `GET /api/equipes/:id`  
**Query Params (optionnels):**
- `include=membres` : inclure la liste complète des membres

**Response (200) sans `include=membres`:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "lastName": "Équipe Production",
    "description": "Équipe responsable de la production",
    "managerId": 5,
    "createdAt": "2025-10-01T10:00:00.000Z",
    "updatedAt": "2025-10-12T10:00:00.000Z",
    "deletedAt": null,
    "manager": {
      "id": 5,
      "firstName": "Marie",
      "lastName": "Durand",
      "email": "marie.durand@example.com",
      "role": "manager"
    },
    "membresCount": 12
  },
  "message": "Équipe récupérée avec succès",
  "timestamp": "2025-10-12T10:00:00.000Z"
}
```

**Response (200) avec `include=membres`:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "lastName": "Équipe Production",
    "description": "Équipe responsable de la production",
    "managerId": 5,
    "createdAt": "2025-10-01T10:00:00.000Z",
    "updatedAt": "2025-10-12T10:00:00.000Z",
    "deletedAt": null,
    "manager": {
      "id": 5,
      "firstName": "Marie",
      "lastName": "Durand",
      "email": "marie.durand@example.com",
      "role": "manager"
    },
    "membresCount": 2,
    "membres": [
      {
        "id": 10,
        "firstName": "Pierre",
        "lastName": "Martin",
        "email": "pierre.martin@example.com",
        "role": "employe",
        "isActive": true,
        "telephone": "+33 6 12 34 56 78"
      },
      {
        "id": 11,
        "firstName": "Sophie",
        "lastName": "Bernard",
        "email": "sophie.bernard@example.com",
        "role": "employe",
        "isActive": true,
        "telephone": null
      }
    ]
  },
  "message": "Équipe récupérée avec succès",
  "timestamp": "2025-10-12T10:00:00.000Z"
}
```

---

### 2.4 Mettre à jour une équipe

**Endpoint:** `PATCH /api/equipes/:id`  
**Headers:** `Authorization: Bearer {token}`  
**Permissions:** Admin

**Request Body (tous les champs optionnels):**
```json
{
  "lastName": "Équipe Production - Matin",
  "description": "Nouvelle description",
  "managerId": 7
}
```

**Response (200):** *(EquipeReadDTO complet)*

---

### 2.5 Supprimer une équipe

**Endpoint:** `DELETE /api/equipes/:id`  
**Headers:** `Authorization: Bearer {token}`  
**Permissions:** Admin

**Response (200):**
```json
{
  "success": true,
  "message": "Équipe supprimée avec succès",
  "timestamp": "2025-10-12T10:00:00.000Z"
}
```

---

## ⏰ 3. HORAIRES (HORAIRE)

### 3.1 Créer un horaire

**Endpoint:** `POST /api/horaires`  
**Headers:** `Authorization: Bearer {token}`  
**Permissions:** Admin ou Manager

**Request Body:**
```json
{
  "lastName": "Horaire de journée",
  "heureDebut": "09:00",
  "heureFin": "17:30",
  "joursActifs": [1, 2, 3, 4, 5]
}
```

**Notes:**
- `heureDebut` et `heureFin` au format **HH:mm**
- `joursActifs` : tableau de lastNamebres (1=Lundi, 2=Mardi, ..., 7=Dimanche)

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "lastName": "Horaire de journée",
    "heureDebut": "09:00",
    "heureFin": "17:30",
    "joursActifs": [1, 2, 3, 4, 5],
    "createdAt": "2025-10-12T10:00:00.000Z",
    "updatedAt": "2025-10-12T10:00:00.000Z",
    "utilisateursCount": 0
  },
  "message": "Horaire créé avec succès",
  "timestamp": "2025-10-12T10:00:00.000Z"
}
```

---

### 3.2 Liste des horaires

**Endpoint:** `GET /api/horaires`

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "lastName": "Horaire de journée",
      "heureDebut": "09:00",
      "heureFin": "17:30",
      "joursActifs": [1, 2, 3, 4, 5],
      "utilisateursCount": 25
    },
    {
      "id": 2,
      "lastName": "Horaire de nuit",
      "heureDebut": "22:00",
      "heureFin": "06:00",
      "joursActifs": [1, 2, 3, 4, 5, 6, 7],
      "utilisateursCount": 8
    }
  ],
  "message": "Liste des horaires récupérée avec succès",
  "timestamp": "2025-10-12T10:00:00.000Z"
}
```

---

### 3.3 Détail d'un horaire

**Endpoint:** `GET /api/horaires/:id`  
**Query Params (optionnels):**
- `include=utilisateurs` : inclure la liste des utilisateurs assignés

**Response (200) sans `include=utilisateurs`:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "lastName": "Horaire de journée",
    "heureDebut": "09:00",
    "heureFin": "17:30",
    "joursActifs": [1, 2, 3, 4, 5],
    "createdAt": "2025-10-01T10:00:00.000Z",
    "updatedAt": "2025-10-12T10:00:00.000Z",
    "utilisateursCount": 25
  },
  "message": "Horaire récupéré avec succès",
  "timestamp": "2025-10-12T10:00:00.000Z"
}
```

**Response (200) avec `include=utilisateurs`:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "lastName": "Horaire de journée",
    "heureDebut": "09:00",
    "heureFin": "17:30",
    "joursActifs": [1, 2, 3, 4, 5],
    "createdAt": "2025-10-01T10:00:00.000Z",
    "updatedAt": "2025-10-12T10:00:00.000Z",
    "utilisateursCount": 2,
    "utilisateurs": [
      {
        "id": 10,
        "firstName": "Pierre",
        "lastName": "Martin",
        "email": "pierre.martin@example.com",
        "role": "employe"
      },
      {
        "id": 11,
        "firstName": "Sophie",
        "lastName": "Bernard",
        "email": "sophie.bernard@example.com",
        "role": "employe"
      }
    ]
  },
  "message": "Horaire récupéré avec succès",
  "timestamp": "2025-10-12T10:00:00.000Z"
}
```

---

### 3.4 Mettre à jour un horaire

**Endpoint:** `PATCH /api/horaires/:id`  
**Headers:** `Authorization: Bearer {token}`  
**Permissions:** Admin ou Manager

**Request Body (tous les champs optionnels):**
```json
{
  "lastName": "Horaire de journée modifié",
  "heureDebut": "08:30",
  "heureFin": "18:00",
  "joursActifs": [1, 2, 3, 4, 5, 6]
}
```

**Response (200):** *(HoraireReadDTO complet)*

---

### 3.5 Supprimer un horaire

**Endpoint:** `DELETE /api/horaires/:id`  
**Headers:** `Authorization: Bearer {token}`  
**Permissions:** Admin

**Response (200):**
```json
{
  "success": true,
  "message": "Horaire supprimé avec succès",
  "timestamp": "2025-10-12T10:00:00.000Z"
}
```

---

## 📍 4. POINTAGES (POINTAGE)

### 4.1 Créer un pointage (admin/manager)

**Endpoint:** `POST /api/pointages`  
**Headers:** `Authorization: Bearer {token}`  
**Permissions:** Admin ou Manager

**Request Body:**
```json
{
  "employeId": 10,
  "date": "2025-10-12",
  "heure": "09:05:30",
  "clockin": true,
  "status": "normal"
}
```

**Notes:**
- `date` : format **YYYY-MM-DD**
- `heure` : format **HH:mm:ss** ou ISO DateTime
- `clockin` : `true` = entrée, `false` = sortie
- `status` : 'normal' | 'retard' | 'absence' | 'incomplet' (optionnel, calculé automatiquement)

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "employeId": 10,
    "date": "2025-10-12",
    "heure": "2025-10-12T09:05:30.000Z",
    "clockin": true,
    "status": "normal",
    "createdAt": "2025-10-12T09:05:35.000Z",
    "updatedAt": "2025-10-12T09:05:35.000Z",
    "employe": {
      "id": 10,
      "firstName": "Pierre",
      "lastName": "Martin",
      "email": "pierre.martin@example.com"
    }
  },
  "message": "Pointage enregistré avec succès",
  "timestamp": "2025-10-12T09:05:35.000Z"
}
```

---

### 4.2 Pointage rapide (employé)

**Endpoint:** `POST /api/pointages/quick`  
**Headers:** `Authorization: Bearer {token}`  
**Permissions:** Tous (employé pointe lui-même)

**Request Body:**
```json
{
  "clockin": true
}
```

**Notes:**
- L'employé est déduit du JWT
- La date et l'heure sont automatiquement définies au moment de la requête
- Le statut est calculé automatiquement

**Response (201):** *(même format que PointageReadDTO)*

---

### 4.3 Liste des pointages

**Endpoint:** `GET /api/pointages`  
**Query Params (optionnels):**
- `employeId` : number
- `dateDebut` : YYYY-MM-DD
- `dateFin` : YYYY-MM-DD
- `status` : 'normal' | 'retard' | 'absence' | 'incomplet'
- `clockin` : boolean (true=entrées, false=sorties)

**Example:** `GET /api/pointages?employeId=10&dateDebut=2025-10-01&dateFin=2025-10-31&status=retard`

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "employeId": 10,
      "employelastName": "Pierre Martin",
      "date": "2025-10-12",
      "heure": "09:05:30",
      "clockin": true,
      "status": "normal"
    },
    {
      "id": 2,
      "employeId": 10,
      "employelastName": "Pierre Martin",
      "date": "2025-10-12",
      "heure": "17:35:00",
      "clockin": false,
      "status": "normal"
    }
  ],
  "message": "Liste des pointages récupérée avec succès",
  "timestamp": "2025-10-12T10:00:00.000Z"
}
```

---

### 4.4 Détail d'un pointage

**Endpoint:** `GET /api/pointages/:id`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "employeId": 10,
    "date": "2025-10-12",
    "heure": "2025-10-12T09:05:30.000Z",
    "clockin": true,
    "status": "normal",
    "createdAt": "2025-10-12T09:05:35.000Z",
    "updatedAt": "2025-10-12T09:05:35.000Z",
    "employe": {
      "id": 10,
      "firstName": "Pierre",
      "lastName": "Martin",
      "email": "pierre.martin@example.com"
    }
  },
  "message": "Pointage récupéré avec succès",
  "timestamp": "2025-10-12T10:00:00.000Z"
}
```

---

### 4.5 Corriger un pointage

**Endpoint:** `PATCH /api/pointages/:id`  
**Headers:** `Authorization: Bearer {token}`  
**Permissions:** Admin ou Manager

**Request Body (tous les champs optionnels):**
```json
{
  "date": "2025-10-12",
  "heure": "09:00:00",
  "clockin": true,
  "status": "normal"
}
```

**Response (200):** *(PointageReadDTO complet)*

---

### 4.6 Supprimer un pointage

**Endpoint:** `DELETE /api/pointages/:id`  
**Headers:** `Authorization: Bearer {token}`  
**Permissions:** Admin ou Manager

**Response (200):**
```json
{
  "success": true,
  "message": "Pointage supprimé avec succès",
  "timestamp": "2025-10-12T10:00:00.000Z"
}
```

---

### 4.7 Statistiques de pointage

**Endpoint:** `GET /api/pointages/stats`  
**Query Params (requis):**
- `employeId` : number
- `dateDebut` : YYYY-MM-DD
- `dateFin` : YYYY-MM-DD

**Example:** `GET /api/pointages/stats?employeId=10&dateDebut=2025-10-01&dateFin=2025-10-31`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "employeId": 10,
    "periodeDebut": "2025-10-01",
    "periodeFin": "2025-10-31",
    "totalPointages": 42,
    "totalEntrees": 21,
    "totalSorties": 21,
    "pointagesNormaux": 38,
    "pointagesRetard": 3,
    "pointagesIncomplete": 1,
    "joursPointes": 21
  },
  "message": "Statistiques des pointages calculées avec succès",
  "timestamp": "2025-10-12T10:00:00.000Z"
}
```

---

## 🚨 5. GESTION DES ERREURS

### Format d'erreur standard

```json
{
  "success": false,
  "error": "Format d'email invalide",
  "code": "VALIDATION_ERROR",
  "timestamp": "2025-10-12T10:00:00.000Z"
}
```

### Codes d'erreur courants

| Code HTTP | Code Erreur | Description |
|-----------|-------------|-------------|
| 400 | `VALIDATION_ERROR` | Données invalides dans la requête |
| 401 | `AUTH_ERROR` | Token manquant ou invalide |
| 401 | `INVALID_CREDENTIALS` | Email ou mot de passe incorrect |
| 404 | `NOT_FOUND` | Ressource non trouvée |
| 409 | `ALREADY_EXISTS` | Ressource déjà existante (ex: email) |
| 409 | `CONFLICT` | Conflit logique métier |
| 500 | `SERVER_ERROR` | Erreur serveur interne |

---

## 🔑 6. AUTHENTIFICATION

Toutes les routes protégées nécessitent un header **Authorization** :

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Le token JWT contient les informations suivantes (payload décodé) :

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

---

## 📊 7. PERMISSIONS PAR RÔLE

| Endpoint | Employe | Manager | Admin |
|----------|---------|---------|-------|
| `POST /users/register` | ✅ | ✅ | ✅ |
| `POST /users/register/employe` | ❌ | ✅ | ✅ |
| `POST /users/register/manager` | ❌ | ❌ | ✅ |
| `GET /users` | ✅ | ✅ | ✅ |
| `PATCH /users/:id` | ✅ (soi-même) | ✅ (son équipe) | ✅ |
| `POST /equipes` | ❌ | ❌ | ✅ |
| `PATCH /equipes/:id` | ❌ | ❌ | ✅ |
| `POST /horaires` | ❌ | ✅ | ✅ |
| `PATCH /horaires/:id` | ❌ | ✅ | ✅ |
| `POST /pointages/quick` | ✅ | ✅ | ✅ |
| `POST /pointages` | ❌ | ✅ | ✅ |
| `PATCH /pointages/:id` | ❌ | ✅ | ✅ |

---

## 🎨 8. EXEMPLE DE MOCK POUR FRONTEND

### Mock MSW (Mock Service Worker)

```typescript
// mocks/handlers.ts
import { rest } from 'msw';

export const handlers = [
  // Login
  rest.post('/api/users/login', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        data: {
          accessToken: 'mock-jwt-token',
          tokenType: 'bearer',
          expiresIn: 1800,
          user: {
            id: 1,
            firstName: 'Jean',
            lastName: 'Dupont',
            email: 'jean.dupont@example.com',
            role: 'employe',
            isActive: true,
            telephone: null,
            equipeId: null,
            plageHoraireId: null,
            createdAt: '2025-10-12T10:00:00.000Z',
            updatedAt: '2025-10-12T10:00:00.000Z',
            deletedAt: null
          },
          role: 'employe'
        },
        message: 'Connexion réussie',
        timestamp: new Date().toISOString()
      })
    );
  }),

  // Liste des équipes
  rest.get('/api/equipes', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        data: [
          {
            id: 1,
            lastName: 'Équipe Production',
            description: 'Équipe responsable de la production',
            managerId: 5,
            managerlastName: 'Marie Durand',
            membresCount: 12,
            createdAt: '2025-10-01T10:00:00.000Z'
          }
        ],
        message: 'Liste des équipes récupérée avec succès',
        timestamp: new Date().toISOString()
      })
    );
  }),

  // Pointage rapide
  rest.post('/api/pointages/quick', (req, res, ctx) => {
    return res(
      ctx.status(201),
      ctx.json({
        success: true,
        data: {
          id: 1,
          employeId: 10,
          date: '2025-10-12',
          heure: new Date().toISOString(),
          clockin: true,
          status: 'normal',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          employe: {
            id: 10,
            firstName: 'Pierre',
            lastName: 'Martin',
            email: 'pierre.martin@example.com'
          }
        },
        message: 'Pointage enregistré avec succès',
        timestamp: new Date().toISOString()
      })
    );
  })
];
```

---

## 📞 9. SUPPORT & DOCUMENTATION

- **Documentation Swagger interactive :** `http://localhost/api/docs`
- **Health check :** `http://localhost/api/health`
- **Base URL :** `http://localhost/api`

---

## ✅ 10. CHECKLIST POUR L'ÉQUIPE FRONTEND

- [ ] Configurer les intercepteurs Axios/Fetch avec le header Authorization
- [ ] Implémenter la gestion du refresh token si nécessaire
- [ ] Créer les types TypeScript à partir de ces DTOs
- [ ] Mettre en place le mock MSW avec ces formats de réponse
- [ ] Gérer les erreurs avec un intercepteur global
- [ ] Afficher les messages de succès/erreur à l'utilisateur
- [ ] Implémenter le store d'authentification (JWT + user)
- [ ] Gérer les permissions par rôle dans le routing

---

**Document maintenu par :** Équipe Backend  
**Dernière mise à jour :** 12 Octobre 2025  
**Version API :** 1.0.0

