# User Management Module API Documentation

## 1. Get Current User Profile
- **URL:** `/api/v1/users/me`
- **Method:** `GET`
- **Access:** Private (Requires Access Token)
- **Description:** Retrieves the authenticated user's profile data.
- **Success Response:**
  - **Code:** 200 OK
  - **Content:**
    ```json
    {
      "status": "success",
      "message": "Profile retrieved successfully",
      "data": {
        "user_id": "...",
        "full_name": "John Doe",
        "email": "john@example.com",
        "role": { "name": "CITIZEN" }
      }
    }
    ```

## 2. Update Current User Profile
- **URL:** `/api/v1/users/me`
- **Method:** `PATCH`
- **Access:** Private
- **Description:** Updates the authenticated user's profile data.
- **Body Payload (Optional Fields):**
  ```json
  {
    "full_name": "John Doe updated",
    "phone": "01999999999",
    "address": "New Address"
  }
  ```
- **Success Response:**
  - **Code:** 200 OK
  - **Content:**
    ```json
    {
      "status": "success",
      "message": "Profile updated successfully",
      "data": { ... }
    }
    ```

## 3. Get All Users (Paginated)
- **URL:** `/api/v1/users?page=1&limit=10`
- **Method:** `GET`
- **Access:** Private (Admin & Police Officer Only)
- **Description:** Retrieves a paginated list of all users in the system.
- **Success Response:**
  - **Code:** 200 OK
  - **Content:**
    ```json
    {
      "status": "success",
      "message": "Users retrieved successfully",
      "data": {
        "users": [ ... ],
        "meta": {
          "total": 50,
          "page": 1,
          "limit": 10,
          "totalPages": 5
        }
      }
    }
    ```

## 4. Delete User
- **URL:** `/api/v1/users/:id`
- **Method:** `DELETE`
- **Access:** Private (Admin Only)
- **Description:** Deletes a specific user from the system.
- **Success Response:**
  - **Code:** 200 OK
  - **Content:**
    ```json
    {
      "status": "success",
      "message": "User deleted successfully",
      "data": null
    }
    ```
