# 🏥 Hospital Module - Complete API Endpoints

---

## 📋 Table of Contents
1. [Authentication Endpoints](#1-authentication-endpoints)
2. [Donor Management Endpoints](#2-donor-management-endpoints)
3. [Blood Operations Endpoints](#3-blood-operations-endpoints)
4. [Status & Quick Reference](#status--quick-reference)

---

## 1. Authentication Endpoints

### 1.1 Register Hospital (Admin Only)
```
POST /api/v1/hospital/auth/register
```
**Auth**: Admin Token Required  
**Purpose**: Register new hospital (admin only)

**Request**:
```bash
curl -X POST http://localhost:5000/api/v1/hospital/auth/register \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer admin_token" \
  -d '{
    "hospitalName": "City Medical Hospital",
    "registrationNumber": "REG-2026-001",
    "email": "hospital@example.com",
    "password": "SecurePass123",
    "phone": "01712345678",
    "licenseNumber": "LIC-2026-001",
    "address": "123 Main Street, Gulshan, Dhaka",
    "location": {
      "area": "Gulshan",
      "district": "Dhaka",
      "division": "Dhaka",
      "coordinates": {
        "lat": 23.8241,
        "lng": 90.4336
      }
    },
    "website": "https://cityhospital.com",
    "adminName": "Dr. Ahmed Khan",
    "adminEmail": "admin@cityhospital.com",
    "adminPhone": "01787654321",
    "totalBedCapacity": 500,
    "bloodBankCapacity": 1000
  }'
```

**Response** (201 Created):
```json
{
  "code": 201,
  "message": "Hospital registered successfully",
  "data": {
    "message": "Hospital registered successfully",
    "hospital": {
      "id": "507f1f77bcf86cd799439011",
      "hospitalName": "City Medical Hospital",
      "email": "hospital@example.com",
      "phone": "01712345678",
      "isVerified": false,
      "isActive": true
    }
  }
}
```

**Audit Log**: `hospital_created` logged with admin info

---

### 1.2 Hospital Login
```
POST /api/v1/hospital/auth/login
```
**Auth**: Public  
**Purpose**: Hospital staff login with token generation

**Request**:
```bash
curl -X POST http://localhost:5000/api/v1/hospital/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "hospital@example.com",
    "password": "SecurePass123"
  }'
```

**Response** (200 OK):
```json
{
  "code": 200,
  "message": "Login successful",
  "data": {
    "hospital": {
      "id": "507f1f77bcf86cd799439011",
      "hospitalName": "City Medical Hospital",
      "email": "hospital@example.com",
      "phone": "01712345678",
      "isVerified": false
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Cookies Set**:
- `refreshToken` (httpOnly, 7 days, secure)

**Audit Log**: `hospital_login` logged with IP, location, user agent

---

### 1.3 Forgot Password
```
POST /api/v1/hospital/auth/forgot-password
```
**Auth**: Public  
**Purpose**: Request password reset email

**Request**:
```bash
curl -X POST http://localhost:5000/api/v1/hospital/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "hospital@example.com"
  }'
```

**Response** (200 OK):
```json
{
  "code": 200,
  "message": "If hospital email exists in our system, reset instructions will be sent",
  "data": {}
}
```

**Email Sent**: Password reset link valid for 15 minutes

---

### 1.4 Reset Password
```
POST /api/v1/hospital/auth/reset-password
```
**Auth**: Public (with valid reset token)  
**Purpose**: Reset password using reset token from email

**Request**:
```bash
curl -X POST http://localhost:5000/api/v1/hospital/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "hospital@example.com",
    "resetToken": "abcd1234efgh5678ijkl9012mnop3456qrst7890uvwx",
    "newPassword": "NewSecurePass456",
    "confirmPassword": "NewSecurePass456"
  }'
```

**Response** (200 OK):
```json
{
  "code": 200,
  "message": "Password reset successfully",
  "data": {}
}
```

**Audit Log**: `hospital_updated` logged with "Password changed via reset token"

---

### 1.5 Change Password
```
POST /api/v1/hospital/auth/change-password
```
**Auth**: Hospital Token Required  
**Purpose**: Change password when logged in

**Request**:
```bash
curl -X POST http://localhost:5000/api/v1/hospital/auth/change-password \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer hospital_token" \
  -d '{
    "currentPassword": "SecurePass123",
    "newPassword": "NewSecurePass456",
    "confirmPassword": "NewSecurePass456"
  }'
```

**Response** (200 OK):
```json
{
  "code": 200,
  "message": "Password changed successfully",
  "data": {}
}
```

**Audit Log**: `hospital_updated` logged with IP, user agent, timestamp

---

## 2. Donor Management Endpoints

### 2.1 Approve Donor
```
PATCH /api/v1/donor/:donorId/approve
```
**Auth**: Hospital Token Required  
**Purpose**: Approve donor for blood donation

**Request**:
```bash
curl -X PATCH http://localhost:5000/api/v1/donor/507f1f77bcf86cd799439020/approve \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer hospital_token" \
  -d '{
    "remarks": "All blood tests passed successfully"
  }'
```

**Response** (200 OK):
```json
{
  "code": 200,
  "message": "Donor approved successfully",
  "data": {
    "donor": {
      "id": "507f1f77bcf86cd799439020",
      "name": "John Doe",
      "email": "john@example.com",
      "bloodGroup": "O+",
      "status": "approved",
      "approvalDate": "2026-04-21T10:35:00Z"
    }
  }
}
```

**Audit Log**: `donor_approved` with status change, remarks, timestamp

---

### 2.2 Reject Donor
```
PATCH /api/v1/donor/:donorId/reject
```
**Auth**: Hospital Token Required  
**Purpose**: Reject donor (failed screening)

**Request**:
```bash
curl -X PATCH http://localhost:5000/api/v1/donor/507f1f77bcf86cd799439020/reject \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer hospital_token" \
  -d '{
    "reason": "Blood pressure too high",
    "remarks": "Refer to doctor for health checkup"
  }'
```

**Response** (200 OK):
```json
{
  "code": 200,
  "message": "Donor rejected",
  "data": {
    "donor": {
      "id": "507f1f77bcf86cd799439020",
      "name": "John Doe",
      "status": "rejected",
      "rejectionReason": "Blood pressure too high"
    }
  }
}
```

**Audit Log**: `donor_rejected` with reason, remarks, timestamp

---

### 2.3 Cancel Donor
```
DELETE /api/v1/donor/:donorId/cancel
```
**Auth**: Hospital Token Required  
**Purpose**: Cancel donor participation

**Request**:
```bash
curl -X DELETE http://localhost:5000/api/v1/donor/507f1f77bcf86cd799439020/cancel \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer hospital_token" \
  -d '{
    "reason": "Donor requested cancellation",
    "remarks": "User decided not to donate"
  }'
```

**Response** (200 OK):
```json
{
  "code": 200,
  "message": "Donor cancelled successfully",
  "data": {
    "cancelledAt": "2026-04-21T10:37:00Z"
  }
}
```

**Audit Log**: `donor_cancelled` with reason, status change, timestamp

---

## 3. Blood Operations Endpoints

### 3.1 Record Blood Collection
```
POST /api/v1/blood/collect
```
**Auth**: Hospital Token Required  
**Purpose**: Record blood collection from donor

**Request**:
```bash
curl -X POST http://localhost:5000/api/v1/blood/collect \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer hospital_token" \
  -d '{
    "donorId": "507f1f77bcf86cd799439020",
    "quantity": 450,
    "bloodGroup": "O+",
    "collectionCenter": "Main Hospital Blood Bank",
    "collectionDate": "2026-04-21",
    "remarks": "Successful collection, donor well"
  }'
```

**Response** (201 Created):
```json
{
  "code": 201,
  "message": "Blood collection recorded successfully",
  "data": {
    "collection": {
      "id": "507f1f77bcf86cd799439030",
      "donorId": "507f1f77bcf86cd799439020",
      "quantity": 450,
      "bloodGroup": "O+",
      "collectionDate": "2026-04-21",
      "collectionCenter": "Main Hospital Blood Bank",
      "status": "collected",
      "storageLocation": "Fridge A - Shelf 2",
      "expiryDate": "2026-05-05"
    }
  }
}
```

**Audit Log**: `blood_collected` with quantity, blood group, donor info, timestamp

---

### 3.2 Record Blood Usage
```
POST /api/v1/blood/use
```
**Auth**: Hospital Token Required  
**Purpose**: Record blood usage for patient transfusion

**Request**:
```bash
curl -X POST http://localhost:5000/api/v1/blood/use \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer hospital_token" \
  -d '{
    "collectionId": "507f1f77bcf86cd799439030",
    "requestId": "507f1f77bcf86cd799439040",
    "quantity": 450,
    "patient": {
      "name": "Jane Doe",
      "age": 45,
      "condition": "Emergency surgery"
    },
    "remarks": "Emergency transfusion - patient stable"
  }'
```

**Response** (200 OK):
```json
{
  "code": 200,
  "message": "Blood usage recorded successfully",
  "data": {
    "usage": {
      "id": "507f1f77bcf86cd799439050",
      "collectionId": "507f1f77bcf86cd799439030",
      "requestId": "507f1f77bcf86cd799439040",
      "quantity": 450,
      "usageDate": "2026-04-21T11:30:00Z",
      "status": "used",
      "patient": {
        "name": "Jane Doe",
        "age": 45,
        "condition": "Emergency surgery"
      }
    }
  }
}
```

**Audit Log**: `blood_donation_recorded` with patient info, quantity, usage timestamp

---

### 3.3 Cancel Blood Collection
```
PATCH /api/v1/blood/:collectionId/cancel
```
**Auth**: Hospital Token Required  
**Purpose**: Cancel blood collection (mark as unusable)

**Request**:
```bash
curl -X PATCH http://localhost:5000/api/v1/blood/507f1f77bcf86cd799439030/cancel \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer hospital_token" \
  -d '{
    "reason": "Contamination detected",
    "remarks": "Quality test failed"
  }'
```

**Response** (200 OK):
```json
{
  "code": 200,
  "message": "Blood collection cancelled",
  "data": {
    "cancelledAt": "2026-04-21T11:45:00Z"
  }
}
```

**Audit Log**: `blood_collection_cancelled` with reason, timestamp

---

### 3.4 Mark Blood as Expired
```
PATCH /api/v1/blood/:collectionId/expire
```
**Auth**: Hospital Token Required  
**Purpose**: Mark blood unit as expired

**Request**:
```bash
curl -X PATCH http://localhost:5000/api/v1/blood/507f1f77bcf86cd799439030/expire \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer hospital_token" \
  -d '{
    "remarks": "Expiry date reached"
  }'
```

**Response** (200 OK):
```json
{
  "code": 200,
  "message": "Blood marked as expired",
  "data": {
    "expiredAt": "2026-04-21T12:00:00Z"
  }
}
```

**Audit Log**: `blood_donation_cancelled` with "expired" status

---

## Status & Quick Reference

### Authentication Flow
```
1. Register Hospital (Admin) → hospital created, welcome email sent
2. Hospital Login → access token + refresh token in cookie
3. Use access token for protected endpoints
4. Refresh token auto-managed in cookies (7 days)
```

### Token Information
| Token | Lifetime | Storage | Usage |
|-------|----------|---------|-------|
| Access Token | 15 minutes | Response body | `Authorization: Bearer <token>` |
| Refresh Token | 7 days | httpOnly cookie | Auto-sent with requests |

---

### All Endpoints Summary

| # | Method | Endpoint | Auth | Purpose |
|---|--------|----------|------|---------|
| 1 | POST | `/hospital/auth/register` | Admin | Register hospital |
| 2 | POST | `/hospital/auth/login` | Public | Hospital login |
| 3 | POST | `/hospital/auth/forgot-password` | Public | Request password reset |
| 4 | POST | `/hospital/auth/reset-password` | Public | Reset password |
| 5 | POST | `/hospital/auth/change-password` | Hospital | Change current password |
| 6 | PATCH | `/donor/:donorId/approve` | Hospital | Approve donor |
| 7 | PATCH | `/donor/:donorId/reject` | Hospital | Reject donor |
| 8 | DELETE | `/donor/:donorId/cancel` | Hospital | Cancel donor |
| 9 | POST | `/blood/collect` | Hospital | Record blood collection |
| 10 | POST | `/blood/use` | Hospital | Record blood usage |
| 11 | PATCH | `/blood/:collectionId/cancel` | Hospital | Cancel blood collection |
| 12 | PATCH | `/blood/:collectionId/expire` | Hospital | Mark blood as expired |

---

### Audit Actions Logged

| Action | When Logged | Data Captured |
|--------|------------|---|
| `hospital_created` | Hospital registration | Hospital info, admin ID |
| `hospital_login` | Staff login | IP, location, user agent, timestamp |
| `hospital_updated` | Password change/reset | Change details, IP, timestamp |
| `donor_approved` | Donor approved | Status change, remarks, timestamp |
| `donor_rejected` | Donor rejected | Reason, remarks, timestamp |
| `donor_cancelled` | Donor cancelled | Reason, status change, timestamp |
| `blood_collected` | Blood collected | Quantity, blood group, donor, timestamp |
| `blood_donation_recorded` | Blood used | Patient info, quantity, timestamp |
| `blood_collection_cancelled` | Collection cancelled | Reason, timestamp |
| `blood_donation_cancelled` | Blood expired | Status, timestamp |

---

### Error Responses

**400 Bad Request** - Validation Error
```json
{
  "code": 400,
  "message": "Password must contain at least one uppercase letter",
  "data": ["newPassword: Password must contain at least one uppercase letter"]
}
```

**401 Unauthorized** - Invalid Credentials
```json
{
  "code": 401,
  "message": "Invalid email or password",
  "data": []
}
```

**403 Forbidden** - Access Denied
```json
{
  "code": 403,
  "message": "Only hospitals can perform this action",
  "data": []
}
```

**404 Not Found**
```json
{
  "code": 404,
  "message": "Hospital not found",
  "data": []
}
```

**409 Conflict** - Duplicate Data
```json
{
  "code": 409,
  "message": "Hospital with this email already exists",
  "data": []
}
```

---

### Request Headers

**For Public Endpoints**:
```
Content-Type: application/json
```

**For Protected Endpoints**:
```
Content-Type: application/json
Authorization: Bearer <access_token>
```

Refresh token automatically sent via cookie (httpOnly)

---

### Email Notifications Sent

1. **Hospital Registration** - Welcome email with login info
2. **Password Reset Request** - Reset link (valid 15 min)
3. **Password Reset Success** - Confirmation email
4. **Password Changed** - Change confirmation with IP info

---

### Response Format (All Endpoints)

```json
{
  "code": 200,
  "message": "Success message",
  "data": {
    // endpoint-specific data
  }
}
```

---

### API Base URL
```
http://localhost:5000/api/v1
```

---

### Testing Sequence

1. ✅ Admin registers hospital
2. ✅ Hospital staff login
3. ✅ Approve pending donor
4. ✅ Collect blood from approved donor
5. ✅ Use blood for patient transfusion
6. ✅ Check audit trail for all operations

---

## Notes

- All timestamps in ISO 8601 format
- All emails use `.toLowerCase()` for consistency
- Passwords: 8-64 chars, 1 uppercase, 1 number
- Phone: Minimum 10 digits
- Coordinates: Lat [-90, 90], Lng [-180, 180]
- Audit logs include full context (IP, user agent, location)
- Refresh tokens automatically handled by browser cookies

