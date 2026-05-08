# Task 13 Setup Instructions

## Installation

### 1. Install Required Dependencies

The sharing system requires the Radix UI Tabs component. Install it using:

```bash
npm install @radix-ui/react-tabs
```

Or if using pnpm:

```bash
pnpm add @radix-ui/react-tabs
```

### 2. Environment Variables

Ensure your `.env` file includes the following variable for generating share URLs:

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

For production, set this to your actual domain:

```env
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

### 3. Database Migration

The database schema already includes the necessary tables:
- `AccountShare` model for collaborators
- `shareToken` field on Account model
- `createdById` field on Transaction model

If you need to regenerate the Prisma client:

```bash
npm run db:generate
```

Or push schema changes:

```bash
npm run db:push
```

## Verification

### 1. Build the Application

```bash
npm run build
```

This will verify that all TypeScript types are correct and there are no compilation errors.

### 2. Run the Development Server

```bash
npm run dev
```

The application should start on http://localhost:3000

### 3. Test the Features

Follow the verification checklist in `TASK_13_VERIFICATION_CHECKLIST.md` to test all features.

## Quick Test Scenario

### Test 1: Generate View-Only Link

1. Login to the application
2. Navigate to `/accounts`
3. Click "Share" on any account
4. Click "Generate Share Link"
5. Copy the generated link
6. Open the link in an incognito window
7. Verify you can see the account data

### Test 2: Add Collaborator

1. Create a second user account (use different email)
2. Login with your first account
3. Navigate to `/accounts`
4. Click "Share" on an account
5. Go to "Collaborators" tab
6. Enter the second user's email
7. Select "Full Access"
8. Click "Add Collaborator"
9. Login with the second account
10. Verify the shared account appears in the account list

### Test 3: Permission Enforcement

1. Login as the collaborator (second user)
2. Select the shared account
3. Try to add a transaction
4. If permission is "Full Access", it should work
5. If permission is "Read Only", it should be blocked

## Troubleshooting

### Build Errors

If you encounter build errors:

1. **Missing @radix-ui/react-tabs**:
   ```bash
   npm install @radix-ui/react-tabs
   ```

2. **TypeScript errors**:
   - Run `npm run db:generate` to regenerate Prisma types
   - Check that all imports are correct
   - Verify all files are saved

3. **Module not found errors**:
   - Clear node_modules and reinstall: `rm -rf node_modules && npm install`
   - Clear Next.js cache: `rm -rf .next`

### Runtime Errors

1. **"Failed to fetch accounts"**:
   - Check that the API server is running
   - Verify database connection
   - Check browser console for detailed errors

2. **"User not found" when adding collaborator**:
   - Ensure the user is registered in the system
   - Check the email is correct

3. **Share link not working**:
   - Verify NEXT_PUBLIC_APP_URL is set correctly
   - Check that the token exists in the database
   - Ensure the account hasn't been deleted

### Database Issues

If you encounter database issues:

1. **Reset the database** (WARNING: This will delete all data):
   ```bash
   rm prisma/dev.db
   npm run db:push
   ```

2. **Check schema**:
   ```bash
   npm run db:studio
   ```
   This opens Prisma Studio to inspect the database.

## File Structure

```
src/
├── app/
│   ├── api/
│   │   └── accounts/
│   │       ├── [id]/
│   │       │   ├── share/
│   │       │   │   └── route.ts          # Share token management
│   │       │   └── collaborators/
│   │       │       └── route.ts          # Collaborator management
│   │       └── shared/
│   │           └── [token]/
│   │               └── route.ts          # Shared account access
│   └── shared/
│       └── [token]/
│           └── page.tsx                  # Shared account page
├── components/
│   ├── sharing/
│   │   ├── ShareDialog.tsx               # Main sharing dialog
│   │   ├── CollaboratorList.tsx          # Collaborator list
│   │   ├── SharedAccountBanner.tsx       # Shared account banner
│   │   └── index.ts                      # Exports
│   └── ui/
│       └── tabs.tsx                      # Tabs component (new)
└── lib/
    └── sharing.test.ts                   # Unit tests
```

## API Testing

You can test the API endpoints using curl or Postman:

### Generate Share Token

```bash
curl -X POST http://localhost:3000/api/accounts/[ACCOUNT_ID]/share \
  -H "Cookie: money-tracker-session=[YOUR_SESSION_COOKIE]"
```

### Add Collaborator

```bash
curl -X POST http://localhost:3000/api/accounts/[ACCOUNT_ID]/collaborators \
  -H "Content-Type: application/json" \
  -H "Cookie: money-tracker-session=[YOUR_SESSION_COOKIE]" \
  -d '{
    "email": "collaborator@example.com",
    "permission": "FULL_ACCESS"
  }'
```

### View Shared Account

```bash
curl http://localhost:3000/api/accounts/shared/[SHARE_TOKEN]
```

## Next Steps

After setup is complete:

1. Review the implementation summary: `TASK_13_IMPLEMENTATION_SUMMARY.md`
2. Follow the verification checklist: `TASK_13_VERIFICATION_CHECKLIST.md`
3. Read the user documentation: `docs/SHARING_SYSTEM.md`
4. Run the unit tests: `npm test src/lib/sharing.test.ts`
5. Test the features manually using the test scenarios above

## Support

If you encounter any issues:

1. Check the troubleshooting section above
2. Review the error messages in the browser console
3. Check the server logs for API errors
4. Verify all dependencies are installed
5. Ensure the database schema is up to date

## Production Deployment

Before deploying to production:

1. Set `NEXT_PUBLIC_APP_URL` to your production domain
2. Use a production database (PostgreSQL recommended)
3. Enable HTTPS for secure token transmission
4. Consider adding rate limiting to prevent abuse
5. Set up monitoring for sharing-related errors
6. Review security best practices in `docs/SHARING_SYSTEM.md`
