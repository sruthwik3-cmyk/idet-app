# Jarvis AI Setup Guide (Option 2)

## 🤖 Enable AI-Powered Jarvis with OpenAI

This guide shows you how to enable **Option 2** - AI-powered Jarvis that can answer ANY question using ChatGPT.

---

## 📋 What You Get with AI Mode

**FREE Mode (Option 1) - Currently Active:**
- ✅ Fast responses (instant)
- ✅ No cost
- ✅ Works offline
- ✅ Smart responses for common questions
- ❌ Limited to pre-programmed responses

**AI Mode (Option 2) - What You'll Get:**
- ✅ Answer ANY question (weather, news, general knowledge)
- ✅ Natural conversations like ChatGPT
- ✅ Context-aware responses
- ✅ Learns from conversation
- ❌ Costs money (~$0.002 per request)
- ❌ Requires internet
- ❌ Slower (1-3 seconds per response)

---

## 💰 Cost Breakdown

OpenAI charges per token (words):
- **GPT-3.5-turbo**: $0.002 per 1,000 tokens (~750 words)
- **Average voice command**: ~50 tokens = $0.0001 per request
- **100 commands**: ~$0.01 (1 cent)
- **1,000 commands**: ~$0.10 (10 cents)

**Example monthly cost:**
- Light use (50 commands/day): ~$1.50/month
- Medium use (200 commands/day): ~$6/month
- Heavy use (500 commands/day): ~$15/month

---

## 🚀 Setup Steps

### Step 1: Get OpenAI API Key

1. Go to: https://platform.openai.com/signup
2. Create an account (or sign in)
3. Add payment method: https://platform.openai.com/account/billing
4. Go to API Keys: https://platform.openai.com/api-keys
5. Click "Create new secret key"
6. Copy the key (starts with `sk-...`)

### Step 2: Add API Key to Your App

**For Local Development:**

1. Open `.env` file in your project root
2. Find this line:
   ```
   # VITE_OPENAI_API_KEY=sk-your-api-key-here
   ```
3. Uncomment and replace with your key:
   ```
   VITE_OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxx
   ```
4. Save the file

**For Render Deployment:**

1. Go to your Render dashboard
2. Select your web service
3. Go to "Environment" tab
4. Add new environment variable:
   - Key: `VITE_OPENAI_API_KEY`
   - Value: `sk-proj-xxxxxxxxxxxxx` (your API key)
5. Save changes (will trigger redeploy)

### Step 3: Enable AI Mode

1. Open `src/utils/aiService.ts`
2. Find this line:
   ```typescript
   export const AI_MODE_ENABLED = false;
   ```
3. Change to:
   ```typescript
   export const AI_MODE_ENABLED = true;
   ```
4. Save the file

### Step 4: Build and Deploy

```bash
npm run build
git add .
git commit -m "Enable AI-powered Jarvis"
git push origin main
```

Wait 3-5 minutes for Render to deploy.

---

## 🎯 Testing AI Mode

Once enabled, try these commands:

**General Knowledge:**
- "Jarvis, what's the capital of France?"
- "Tell me about black holes"
- "Who invented the telephone?"

**Current Events:**
- "What's happening in the world?"
- "Tell me the latest tech news"

**Complex Questions:**
- "Explain quantum computing in simple terms"
- "What's the difference between AI and machine learning?"

**Creative Requests:**
- "Write me a haiku about documents"
- "Tell me a story about a passport"

**Calculations:**
- "Convert 100 USD to EUR"
- "What's 15% of 250?"

---

## 🔄 Switching Between Modes

**To Disable AI Mode (back to FREE):**

1. Open `src/utils/aiService.ts`
2. Change:
   ```typescript
   export const AI_MODE_ENABLED = false;
   ```
3. Rebuild and deploy

**To Enable AI Mode:**

1. Change to `true`
2. Rebuild and deploy

---

## 🛡️ Security Notes

**⚠️ IMPORTANT:**

The current implementation uses `dangerouslyAllowBrowser: true` which exposes your API key in the browser. This is **NOT recommended for production**.

**For Production (Recommended):**

1. Create a backend API endpoint
2. Store API key on server (not in browser)
3. Frontend calls your backend
4. Backend calls OpenAI
5. Backend returns response to frontend

**Quick Fix for Now:**

Set usage limits in OpenAI dashboard:
1. Go to: https://platform.openai.com/account/limits
2. Set monthly spending limit (e.g., $10)
3. This prevents unexpected charges

---

## 📊 Monitoring Usage

Track your API usage:
1. Go to: https://platform.openai.com/usage
2. View daily/monthly costs
3. Set up billing alerts

---

## 🐛 Troubleshooting

**"AI Mode: DISABLED" in console:**
- Check if `AI_MODE_ENABLED = true` in `aiService.ts`
- Check if API key is set in `.env`
- Restart dev server after changing `.env`

**"Invalid API key" error:**
- Verify API key is correct
- Check if key starts with `sk-`
- Ensure no extra spaces in `.env`

**Slow responses:**
- Normal for AI mode (1-3 seconds)
- Check internet connection
- Try using GPT-3.5-turbo (faster than GPT-4)

**High costs:**
- Set usage limits in OpenAI dashboard
- Reduce `max_tokens` in `aiService.ts`
- Switch back to FREE mode

---

## 🎨 Customizing AI Personality

Edit the system prompt in `src/utils/aiService.ts`:

```typescript
const systemPrompt = `You are Jarvis, an intelligent AI assistant...

Your personality:
- Professional, polite, and helpful
- Address the user as "sir"
- Speak like Tony Stark's Jarvis
- Keep responses concise (1-3 sentences)
- Be witty but respectful

// Add your custom instructions here
`;
```

---

## 📈 Comparison

| Feature | FREE Mode | AI Mode |
|---------|-----------|---------|
| Speed | Instant | 1-3 seconds |
| Cost | $0 | ~$0.0001/request |
| Internet | Not required | Required |
| Knowledge | Pre-programmed | Unlimited |
| Conversations | Limited | Natural |
| Setup | None | API key needed |

---

## 🎯 Recommendation

**Start with FREE Mode (Option 1):**
- Test the app first
- See if basic commands meet your needs
- No setup or cost

**Upgrade to AI Mode (Option 2) if:**
- You want unlimited conversations
- You need general knowledge answers
- You're okay with small costs
- You want ChatGPT-like experience

---

## 📞 Support

Need help?
- Check console logs (F12 in browser)
- Review OpenAI documentation: https://platform.openai.com/docs
- Check API status: https://status.openai.com

---

**Current Status: FREE Mode (Option 1) Active** ✅

To enable AI Mode, follow the setup steps above!
