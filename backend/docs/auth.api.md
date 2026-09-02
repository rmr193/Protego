# Authentication Module API Documentation

## 1. Register User
- **URL:** `/api/v1/auth/register`
- **Method:** `POST`
- **Access:** Public
- **Description:** Registers a new citizen in the system.
- **Body Payload:**
  ```json
  {
    "full_name": "John Doe",
    "email": "john@example.com",
    "phone": "01700000000",
    "password": "strongpassword123",
    "address": "Dhaka, Bangladesh",
    "nid_number": "1234567890"
  }
  ```
- **Success Response:**
  - **Code:** 201 Created
  - **Content:**
    ```json
    {
      "status": "success",
      "message": "User registered successfully",
      "data": {
        "user": { ... },
        "accessToken": "ey..."
      }
    }
    ```
  - **Note:** Sets HTTP-only cookie `refreshToken`.

## 2. Login User
- **URL:** `/api/v1/auth/login`
- **Method:** `POST`
- **Access:** Public
- **Description:** Authenticates a user and returns an access token.
- **Body Payload:**
  ```json
  {
    "email": "john@example.com",
    "password": "strongpassword123"
  }
  ```
- **Success Response:**
  - **Code:** 200 OK
  - **Content:**
    ```json
    {
      "status": "success",
      "message": "Login successful",
      "data": {
        "user": { ... },
        "accessToken": "ey..."
      }
    }
    ```

## 3. Refresh Tokens
- **URL:** `/api/v1/auth/refresh`
- **Method:** `POST`
- **Access:** Public (Requires Refresh Token)
- **Description:** Uses the refresh token from cookie or body to generate a new access token and rotate the refresh token.
- **Success Response:**
  - **Code:** 200 OK
  - **Content:**
    ```json
    {
      "status": "success",
      "message": "Tokens refreshed",
      "data": {
        "accessToken": "ey..."
      }
    }
    ```

## 4. Logout User
- **URL:** `/api/v1/auth/logout`
- **Method:** `POST`
- **Access:** Private
- **Description:** Invalidates the current refresh token and clears the cookie.
- **Success Response:**
  - **Code:** 200 OK
  - **Content:**
    ```json
    {
      "status": "success",
      "message": "Logged out successfully",
      "data": null
    }
    ```
