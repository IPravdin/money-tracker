# Category System Documentation

## Overview

The Money Tracker application includes a comprehensive category system that allows users to organize their transactions with predefined categories and create custom categories with icons and colors.

## Features

### 1. Predefined Categories

The system includes predefined categories for both income and expenses:

**Expense Categories:**
- Food & Dining (🍴 Red)
- Transportation (🚗 Blue)
- Shopping (🛍️ Pink)
- Entertainment (🎬 Violet)
- Bills & Utilities (🧾 Amber)
- Healthcare (❤️ Emerald)
- Travel (✈️ Cyan)
- Education (🎓 Indigo)
- Gifts & Donations (🎁 Rose)
- Personal Care (✨ Purple)

**Income Categories:**
- Salary (💵 Green)
- Freelance (💼 Teal)
- Investment (📈 Blue)
- Gift (🎁 Rose)
- Refund (📦 Violet)
- Other Income (💵 Emerald)

### 2. Custom Categories

Users can create custom categories with:
- Custom name (up to 50 characters)
- Choice of transaction type (Income or Expense)
- Selection from 15 predefined icons
- Selection from 18 color options
- Real-time preview before creation

### 3. Category Validation

The system includes robust validation:
- Category names must be 1-50 characters
- Duplicate category names are prevented (case-insensitive)
- Empty or whitespace-only names are rejected
- Automatic fallback to "Uncategorized" for invalid categories

### 4. Uncategorized Fallback

If a transaction doesn't have a category or has an invalid category:
- It automatically falls back to "Uncategorized"
- Displayed with a help circle icon (❓) in gray
- Ensures all transactions always have a valid category

## Components

### CategoryPicker

A dropdown component for selecting categories with visual icons and colors.

**Props:**
- `value`: Current selected category name
- `onChange`: Callback when category is selected
- `type`: Transaction type (INCOME or EXPENSE)
- `customCategories`: Array of custom categories
- `onCreateCategory`: Callback to open create category dialog
- `disabled`: Whether the picker is disabled

**Usage:**
```tsx
<CategoryPicker
  value={selectedCategory}
  onChange={(category) => setSelectedCategory(category)}
  type={TransactionType.EXPENSE}
  customCategories={customCategories}
  onCreateCategory={() => setShowDialog(true)}
/>
```

### CreateCategoryDialog

A dialog for creating custom categories with icon and color selection.

**Props:**
- `defaultType`: Default transaction type
- `customCategories`: Existing custom categories for validation
- `onCreateCategory`: Callback when category is created
- `onCancel`: Callback when dialog is cancelled

**Usage:**
```tsx
<Dialog open={showDialog} onOpenChange={setShowDialog}>
  <DialogContent>
    <CreateCategoryDialog
      defaultType={TransactionType.EXPENSE}
      customCategories={customCategories}
      onCreateCategory={handleCreate}
      onCancel={() => setShowDialog(false)}
    />
  </DialogContent>
</Dialog>
```

### CategoryManagement

A full-page component for managing all categories (predefined and custom).

**Props:**
- `customCategories`: Array of custom categories
- `onAddCategory`: Callback when a category is added
- `onDeleteCategory`: Callback when a category is deleted

**Usage:**
```tsx
<CategoryManagement
  customCategories={customCategories}
  onAddCategory={addCategory}
  onDeleteCategory={removeCategory}
/>
```

## Hooks

### useCustomCategories

A React hook for managing custom categories with localStorage persistence.

**Returns:**
- `customCategories`: Array of custom categories
- `isLoaded`: Whether categories have been loaded from storage
- `addCategory`: Function to add a new category
- `removeCategory`: Function to remove a category by ID
- `updateCategory`: Function to update a category
- `getCategoryById`: Function to find a category by ID
- `getCategoryByName`: Function to find a category by name

**Usage:**
```tsx
const {
  customCategories,
  isLoaded,
  addCategory,
  removeCategory
} = useCustomCategories();
```

## Utility Functions

### getCategoriesByType(type, customCategories?)

Returns all categories (predefined + custom) for a given transaction type.

### findCategoryByName(name, customCategories?)

Finds a category by name (case-insensitive).

### findCategoryById(id, customCategories?)

Finds a category by its unique ID.

### validateCategoryName(name, customCategories?)

Validates a category name and returns validation result.

### getCategoryOrFallback(categoryName, customCategories?)

Returns the category if valid, otherwise returns "Uncategorized".

### createCustomCategory(name, type, icon?, color?)

Creates a new custom category definition.

## Data Storage

Custom categories are stored in localStorage with the key `money-tracker-custom-categories`.

**Storage Format:**
```json
[
  {
    "id": "custom-pet-care",
    "name": "Pet Care",
    "color": "#ef4444",
    "type": "EXPENSE",
    "isCustom": true
  }
]
```

**Note:** Icons are not serialized to JSON. They are stored as references and reconstructed when loaded.

## Integration with Transaction Forms

The category system is integrated into:
- `AddTransactionForm`: Uses CategoryPicker for category selection
- `EditTransactionForm`: Uses CategoryPicker for category editing

Both forms include:
- Inline category creation via dialog
- Automatic category validation
- Custom category support

## API Integration

The category system is client-side only and doesn't require API endpoints. Categories are:
- Stored in localStorage for custom categories
- Predefined categories are hardcoded in the application
- Transaction API accepts any string as category name
- Validation happens on the client side

## Future Enhancements

Potential improvements for the category system:
1. Server-side storage for custom categories
2. Category usage statistics
3. Category-based budgeting integration
4. Category icons from external icon libraries
5. Category sharing between users
6. Category templates/presets
7. Bulk category operations
8. Category import/export

## Requirements Mapping

This implementation satisfies the following requirements:

- **Requirement 2.1**: Predefined categories provided (Food, Transportation, Entertainment, Bills, Shopping, Health, etc.)
- **Requirement 2.2**: Category selection and association with transactions
- **Requirement 2.3**: Category display in transaction views
- **Requirement 2.4**: Custom category creation functionality
- **Requirement 2.5**: "Uncategorized" fallback for missing categories

## Testing

The category system includes comprehensive unit tests in `src/lib/categories.test.ts` covering:
- Category retrieval by type
- Category search by name and ID
- Category name validation
- Custom category creation
- Fallback behavior
- Predefined category completeness

To run tests (when Jest is configured):
```bash
pnpm test
```

## Troubleshooting

### Categories not persisting
- Check browser localStorage is enabled
- Check for localStorage quota errors in console
- Clear localStorage and try again

### Custom category not appearing
- Ensure `useCustomCategories` hook is used
- Check `isLoaded` is true before rendering
- Verify category was added successfully

### Icons not displaying
- Ensure lucide-react package is installed
- Check icon imports in categories.ts
- Verify icon component is rendered correctly

## Accessibility

The category system includes:
- Keyboard navigation support in CategoryPicker
- ARIA labels for screen readers
- Color contrast compliance for category colors
- Focus management in dialogs
- Semantic HTML structure
