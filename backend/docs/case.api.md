# Case Management Module API Documentation

## 1. Create a Case (Assign Officer)
- **URL:** `/api/v1/cases`
- **Method:** `POST`
- **Access:** Private (Admin Only)
- **Description:** Creates a case for a given Crime Report and assigns it to a Police Officer.
- **Body Payload:**
  ```json
  {
    "report_id": "<uuid>",
    "officer_id": "<uuid>"
  }
  ```
- **Success Response:**
  - **Code:** 201 Created

## 2. Get All Cases
- **URL:** `/api/v1/cases?officer_id=<uuid>`
- **Method:** `GET`
- **Access:** Private (Admin, Police_Officer)
- **Description:** Retrieves cases. Officers can filter by their `officer_id`.

## 3. Get Specific Case
- **URL:** `/api/v1/cases/:id`
- **Method:** `GET`
- **Access:** Private
- **Description:** Retrieves case details along with its tracking updates. Citizens can only view cases associated with their own crime reports.
- **Success Response:**
  - **Code:** 200 OK

## 4. Add Case Tracking Update
- **URL:** `/api/v1/cases/:id/tracking`
- **Method:** `POST`
- **Access:** Private (Admin, Police_Officer Only)
- **Description:** Adds a status update to the case history. If the update contains "close", the overall case status transitions to `CLOSED`.
- **Body Payload:**
  ```json
  {
    "status_update": "Investigated the scene. No fingerprints found."
  }
  ```
- **Success Response:**
  - **Code:** 201 Created
