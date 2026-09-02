# SOS Emergency System API Documentation

## 1. Trigger SOS Alert
- **URL:** `/api/v1/sos`
- **Method:** `POST`
- **Access:** Private (Authenticated Users)
- **Description:** Triggers an immediate emergency SOS alert. In the future, this will emit a Socket.IO event to all active police dispatchers.
- **Body Payload:**
  ```json
  {
    "live_location": "23.8103,90.4125",
    "emergency_type": "MEDICAL"
  }
  ```
- **Success Response:**
  - **Code:** 201 Created

## 2. Get Active Alerts
- **URL:** `/api/v1/sos/active`
- **Method:** `GET`
- **Access:** Private (Admin, Police_Officer)
- **Description:** Retrieves all currently `ACTIVE` SOS alerts globally.
- **Success Response:**
  - **Code:** 200 OK

## 3. Get Specific Alert
- **URL:** `/api/v1/sos/:id`
- **Method:** `GET`
- **Access:** Private
- **Description:** Retrieves a specific SOS alert by ID.

## 4. Resolve SOS Alert
- **URL:** `/api/v1/sos/:id/resolve`
- **Method:** `PATCH`
- **Access:** Private (Admin, Police_Officer Only)
- **Description:** Marks an `ACTIVE` SOS alert as `RESOLVED`.
- **Success Response:**
  - **Code:** 200 OK
