# Crime Reporting Module API Documentation

## 1. Submit Crime Report
- **URL:** `/api/v1/crimes`
- **Method:** `POST`
- **Access:** Private (Authenticated Users)
- **Description:** Submits a new Crime Report.
- **Body Payload:**
  ```json
  {
    "crime_type": "Theft",
    "description": "My laptop was stolen from a cafe in Gulshan.",
    "location": "Gulshan 1, Dhaka",
    "date_time": "2023-11-01T15:30:00.000Z"
  }
  ```
- **Success Response:**
  - **Code:** 201 Created

## 2. Get All Crime Reports (Paginated)
- **URL:** `/api/v1/crimes?page=1&limit=10&status=PENDING&crime_type=Theft`
- **Method:** `GET`
- **Access:** Private
- **Description:** Retrieves Crime Reports. Citizens see their own. Admin/Police see all. Supports filtering.
- **Success Response:**
  - **Code:** 200 OK
  - **Content:** List of Reports with pagination and AI analysis metadata.

## 3. Get Specific Crime Report
- **URL:** `/api/v1/crimes/:id`
- **Method:** `GET`
- **Access:** Private
- **Description:** Retrieves a specific Crime Report with evidence and AI analysis.
- **Success Response:**
  - **Code:** 200 OK

## 4. Update Crime Report Status
- **URL:** `/api/v1/crimes/:id/status`
- **Method:** `PATCH`
- **Access:** Private (Admin, Police_Officer Only)
- **Description:** Update status of a Crime Report to `PENDING`, `INVESTIGATING`, or `CLOSED`.
- **Body Payload:**
  ```json
  {
    "status": "INVESTIGATING"
  }
  ```
- **Success Response:**
  - **Code:** 200 OK
