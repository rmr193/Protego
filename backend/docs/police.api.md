# Police Management Module API Documentation

## 1. Create Police Station
- **URL:** `/api/v1/police/stations`
- **Method:** `POST`
- **Access:** Private (Admin Only)
- **Description:** Creates a new police station.
- **Body Payload:**
  ```json
  {
    "station_name": "Dhanmondi Model Thana",
    "location": "Dhanmondi, Dhaka",
    "contact_number": "01700000000"
  }
  ```

## 2. Get All Police Stations
- **URL:** `/api/v1/police/stations`
- **Method:** `GET`
- **Access:** Private (All authenticated users)
- **Description:** Retrieves all police stations.

## 3. Create Police Officer
- **URL:** `/api/v1/police/officers`
- **Method:** `POST`
- **Access:** Private (Admin Only)
- **Description:** Registers a new police officer to a station.
- **Body Payload:**
  ```json
  {
    "name": "Inspector Akram",
    "badge_number": "BD-45920",
    "station_id": "<uuid-of-station>",
    "rank": "Inspector",
    "contact": "01800000000"
  }
  ```

## 4. Get Officers
- **URL:** `/api/v1/police/officers?station_id=<uuid>`
- **Method:** `GET`
- **Access:** Private (Admin, Police_Officer)
- **Description:** Retrieves officers, optionally filtered by `station_id`.
