# Notification Module API Documentation

## 1. Get All Notifications
- **URL:** `/api/v1/notifications`
- **Method:** `GET`
- **Access:** Private
- **Description:** Retrieves all notifications for the authenticated user, ordered by most recent.
- **Success Response:**
  - **Code:** 200 OK

## 2. Mark Notification as Read
- **URL:** `/api/v1/notifications/:id/read`
- **Method:** `PATCH`
- **Access:** Private
- **Description:** Marks a specific notification as `READ`.
- **Success Response:**
  - **Code:** 200 OK

## 3. Mark All Notifications as Read
- **URL:** `/api/v1/notifications/mark-all-read`
- **Method:** `PATCH`
- **Access:** Private
- **Description:** Marks all `UNREAD` notifications for the current user as `READ`.
- **Success Response:**
  - **Code:** 200 OK
