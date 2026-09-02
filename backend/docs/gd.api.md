# General Diary (GD) Module API Documentation

## 1. File a General Diary
- **URL:** `/api/v1/gd`
- **Method:** `POST`
- **Access:** Private (Authenticated Users)
- **Description:** Submits a new General Diary.
- **Body Payload:**
  ```json
  {
    "title": "Lost National ID Card",
    "description": "I lost my NID card near Dhanmondi Lake at 5 PM today."
  }
  ```
- **Success Response:**
  - **Code:** 201 Created

## 2. Get All GDs (Paginated)
- **URL:** `/api/v1/gd?page=1&limit=10&status=PENDING`
- **Method:** `GET`
- **Access:** Private
- **Description:** Retrieves GDs. Citizens see their own GDs. Admin/Police see all GDs. Supports status filtering.
- **Success Response:**
  - **Code:** 200 OK
  - **Content:** List of GDs with pagination metadata.

## 3. Get Specific GD
- **URL:** `/api/v1/gd/:id`
- **Method:** `GET`
- **Access:** Private
- **Description:** Retrieves a specific GD. Citizens can only view if they are the creator.
- **Success Response:**
  - **Code:** 200 OK

## 4. Update GD Status
- **URL:** `/api/v1/gd/:id/status`
- **Method:** `PATCH`
- **Access:** Private (Admin, Police_Officer Only)
- **Description:** Update status of a GD to `PENDING`, `APPROVED`, or `REJECTED`.
- **Body Payload:**
  ```json
  {
    "status": "APPROVED"
  }
  ```
- **Success Response:**
  - **Code:** 200 OK
