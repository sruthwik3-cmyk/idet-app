# 📸 File Upload Feature - Visual Guide

## What Users Will See

### 1. Add Document Page - File Upload Section

```
┌─────────────────────────────────────────────────────────────┐
│  📄 Upload Document File (Optional)                         │
│  Upload a PDF or image of your document for easy access     │
│  later (Max 10MB)                                           │
│                                                              │
│  ┌──────────────────┐                                       │
│  │  📤 Choose File  │  ← Click to select file              │
│  └──────────────────┘                                       │
│  Supported: PDF, JPG, PNG, WEBP (Max 10MB)                 │
└─────────────────────────────────────────────────────────────┘
```

### 2. After Selecting a File - Preview

```
┌─────────────────────────────────────────────────────────────┐
│  📄 Upload Document File (Optional)                         │
│  Upload a PDF or image of your document for easy access     │
│  later (Max 10MB)                                           │
│                                                              │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ 📄 my-passport.pdf                              ❌    │  │
│  │    2.45 MB                                            │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 3. Edit Mode - Existing File

```
┌─────────────────────────────────────────────────────────────┐
│  📄 Upload Document File (Optional)                         │
│  Upload a PDF or image of your document for easy access     │
│  later (Max 10MB)                                           │
│                                                              │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ ✅ Current file uploaded                              │  │
│  │                                                        │  │
│  │    [📥 View/Download]  [❌]                           │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 4. Dashboard - Document with File

```
┌─────────────────────────────────────────────────────────────┐
│  Your Documents                          🔍 Search...        │
│                                                              │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ Passport  🚨 CRITICAL  ⚠️ Expiring Soon               │  │
│  │ Expires in 5 days (17/02/2026) • Personal            │  │
│  │                                                        │  │
│  │                    [🔗] [✏️] [🗑️]  ← Download icon   │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Color Scheme

### File Upload Section:
- **Border**: Dashed, Primary color (#818cf8)
- **Background**: Light primary (rgba(129, 140, 248, 0.05))
- **Button**: Primary color with hover glow

### File Preview:
- **Background**: Light primary (rgba(129, 140, 248, 0.1))
- **Border**: Solid primary (#818cf8)
- **Text**: White/Primary

### Existing File:
- **Background**: Light success (rgba(52, 211, 153, 0.1))
- **Border**: Success color (#34d399)
- **Button**: Success color

### Dashboard Icon:
- **Color**: Success green (#34d399)
- **Hover**: Scale + glow effect

---

## User Flow Diagram

```
┌─────────────────┐
│  Add Document   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Fill Details    │
│ (Name, Date...) │
└────────┬────────┘
         │
         ▼
┌─────────────────┐      ┌──────────────┐
│ Upload File?    │─NO──▶│ Save Without │
│   (Optional)    │      │     File     │
└────────┬────────┘      └──────────────┘
         │
        YES
         │
         ▼
┌─────────────────┐
│  Choose File    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  File Preview   │
│  (Name + Size)  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Save Document  │
│  (Uploads File) │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Dashboard     │
│ (Shows Download │
│      Icon)      │
└─────────────────┘
```

---

## Interaction States

### Choose File Button:
- **Normal**: Primary color, white text
- **Hover**: Scale 1.05, glow effect
- **Active**: Scale 0.95

### File Preview:
- **Appear**: Fade-in animation
- **Remove**: Fade-out animation

### Download Icon:
- **Normal**: Green color, opacity 0.7
- **Hover**: Opacity 1, scale 1.1
- **Click**: Opens file in new tab

---

## Responsive Design

### Desktop (1920px+):
- Full width file upload section
- Large buttons
- Spacious layout

### Laptop (1366px - 1920px):
- Standard width
- Normal buttons
- Comfortable spacing

### Tablet (768px - 1366px):
- Adjusted width
- Slightly smaller buttons
- Compact spacing

### Mobile (< 768px):
- Full width
- Touch-friendly buttons
- Stacked layout

---

## Accessibility

### Keyboard Navigation:
- Tab to "Choose File" button
- Enter to open file picker
- Tab to Remove button
- Enter to remove file

### Screen Readers:
- "Upload Document File (Optional)"
- "Choose File button"
- "Remove file button"
- "View/Download file button"

### Visual Indicators:
- Clear labels
- Icon + text buttons
- Color + text (not just color)
- Focus outlines

---

## Error States

### File Too Large:
```
❌ File size must be less than 10MB
```

### Invalid File Type:
```
❌ Only PDF and image files (JPG, PNG, WEBP) are allowed
```

### Upload Failed:
```
❌ Failed to upload file. Please try again.
```

---

## Success States

### File Selected:
```
✅ File selected: my-passport.pdf (2.45 MB)
```

### File Uploaded:
```
✅ Document saved with file!
```

### File Downloaded:
```
(Opens in new tab automatically)
```

---

## Animation Timings

- **Fade-in**: 0.3s ease
- **Scale hover**: 0.3s ease
- **Button press**: 0.1s ease
- **Modal appear**: 0.4s ease

---

## Icon Reference

- 📄 **FileText**: File upload label
- 📤 **Upload**: Choose file button
- ❌ **X**: Remove file button
- 📥 **Download**: View/Download button
- 🔗 **ExternalLink**: Dashboard download icon
- ✅ **CheckCircle**: Success indicator

---

This visual guide helps understand what users will see and how they'll interact with the file upload feature! 🎨
