# Admin Setup Script

This script creates the initial administrator account for the AWR Properties system.

## Usage

### 1. Set Environment Variables
Add these to your `.env` file:
```env
ADMIN_NAME=System Administrator
ADMIN_EMAIL=admin@awr-properties.com
ADMIN_PASSWORD=your-secure-admin-password
```

### 2. Run the Script

**Create admin (only if not exists):**
```bash
npm run setup-admin
```

**Force recreate admin (delete existing and create new):**
```bash
npm run setup-admin:force
```

## Features

- ✅ Validates environment variables
- ✅ Checks for existing admin
- ✅ Auto-verifies email (skips OTP for initial setup)
- ✅ Secure password hashing
- ✅ Proper database connection handling
- ✅ Detailed logging
- ✅ Force mode for testing/reset

## Security Notes

- The initial admin is created with `isEmailVerified: true` to skip OTP verification
- Password is securely hashed using bcrypt
- Script exits gracefully on errors
- Database connections are properly closed

## Example Output

```
✅ Connected to MongoDB
✅ Admin created successfully:
   Name: System Administrator
   Email: admin@awr-properties.com
   ID: 507f1f77bcf86cd799439011
   Created: 2024-01-27T12:55:00.000Z
🔌 Disconnected from MongoDB
```
