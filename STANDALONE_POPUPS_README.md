# Standalone Match Management Popups

Three independent dialog popups ready to integrate into your existing website.

## 📦 Components

### 1. **ManagerMatchPopup** - Create New Matches
Location: `/src/app/components/standalone/ManagerMatchPopup.tsx`

Creates new matches with all required details (client info, teams, venue, tournament, etc.)

### 2. **AnalystMatchPopup** - Submit Analysis
Location: `/src/app/components/standalone/AnalystMatchPopup.tsx`

Allows analysts to submit their completed analysis with TAT tracking and remarks.

### 3. **ReviewerMatchPopup** - Complete Review
Location: `/src/app/components/standalone/ReviewerMatchPopup.tsx`

Enables reviewers to QC check matches and optionally send back for rework.

---

## 🚀 Quick Start

### Step 1: Import the Component

```tsx
import { ManagerMatchPopup } from "./components/standalone/ManagerMatchPopup";
```

### Step 2: Add State

```tsx
const [openManager, setOpenManager] = useState(false);
```

### Step 3: Add Trigger Button

```tsx
<button onClick={() => setOpenManager(true)}>
  Create Match
</button>
```

### Step 4: Add Popup Component

```tsx
<ManagerMatchPopup 
  open={openManager} 
  onOpenChange={setOpenManager}
  onSuccess={() => {
    console.log("Match created!");
    // Refresh your data here
  }}
/>
```

---

## 📋 Component Props

### ManagerMatchPopup

```tsx
interface ManagerMatchPopupProps {
  open: boolean;                    // Controls popup visibility
  onOpenChange: (open: boolean) => void;  // Callback when popup opens/closes
  onSuccess?: () => void;           // Optional: Called after successful creation
}
```

**Usage:**
```tsx
<ManagerMatchPopup 
  open={isOpen} 
  onOpenChange={setIsOpen}
  onSuccess={() => refreshMatchList()}
/>
```

### AnalystMatchPopup

```tsx
interface AnalystMatchPopupProps {
  matchId: string;                  // Required: The match ID to update
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}
```

**Usage:**
```tsx
<AnalystMatchPopup 
  matchId="MATCH-2026-001"
  open={isOpen} 
  onOpenChange={setIsOpen}
  onSuccess={() => refreshMatchList()}
/>
```

### ReviewerMatchPopup

```tsx
interface ReviewerMatchPopupProps {
  matchId: string;                  // Required: The match ID to review
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}
```

**Usage:**
```tsx
<ReviewerMatchPopup 
  matchId="MATCH-2026-001"
  open={isOpen} 
  onOpenChange={setIsOpen}
  onSuccess={() => refreshMatchList()}
/>
```

---

## 💡 Complete Example

```tsx
import { useState } from "react";
import { ManagerMatchPopup } from "./components/standalone/ManagerMatchPopup";
import { AnalystMatchPopup } from "./components/standalone/AnalystMatchPopup";
import { ReviewerMatchPopup } from "./components/standalone/ReviewerMatchPopup";

export function MyComponent() {
  // State for each popup
  const [openManager, setOpenManager] = useState(false);
  const [openAnalyst, setOpenAnalyst] = useState(false);
  const [openReviewer, setOpenReviewer] = useState(false);
  
  // Example match ID (in real app, this comes from your data)
  const selectedMatchId = "MATCH-2026-001";
  
  const handleSuccess = () => {
    console.log("Operation successful!");
    // Refresh your match list or update UI
  };

  return (
    <div>
      {/* Your existing website content */}
      
      {/* Trigger Buttons */}
      <button onClick={() => setOpenManager(true)}>
        Create Match
      </button>
      
      <button onClick={() => setOpenAnalyst(true)}>
        Submit Analysis
      </button>
      
      <button onClick={() => setOpenReviewer(true)}>
        Complete Review
      </button>
      
      {/* Popup Components */}
      <ManagerMatchPopup 
        open={openManager} 
        onOpenChange={setOpenManager}
        onSuccess={handleSuccess}
      />
      
      <AnalystMatchPopup 
        matchId={selectedMatchId}
        open={openAnalyst} 
        onOpenChange={setOpenAnalyst}
        onSuccess={handleSuccess}
      />
      
      <ReviewerMatchPopup 
        matchId={selectedMatchId}
        open={openReviewer} 
        onOpenChange={setOpenReviewer}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
```

---

## 🎯 Form Fields

### Manager Popup Fields:
- Client Name (Organizer) *
- Client Type * (Paid/Unpaid/Demo)
- Match Analysis Type *
- Team A *
- Team B *
- Game Time * (datetime)
- Match Country (Venue) *
- Tournament Name *
- Match Video Type * (YouTube/Vimeo/etc.)
- Match Age Group * (U13-Professional)
- Match Received On * (date)

### Analyst Popup Fields:
- Live Match * (Yes/No)
- Analysts * (Multiple analysts with name and ID)
- Analysis TAT (hours) *
- Analysis Start to End Time (hours) *
- Remarks (optional)

### Reviewer Popup Fields:
- Reviewed By (Your Name) *
- QC Error Count *
- Review TAT (hours) *
- Reviewer Remarks (optional)
- Send Back to Analyst (toggle switch)

---

## 🔧 Dependencies

These popups use the following UI components (already included):
- Dialog (from shadcn/ui)
- Button
- Input
- Label
- Select
- Textarea
- Switch
- Toast notifications (sonner)

Make sure these are available in your project.

---

## 🌐 API Integration

The popups connect to backend API routes:

### Manager (Create):
```
POST https://{projectId}.supabase.co/functions/v1/make-server-968c49f6/matches
```

### Analyst (Update):
```
PUT https://{projectId}.supabase.co/functions/v1/make-server-968c49f6/matches/{matchId}/analyst
```

### Reviewer (Update):
```
PUT https://{projectId}.supabase.co/functions/v1/make-server-968c49f6/matches/{matchId}/reviewer
```

---

## ⚡ Features

✅ **Fully Standalone** - Each popup is independent and self-contained
✅ **Form Validation** - Built-in validation for all required fields
✅ **Loading States** - Visual feedback during API calls
✅ **Error Handling** - User-friendly error messages
✅ **Success Callbacks** - Trigger actions after successful operations
✅ **Responsive Design** - Works on all screen sizes
✅ **Toast Notifications** - Success/error messages using Sonner
✅ **Auto-reset Forms** - Forms clear after successful submission

---

## 🎨 Customization

### Styling
The components use Tailwind CSS classes. You can customize by:
1. Modifying the className props
2. Updating your Tailwind theme
3. Adding custom CSS

### API Endpoints
Update the API URLs in each component:
```tsx
// Current format:
`https://${projectId}.supabase.co/functions/v1/make-server-968c49f6/matches`

// Change to your endpoint:
`https://your-api.com/matches`
```

---

## 📝 Notes

- **Manager Popup**: No matchId required - creates new matches
- **Analyst/Reviewer Popups**: Require a valid matchId prop
- All forms include validation and will prevent submission if required fields are empty
- Toast notifications appear automatically on success/error
- Forms automatically reset after successful submission

---

## 🐛 Troubleshooting

**Popup doesn't open:**
- Check that `open` state is being set to `true`
- Verify the Dialog component is rendered

**API errors:**
- Verify backend server is running
- Check console for detailed error messages
- Ensure `projectId` and `publicAnonKey` are correctly set

**Styling issues:**
- Ensure Tailwind CSS is properly configured
- Check that all UI components are imported correctly

---

## 📦 Files Location

```
/src/app/components/standalone/
├── ManagerMatchPopup.tsx       # Create matches
├── AnalystMatchPopup.tsx       # Submit analysis
├── ReviewerMatchPopup.tsx      # Complete review
└── StandalonePopupExample.tsx  # Usage example
```

---

## 🎉 Live Demo

See the "Standalone Popups" tab in the main app for a working demonstration with integration code examples.
