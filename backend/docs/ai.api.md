# AI Analysis Module API Documentation

## 1. Request AI Analysis for a Report
- **URL:** `/api/v1/ai/analyze`
- **Method:** `POST`
- **Access:** Private (Admin, Police_Officer Only)
- **Description:** Sends the textual description of a Crime Report to the external Python ML service. Calculates probability of fake reports and outputs a severity score. Note: Currently uses mock responses until Python service is fully wired.
- **Body Payload:**
  ```json
  {
    "report_id": "<uuid>",
    "description": "The exact description text from the crime report..."
  }
  ```
- **Success Response:**
  - **Code:** 201 Created

## 2. Get AI Analysis Result
- **URL:** `/api/v1/ai/:reportId`
- **Method:** `GET`
- **Access:** Private (Admin, Police_Officer Only)
- **Description:** Retrieves an existing AI analysis object tied to a specific report.
- **Success Response:**
  - **Code:** 200 OK
  - **Content:**
    ```json
    {
      "status": "success",
      "data": {
        "analysis_id": "...",
        "report_id": "...",
        "fake_probability": 0.85,
        "is_fake": true,
        "severity_score": 9,
        "category": "Inferred Category"
      }
    }
    ```
