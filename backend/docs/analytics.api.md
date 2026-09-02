# Analytics Module API Documentation

## 1. Get Dashboard Statistics
- **URL:** `/api/v1/analytics/dashboard`
- **Method:** `GET`
- **Access:** Private (Admin, Police_Officer Only)
- **Description:** Aggregates system-wide data for rendering charts and metric cards on the admin/police dashboard.
- **Success Response:**
  - **Code:** 200 OK
  - **Content:**
    ```json
    {
      "status": "success",
      "message": "Dashboard statistics retrieved successfully",
      "data": {
        "overview": {
          "total_users": 1500,
          "total_crimes": 320,
          "total_gds": 450,
          "total_cases": 120,
          "active_sos_alerts": 5
        },
        "charts": {
          "crimes_by_status": {
            "PENDING": 150,
            "INVESTIGATING": 100,
            "CLOSED": 70
          },
          "crimes_by_type": {
            "Theft": 200,
            "Assault": 50,
            "Fraud": 70
          }
        }
      }
    }
    ```
