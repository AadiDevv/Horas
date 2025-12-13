# Changements API - Branche `refonte`

## 🎯 TIMESHEETS - `/api/timesheets`

### POST `/api/timesheets/`

**AVANT (dev)**
```json
{
  "date": "2025-10-24",
  "hour": "2025-10-24T08:30:00.000Z",
  "clockin": true,
  "status": "normal"
}
```

**APRÈS (refonte)**
```json
// Employé
{}

// Manager/Admin
{
  "employeId": 19,
  "timestamp": "2025-12-13T17:30:00.000Z",
  "status": "normal"
}
```

### GET `/api/timesheets`, GET `/api/timesheets/:id`

**AVANT**
```json
{
  "id": 1,
  "employeId": 10,
  "date": "2025-10-24",
  "hour": "2025-10-24T08:30:00.000Z",
  "clockin": true
}
```

**APRÈS**
```json
{
  "id": 1,
  "employeId": 10,
  "timestamp": "2025-12-13T08:30:00.000Z",
  "clockin": true
}
```

### PATCH `/api/timesheets/:id`

**AVANT**
```json
{
  "date": "2025-10-25",
  "hour": "2025-10-25T09:00:00.000Z",
  "clockin": false
}
```

**APRÈS**
```json
{
  "timestamp": "2025-12-13T09:00:00.000Z",
  "clockin": false
}
```

---

## 👥 USERS - `/api/users`

### GET `/api/users/:id`

**AVANT**
```json
{
  "id": 1,
  "firstName": "John",
  "role": "employe",
  "teamId": 1,
  "createdAt": "2025-01-01T10:00:00.000Z"
}
```

**APRÈS (relations incluses automatiquement)**
```json
// Employee
{
  "id": 1,
  "firstName": "John",
  "role": "employe",
  "teamId": 1,
  "managerId": 5,
  "customScheduleId": null,
  "createdAt": "2025-01-01T10:00:00.000Z",
  "team": { "id": 1, "name": "Dev" },
  "manager": { "id": 5, "firstName": "Boss" },
  "customSchedule": null
}

// Manager
{
  "id": 5,
  "firstName": "Boss",
  "role": "manager",
  "createdAt": "2025-01-01T10:00:00.000Z",
  "managedTeams": [...],
  "employes": [...]
}
```

⚠️ **Note** : La création d'utilisateurs se fait via `/auth/register`

---

## 🏢 TEAMS - `/api/teams`

### POST `/api/teams`

**AVANT**
```json
{
  "name": "Dev Team",
  "description": "...",
  "managerId": 5,
  "scheduleId": 1
}
```

**APRÈS**
```json
{
  "name": "Dev Team",
  "description": "...",
  "scheduleId": 1
}
```
⚠️ `managerId` auto-extrait du JWT

### GET `/api/teams/:id`

**AVANT**
```json
{
  "id": 1,
  "name": "Dev Team",
  "managerId": 5,
  "scheduleId": 1,
  "membersCount": 10
}
```

**APRÈS**
```json
{
  "id": 1,
  "name": "Dev Team",
  "managerId": 5,
  "scheduleId": 1,
  "membersCount": 10,
  "manager": { "id": 5, "firstName": "Boss" },
  "schedule": { "id": 1, "name": "9-17" },
  "members": [...]
}
```

---

## 📅 SCHEDULES - `/api/schedules`

### POST `/api/schedules`

**AVANT**
```json
{
  "name": "9-17",
  "startHour": "09:00",
  "endHour": "17:00",
  "activeDays": [1, 2, 3, 4, 5]
}
```

**APRÈS** (identique structure, mais managerId auto-extrait)
```json
{
  "name": "9-17",
  "startHour": "09:00",
  "endHour": "17:00",
  "activeDays": [1, 2, 3, 4, 5]
}
```

---

## 📊 RÉSUMÉ DES CHANGEMENTS

| Route | Changement Principal |
|-------|---------------------|
| `POST /timesheets` | `date + hour` → `timestamp`, `clockin` supprimé du request |
| `GET /timesheets` | `date + hour` → `timestamp` dans response |
| `GET /users/:id` | Relations incluses automatiquement (team, manager, customSchedule) |
| `POST /teams` | `managerId` auto-extrait du JWT |
| `GET /teams/:id` | Relations incluses (manager, schedule, members) |
| `POST /schedules` | `managerId` auto-extrait du JWT |

---

## 🔑 RÈGLES MÉTIER AJOUTÉES

1. **Timesheets** : `clockin` TOUJOURS auto-déterminé (inverse du dernier)
2. **Timesheets** : Employé = payload vide, Manager = `employeId` obligatoire
3. **Timesheets** : `timestamp` manuel doit être postérieur au dernier
4. **Teams/Schedules** : `managerId` extrait du JWT (pas dans request)
5. **Relations** : Incluses automatiquement dans GET (team, manager, schedule, members)
