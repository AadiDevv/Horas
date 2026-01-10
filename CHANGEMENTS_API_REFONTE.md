# API Changes - `refonte` Branch

## 🎯 TIMESHEETS - `/api/timesheets`

### POST `/api/timesheets/`

**BEFORE (dev)**
```json
{
  "date": "2025-10-24",
  "hour": "2025-10-24T08:30:00.000Z",
  "clockin": true,
  "status": "normal"
}
```

**AFTER (refonte)**
```json
// Employee
{}

// Manager/Admin
{
  "employeId": 19,
  "timestamp": "2025-12-13T17:30:00.000Z",
  "status": "normal"
}
```

### GET `/api/timesheets`, GET `/api/timesheets/:id`

**BEFORE**
```json
{
  "id": 1,
  "employeId": 10,
  "date": "2025-10-24",
  "hour": "2025-10-24T08:30:00.000Z",
  "clockin": true
}
```

**AFTER**
```json
{
  "id": 1,
  "employeId": 10,
  "timestamp": "2025-12-13T08:30:00.000Z",
  "clockin": true
}
```

### PATCH `/api/timesheets/:id`

**BEFORE**
```json
{
  "date": "2025-10-25",
  "hour": "2025-10-25T09:00:00.000Z",
  "clockin": false
}
```

**AFTER**
```json
{
  "timestamp": "2025-12-13T09:00:00.000Z",
  "clockin": false
}
```

---

## 👥 USERS - `/api/users`

### GET `/api/users/:id`

**BEFORE**
```json
{
  "id": 1,
  "firstName": "John",
  "role": "employe",
  "teamId": 1,
  "createdAt": "2025-01-01T10:00:00.000Z"
}
```

**AFTER (relations automatically included)**
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

⚠️ **Note**: User creation is done via `/auth/register`

---

## 🏢 TEAMS - `/api/teams`

### POST `/api/teams`

**BEFORE**
```json
{
  "name": "Dev Team",
  "description": "...",
  "managerId": 5,
  "scheduleId": 1
}
```

**AFTER**
```json
{
  "name": "Dev Team",
  "description": "...",
  "scheduleId": 1
}
```
⚠️ `managerId` auto-extracted from JWT

### GET `/api/teams/:id`

**BEFORE**
```json
{
  "id": 1,
  "name": "Dev Team",
  "managerId": 5,
  "scheduleId": 1,
  "membersCount": 10
}
```

**AFTER**
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

**BEFORE**
```json
{
  "name": "9-17",
  "startHour": "09:00",
  "endHour": "17:00",
  "activeDays": [1, 2, 3, 4, 5]
}
```

**AFTER** (same structure, but managerId auto-extracted)
```json
{
  "name": "9-17",
  "startHour": "09:00",
  "endHour": "17:00",
  "activeDays": [1, 2, 3, 4, 5]
}
```

---

## 📊 CHANGES SUMMARY

| Route | Main Change |
|-------|---------------------|
| `POST /timesheets` | `date + hour` → `timestamp`, `clockin` removed from request |
| `GET /timesheets` | `date + hour` → `timestamp` in response |
| `GET /users/:id` | Relations automatically included (team, manager, customSchedule) |
| `POST /teams` | `managerId` auto-extracted from JWT |
| `GET /teams/:id` | Relations included (manager, schedule, members) |
| `POST /schedules` | `managerId` auto-extracted from JWT |

---

## 🔑 BUSINESS RULES ADDED

1. **Timesheets**: `clockin` ALWAYS auto-determined (opposite of the last one)
2. **Timesheets**: Employee = empty payload, Manager = `employeId` required
3. **Timesheets**: Manual `timestamp` must be after the last one
4. **Teams/Schedules**: `managerId` extracted from JWT (not in request)
5. **Relations**: Automatically included in GET (team, manager, schedule, members)
