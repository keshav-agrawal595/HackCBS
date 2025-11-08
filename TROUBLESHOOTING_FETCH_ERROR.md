# Troubleshooting Guide - Network/Fetch Errors

## Error: "TypeError: fetch failed" in Gemini API

This error occurs when the backend cannot connect to Google's Gemini API.

### Common Causes & Solutions

#### 1. ✅ Check Internet Connection

**Problem:** No internet or unstable connection

**Solution:**
```powershell
# Test internet connectivity
ping google.com

# Test if you can reach Gemini API
curl https://generativelanguage.googleapis.com
```

#### 2. ✅ Verify API Key

**Problem:** Invalid or missing GEMINI_API_KEY

**Solution:**
1. Check your `.env` file in backend-gemini folder
2. Ensure GEMINI_API_KEY is set correctly
3. Get a new key from: https://makersuite.google.com/app/apikey
4. Restart backend after updating .env

```env
GEMINI_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXX
```

**Test your API key:**
```powershell
# Replace YOUR_API_KEY with your actual key
curl "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=YOUR_API_KEY" -H "Content-Type: application/json" -d '{\"contents\":[{\"parts\":[{\"text\":\"Hello\"}]}]}'
```

#### 3. ✅ Check Firewall/Antivirus

**Problem:** Firewall blocking outbound connections

**Solution:**
1. Temporarily disable firewall and test
2. Add exception for Node.js
3. Add exception for these domains:
   - `*.googleapis.com`
   - `generativelanguage.googleapis.com`

**Windows Firewall:**
- Control Panel → Windows Defender Firewall
- Allow an app through firewall
- Find "Node.js" and check both Private and Public

#### 4. ✅ Check Proxy Settings

**Problem:** Corporate proxy blocking requests

**Solution:**

If you're behind a proxy, set these environment variables:

```powershell
# In PowerShell
$env:HTTP_PROXY="http://proxy-server:port"
$env:HTTPS_PROXY="http://proxy-server:port"

# Or add to .env file
HTTP_PROXY=http://proxy-server:port
HTTPS_PROXY=http://proxy-server:port
```

#### 5. ✅ Verify Model Name

**Problem:** Using wrong/non-existent model name

**Fixed in your code:**
- Changed from `gemini-2.5-flash` (doesn't exist)
- To `gemini-1.5-flash` (correct)

**Valid Gemini models:**
- `gemini-1.5-flash` ✅ (recommended for speed)
- `gemini-1.5-pro` ✅ (better quality)
- `gemini-pro` ✅ (older version)
- `gemini-pro-vision` ✅ (for images)

#### 6. ✅ Check DNS Resolution

**Problem:** Cannot resolve Google API domains

**Solution:**
```powershell
# Test DNS resolution
nslookup generativelanguage.googleapis.com

# If it fails, try changing DNS to Google's
# 1. Open Network Settings
# 2. Change adapter options
# 3. Right-click your network → Properties
# 4. IPv4 → Properties
# 5. Use these DNS servers:
#    Preferred: 8.8.8.8
#    Alternate: 8.8.4.4
```

#### 7. ✅ Check API Quota

**Problem:** Exceeded API quota/rate limit

**Solution:**
1. Go to Google Cloud Console
2. Check API quotas
3. Wait or upgrade plan

**Check current usage:**
https://console.cloud.google.com/apis/api/generativelanguage.googleapis.com

#### 8. ✅ Regional Restrictions

**Problem:** Gemini API not available in your region

**Solution:**
- Check if Gemini is available: https://ai.google.dev/available-regions
- Use VPN if necessary
- Consider using different region endpoint

#### 9. ✅ Node.js/Package Issues

**Problem:** Outdated packages or Node version

**Solution:**
```powershell
# Update packages
cd backend-gemini
npm update @google/generative-ai

# Check Node version (should be 16+)
node --version

# Reinstall dependencies
rm -r node_modules
rm package-lock.json
npm install
```

#### 10. ✅ SSL/Certificate Issues

**Problem:** SSL certificate verification failing

**Solution (temporary, for testing only):**
```javascript
// In index.js, add at the top (NOT for production!)
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
```

**Better solution:**
```powershell
# Update Node.js certificates
npm install -g win-node-env
```

### Quick Diagnostic Commands

Run these to gather information:

```powershell
# 1. Check environment
echo $env:GEMINI_API_KEY

# 2. Check Node version
node --version

# 3. Check internet
ping 8.8.8.8

# 4. Check API endpoint
curl https://generativelanguage.googleapis.com

# 5. Test with minimal request
node -e "import('node-fetch').then(fetch => fetch.default('https://www.google.com').then(r => console.log('OK')).catch(e => console.log('FAIL', e)))"
```

### Error Messages & Meanings

| Error Message | Likely Cause |
|--------------|--------------|
| `ENOTFOUND` | DNS resolution failed |
| `ETIMEDOUT` | Connection timeout (firewall/network) |
| `ECONNREFUSED` | Wrong endpoint or blocked |
| `403 Forbidden` | Invalid API key |
| `429 Too Many Requests` | Rate limit exceeded |
| `CERT_HAS_EXPIRED` | SSL certificate issue |

### Testing the Fix

After applying solutions, test with:

```powershell
# Restart backend
cd backend-gemini
npm start

# In another terminal, test chat endpoint
curl -X POST http://localhost:3000/api/chat `
  -H "Content-Type: application/json" `
  -H "Authorization: Bearer YOUR_JWT_TOKEN" `
  -d '{\"message\": \"Hello\"}'
```

### Still Not Working?

1. **Check backend logs** for detailed error messages
2. **Enable debug mode:**
   ```javascript
   // In index.js, add before genAI initialization
   process.env.DEBUG = 'google-ai:*';
   ```

3. **Try alternative approach:**
   ```javascript
   // Use REST API directly instead of SDK
   const response = await axios.post(
     `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
     {
       contents: [{
         parts: [{ text: prompt }]
       }]
     }
   );
   ```

4. **Contact support:**
   - Google AI Discord: https://discord.gg/google-ai
   - Stack Overflow with tag: `google-gemini-api`

### Prevention Tips

✅ Always use environment variables for API keys  
✅ Set up error handling for network requests  
✅ Implement retry logic for transient failures  
✅ Monitor API quotas and usage  
✅ Keep packages updated  
✅ Test API connectivity before deployment  

### Updated Code

The error has been fixed in your code:

**backend-gemini/index.js:**
- ✅ Changed model from `gemini-2.5-flash` to `gemini-1.5-flash`
- ✅ Added better error handling for Gemini API calls
- ✅ Added fallback response on API failure

**vision-service.py:**
- ✅ Changed model from `gemini-2.5-flash` to `gemini-1.5-flash`

**Now restart your backend:**
```powershell
# Stop current backend (Ctrl+C)
# Then restart:
cd backend-gemini
npm start
```

The error should be resolved! 🎉
