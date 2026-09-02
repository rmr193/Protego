# Crime Hotspots Module API Documentation

## 1. Get All Crime Hotspots
- **URL:** `/api/v1/hotspots`
- **Method:** `GET`
- **Access:** Private (All authenticated users)
- **Description:** Retrieves all crime hotspots globally, sorted by highest crime count.
- **Success Response:**
  - **Code:** 200 OK

## 2. Add New Crime Hotspot
- **URL:** `/api/v1/hotspots`
- **Method:** `POST`
- **Access:** Private (Admin Only)
- **Description:** Manually registers a new crime hotspot into the system. In the future, the ML service will automatically populate this.
- **Body Payload:**
  ```json
  {
    "location": "Mirpur 10",
    "crime_count": 150,
    "risk_level": "HIGH"
  }
  ```
- **Success Response:**
  - **Code:** 201 Created

## 3. Update Crime Hotspot
- **URL:** `/api/v1/hotspots/:id`
- **Method:** `PATCH`
- **Access:** Private (Admin Only)
- **Description:** Updates the risk level or crime count of an existing hotspot.
- **Body Payload:**
  ```json
  {
    "crime_count": 160,
    "risk_level": "CRITICAL"
  }
  ```
- **Success Response:**
  - **Code:** 200 OK

## 4. Delete Crime Hotspot
- **URL:** `/api/v1/hotspots/:id`
- **Method:** `DELETE`
- **Access:** Private (Admin Only)
- **Description:** Deletes a specific crime hotspot.
- **Success Response:**
  - **Code:** 200 OK
