# Evidence Upload Module API Documentation

## 1. Upload Evidence
- **URL:** `/api/v1/evidence/:reportId`
- **Method:** `POST`
- **Access:** Private (Report owner or Admin/Police)
- **Description:** Uploads a file (image, pdf, mp4) and links it to a Crime Report. Form data is required.
- **Body Payload (multipart/form-data):**
  - `file`: The actual file to upload.
- **Success Response:**
  - **Code:** 201 Created
  - **Content:**
    ```json
    {
      "status": "success",
      "data": {
        "evidence_id": "...",
        "file_url": "/uploads/12345-6789.jpg",
        "file_type": "image/jpeg"
      }
    }
    ```

## 2. Get Evidence by Report
- **URL:** `/api/v1/evidence/:reportId`
- **Method:** `GET`
- **Access:** Private
- **Description:** Retrieves all evidence linked to a Crime Report.
- **Success Response:**
  - **Code:** 200 OK

## 3. Delete Evidence
- **URL:** `/api/v1/evidence/:id`
- **Method:** `DELETE`
- **Access:** Private (Owner or Admin)
- **Description:** Deletes the evidence record and the physical file from the server.
- **Success Response:**
  - **Code:** 200 OK
