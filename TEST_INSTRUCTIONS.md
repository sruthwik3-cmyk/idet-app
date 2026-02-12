# 🧪 TESTING ALERT SYSTEM

## How to Test Sound & Email Alerts

### Step 1: Open Browser Console
1. Press `F12` on your keyboard
2. Click the **Console** tab
3. Leave it open while testing

### Step 2: Check the Console Output

You should see:
```
=== ALERT SYSTEM DEBUG ===
Today: 2026-02-12
Documents: [array of all your documents with days left]
```

For EACH document, you'll see:
- `name`: Document name
- `daysLeft`: Days until expiry
- `shouldTriggerSound`: true if exactly 30 or 7 days
- `soundAlreadyPlayed`: true if sound already played today
- `emailSent30`: true if 30-day email was sent
- `emailSent7`: true if 7-day email was sent
- `willPlaySound`: true if sound WILL play NOW

### Step 3: Test Sound

**To force a test:**
1. Open browser console (F12)
2. Type this and press Enter:
```javascript
localStorage.removeItem('soundAlertsPlayed');
location.reload();
```

This will reset the "already played" tracker and reload the page.

### Step 4: Check If Sound SHOULD Play

Look at the console output for `willPlaySound: true`

- If `willPlaySound: true` → Sound SHOULD play
- If NO documents have `willPlaySound: true` → Sound will NOT play (correct)

### Step 5: Email Testing

**Current Date:** 2026-02-12

**For 30-day alert:** Create a document with expiry date `2026-03-14` (exactly 30 days)
**For 7-day alert:** Create a document with expiry date `2026-02-19` (exactly 7 days)

Check the console for:
```
[30-Day Alert] Triggering for DocName, daysLeft: 30
```

or

```
[7-Day Alert] Triggering for DocName, daysLeft: 7
```

---

## Common Issues

### Sound plays on wrong days
- Check console for `daysLeft` value
- It should ONLY play when `daysLeft === 30` or `daysLeft === 7`

### Sound plays multiple times
- Check console for `soundAlreadyPlayed: true`
- Once played, it should be marked as played

### Email not sending
- Check console for "[30-Day Alert] Failed" or "[7-Day Alert] Failed"
- Check if Gmail service is configured on Render (Environment Variables)
