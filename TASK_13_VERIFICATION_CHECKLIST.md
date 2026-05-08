# Task 13 Verification Checklist

## API Endpoints

### Share Token Management
- [ ] POST /api/accounts/[id]/share generates a unique token
- [ ] POST /api/accounts/[id]/share returns shareUrl
- [ ] DELETE /api/accounts/[id]/share revokes the token
- [ ] Only account owner can generate/revoke share tokens

### Collaborator Management
- [ ] GET /api/accounts/[id]/collaborators returns list of collaborators
- [ ] POST /api/accounts/[id]/collaborators adds a collaborator
- [ ] POST validates email format and user existence
- [ ] POST prevents adding self as collaborator
- [ ] POST prevents duplicate collaborators
- [ ] DELETE /api/accounts/[id]/collaborators removes a collaborator
- [ ] Only account owner can manage collaborators

### Shared Account Access
- [ ] GET /api/accounts/shared/[token] returns account data
- [ ] Returns 404 for invalid tokens
- [ ] Includes transactions with creator information
- [ ] Includes budgets
- [ ] No authentication required

### Updated Endpoints
- [ ] GET /api/accounts returns ownedAccounts and sharedAccounts
- [ ] GET /api/accounts/[id] returns permission level
- [ ] GET /api/accounts/[id] works for shared accounts
- [ ] POST /api/transactions enforces READ_ONLY permission
- [ ] POST /api/transactions sets createdById

## UI Components

### ShareDialog
- [ ] Opens when Share button clicked
- [ ] Shows two tabs: View-Only Link and Collaborators
- [ ] View-Only Link tab generates share link
- [ ] Copy button copies link to clipboard
- [ ] Revoke button removes share token
- [ ] Collaborators tab shows add form
- [ ] Permission dropdown works (READ_ONLY, FULL_ACCESS)
- [ ] Add button validates email
- [ ] Shows success/error messages
- [ ] Displays CollaboratorList

### CollaboratorList
- [ ] Displays all collaborators
- [ ] Shows user name/email
- [ ] Shows permission badge
- [ ] Remove button works
- [ ] Refreshes after changes
- [ ] Shows empty state when no collaborators

### SharedAccountBanner
- [ ] Shows on shared accounts
- [ ] Displays owner information
- [ ] Shows permission badge
- [ ] Hidden for account owners

### Shared Account Page
- [ ] Accessible via /shared/[token]
- [ ] Shows "View Only" badge
- [ ] Displays account name and owner
- [ ] Shows summary cards (income, expenses, balance)
- [ ] Displays budgets with progress bars
- [ ] Shows all transactions
- [ ] Displays transaction creator
- [ ] Shows error for invalid tokens

### Accounts Page
- [ ] Share button appears on each account
- [ ] ShareDialog opens correctly
- [ ] Existing functionality still works

## Functional Requirements

### Requirement 8.1: Share Options
- [ ] User can generate view-only link
- [ ] User can send collaboration invite
- [ ] Both options available in UI

### Requirement 8.2: View-Only Links
- [ ] Generates secure, unique token
- [ ] Creates shareable URL
- [ ] Token is 64 characters long

### Requirement 8.3: View-Only Access
- [ ] Anyone with link can view account
- [ ] Shows all transactions
- [ ] Shows all budgets
- [ ] Shows insights/summaries
- [ ] No modification possible

### Requirement 8.4: Collaboration Invites
- [ ] Can invite by email
- [ ] User must be registered
- [ ] Can set permission level
- [ ] FULL_ACCESS can add/edit/delete
- [ ] READ_ONLY can only view

### Requirement 8.5: Transaction Creator Tracking
- [ ] Shows who created each transaction
- [ ] Displays in shared account view
- [ ] Shows in transaction lists
- [ ] Shows name or email

### Requirement 8.6: Revoke Access
- [ ] Can disable share links
- [ ] Can remove collaborators
- [ ] Both available in UI
- [ ] Changes take effect immediately

### Requirement 8.7: Real-Time Updates
- [ ] React Query invalidates cache on changes
- [ ] Collaborator list updates after add/remove
- [ ] Transaction list updates
- [ ] Multiple users see changes (via polling)

## Security Checks

- [ ] Share tokens are cryptographically secure
- [ ] Only owners can manage sharing
- [ ] Permission checks enforced in API
- [ ] READ_ONLY users cannot modify data
- [ ] Shared account queries use proper OR clauses
- [ ] Session validation on all protected endpoints

## Manual Testing Steps

1. **Generate Share Link**
   - Go to Accounts page
   - Click Share button on an account
   - Go to "View-Only Link" tab
   - Click "Generate Share Link"
   - Verify link is generated
   - Copy link and open in incognito window
   - Verify account data is visible

2. **Add Collaborator**
   - Go to Accounts page
   - Click Share button
   - Go to "Collaborators" tab
   - Enter email of registered user
   - Select permission level
   - Click "Add Collaborator"
   - Verify collaborator appears in list

3. **Test Permissions**
   - Login as collaborator user
   - Verify shared account appears in account list
   - If READ_ONLY: verify cannot add transactions
   - If FULL_ACCESS: verify can add transactions
   - Verify SharedAccountBanner shows

4. **Remove Access**
   - As owner, go to Share dialog
   - Remove a collaborator
   - Verify they no longer see the account
   - Revoke share link
   - Verify link no longer works

5. **Transaction Creator**
   - Add transaction as owner
   - Add transaction as collaborator
   - View in shared account page
   - Verify creator is shown for each

## Build Verification

- [ ] TypeScript compilation succeeds
- [ ] No linting errors
- [ ] All imports resolve correctly
- [ ] No runtime errors in console

## Dependencies

- [ ] @radix-ui/react-tabs installed
- [ ] All other dependencies present
