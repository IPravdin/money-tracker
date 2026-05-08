# Sharing and Collaboration System

## Overview

The Money Tracker application includes a comprehensive sharing and collaboration system that allows users to share their accounts with others. There are two main sharing methods:

1. **View-Only Links**: Public shareable links that provide read-only access to account data
2. **Collaborator Invites**: Email-based invitations that grant registered users access with specific permissions

## Features

### 1. View-Only Links

View-only links allow you to share your account data with anyone, without requiring them to have an account or log in.

**Characteristics:**
- No authentication required
- Read-only access to all account data
- Secure 64-character random token
- Can be revoked at any time
- Shows all transactions, budgets, and summaries

**Use Cases:**
- Sharing financial reports with family members
- Providing transparency to stakeholders
- Sharing budget progress with accountability partners

### 2. Collaborator Invites

Collaborator invites allow you to grant specific users access to your account with different permission levels.

**Permission Levels:**
- **READ_ONLY**: Can view all data but cannot make changes
- **FULL_ACCESS**: Can add, edit, and delete transactions and budgets

**Characteristics:**
- Requires recipient to have a registered account
- Email-based invitation
- Granular permission control
- Can be revoked at any time
- Shows who created each transaction

**Use Cases:**
- Joint account management with spouse/partner
- Business account collaboration with team members
- Shared family budget management

## User Guide

### Generating a View-Only Link

1. Navigate to the **Accounts** page
2. Click the **Share** button on the account you want to share
3. Go to the **View-Only Link** tab
4. Click **Generate Share Link**
5. Copy the generated link and share it with anyone
6. Recipients can access the link without logging in

### Revoking a View-Only Link

1. Open the Share dialog for the account
2. Go to the **View-Only Link** tab
3. Click **Revoke Link**
4. The link will immediately stop working

### Adding a Collaborator

1. Navigate to the **Accounts** page
2. Click the **Share** button on the account
3. Go to the **Collaborators** tab
4. Enter the collaborator's email address
5. Select the permission level (Read Only or Full Access)
6. Click **Add Collaborator**
7. The user will immediately see the account in their account list

**Note:** The recipient must already have a registered account in the system.

### Removing a Collaborator

1. Open the Share dialog for the account
2. Go to the **Collaborators** tab
3. Find the collaborator in the list
4. Click the trash icon next to their name
5. The user will immediately lose access to the account

### Viewing Shared Accounts

When someone shares an account with you:

1. The account will appear in your account list
2. A banner will indicate it's a shared account
3. The banner shows who owns the account
4. Your permission level is displayed (Read Only or Full Access)
5. If you have Read Only access, you cannot add or modify transactions

### Accessing a View-Only Link

When you receive a view-only link:

1. Click the link or paste it in your browser
2. You'll see the shared account page
3. A "View Only" badge indicates you cannot make changes
4. You can view all transactions, budgets, and summaries
5. Transaction creators are shown for each transaction

## Technical Details

### API Endpoints

#### Share Token Management
```
POST   /api/accounts/[id]/share        - Generate share token
DELETE /api/accounts/[id]/share        - Revoke share token
```

#### Collaborator Management
```
GET    /api/accounts/[id]/collaborators - List collaborators
POST   /api/accounts/[id]/collaborators - Add collaborator
DELETE /api/accounts/[id]/collaborators - Remove collaborator
```

#### Shared Account Access
```
GET    /api/accounts/shared/[token]    - View shared account
```

### Security

**Token Generation:**
- Uses `crypto.randomBytes(32)` for cryptographically secure tokens
- 64-character hexadecimal strings
- Unique constraint in database prevents duplicates

**Permission Enforcement:**
- All API endpoints validate user permissions
- READ_ONLY users are blocked from write operations
- Only account owners can manage sharing settings
- Session-based authentication for all protected endpoints

**Access Control:**
- Shared accounts use OR clauses in database queries
- Permission checks at both API and UI levels
- View-only links don't require authentication
- Collaborator access requires valid session

### Database Schema

**Account Model:**
```typescript
{
  id: string
  name: string
  type: string
  defaultCurrency: string
  shareToken: string | null  // For view-only sharing
  userId: string              // Owner
  // ... other fields
}
```

**AccountShare Model:**
```typescript
{
  id: string
  accountId: string
  userId: string
  permission: "READ_ONLY" | "FULL_ACCESS"
  // ... timestamps
}
```

**Transaction Model:**
```typescript
{
  id: string
  // ... transaction fields
  createdById: string | null  // Tracks who created the transaction
}
```

### Real-Time Updates

The system uses React Query for automatic cache invalidation and updates:

- **Optimistic Updates**: UI updates immediately, then syncs with server
- **Cache Invalidation**: Automatic refresh after changes
- **Polling**: React Query can be configured to poll for updates
- **Manual Refresh**: Users can manually refresh data

For true real-time updates, consider implementing WebSocket support in the future.

## Best Practices

### For Account Owners

1. **Use View-Only Links for Public Sharing**: If you just want to show data without allowing changes, use view-only links
2. **Use Collaborators for Active Management**: If someone needs to add transactions, make them a collaborator
3. **Review Permissions Regularly**: Periodically check who has access to your accounts
4. **Revoke Unused Access**: Remove collaborators who no longer need access
5. **Regenerate Share Links**: If a link is compromised, regenerate it to invalidate the old one

### For Collaborators

1. **Respect Permission Levels**: Don't try to circumvent READ_ONLY restrictions
2. **Communicate Changes**: Let the owner know when you make significant changes
3. **Use Descriptive Descriptions**: Help others understand your transactions
4. **Check Creator Information**: See who made each transaction for accountability

### Security Recommendations

1. **Don't Share Links Publicly**: View-only links should only be shared with trusted individuals
2. **Use Strong Passwords**: Protect your account with a strong password
3. **Monitor Activity**: Regularly review transactions to ensure no unauthorized changes
4. **Revoke Access Promptly**: Remove access immediately when it's no longer needed
5. **Be Careful with Full Access**: Only grant FULL_ACCESS to highly trusted individuals

## Troubleshooting

### "User not found" when adding collaborator
- The user must be registered in the system first
- Ask them to create an account before you invite them

### "Cannot add yourself as a collaborator"
- You already own the account, you don't need to be a collaborator
- This prevents accidental permission issues

### "User is already a collaborator"
- The user already has access to this account
- To change their permission, remove them and add them again

### Share link not working
- The link may have been revoked by the owner
- Check that you're using the complete URL
- Contact the account owner to verify the link is still active

### Cannot add transactions to shared account
- Check your permission level in the banner
- Only FULL_ACCESS collaborators can add transactions
- Contact the account owner to request higher permissions

## Future Enhancements

Potential improvements to the sharing system:

1. **Email Notifications**: Send email when someone shares an account or adds you as a collaborator
2. **WebSocket Support**: Real-time updates without polling
3. **Activity Log**: Track all sharing-related actions
4. **Bulk Invitations**: Invite multiple collaborators at once
5. **Permission Templates**: Predefined permission sets for common scenarios
6. **Expiring Links**: View-only links that automatically expire after a set time
7. **Password-Protected Links**: Add an extra layer of security to view-only links
8. **Audit Trail**: Detailed log of who accessed what and when
9. **Custom Permissions**: More granular control over what collaborators can do
10. **Share Specific Data**: Share only certain categories or date ranges

## Support

For issues or questions about the sharing system:
1. Check this documentation first
2. Review the verification checklist
3. Check the implementation summary
4. Contact the development team
