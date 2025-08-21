# Commerce Layer Authentication Error Matrix

This document captures the various error shapes that can be returned by the `authenticate()` promise from `@commercelayer/js-auth` to ensure robust error handling.

## Error Investigation Status

✅ **Console logging added to capture error shapes**

- LoginForm.tsx: Added comprehensive error logging in catch block (line 66-88)
- SignUpForm.tsx: Added comprehensive error logging in catch block (line 89-111)
- oauthStorage.ts: Added comprehensive error logging in try/catch block (line 177-195)

🔄 **Next Steps - Manual Testing Required**

1. Test invalid password to capture Commerce Layer API error
2. Test offline scenario to capture network error
3. Document findings below

## Error Shape Analysis

### 1. Commerce Layer API Error (Invalid Credentials)

**Test Case**: Submit login form with invalid password

```typescript
// Expected fields to investigate:
{
  code?: string,
  status?: string | number,
  title?: string,
  detail?: string,
  errors?: Array<any>,
  message?: string,
  name?: string,
  // ... other potential fields
}
```

**Actual Shape**: _To be filled after testing_

### 2. Network Error (Offline/Connection Issues)

**Test Case**: Disable network connection and attempt authentication

```typescript
// Expected fields to investigate:
{
  message?: string,
  name?: string,
  code?: string,
  response?: any,
  request?: any,
  config?: any,
  // ... other potential fields
}
```

**Actual Shape**: _To be filled after testing_

### 3. Additional Error Scenarios

**Other potential error cases to test**:

- Invalid domain/endpoint configuration
- Malformed client credentials
- Rate limiting responses
- Server errors (5xx)

## Implementation Notes

- The authenticate() function is used in three locations:

  1. `LoginForm.tsx` - User login with email/password
  2. `SignUpForm.tsx` - Post-signup automatic login
  3. `oauthStorage.ts` - Client credentials flow for sales channel tokens

- Each location may encounter different error scenarios based on the authentication flow used

## Testing Instructions

1. **Invalid Password Test**:

   - Navigate to login form
   - Enter valid email but incorrect password
   - Submit form and check browser console for "LoginForm authenticate() error:"

2. **Network Error Test**:

   - Open browser developer tools
   - Navigate to Network tab and set to "Offline"
   - Attempt to login
   - Check console for error logs

3. **Document Findings**:
   - Copy the logged error objects
   - Update this document with actual error shapes
   - Remove console.log statements after documentation is complete

## Cleanup Checklist

- [ ] Remove console.log from LoginForm.tsx
- [ ] Remove console.log from SignUpForm.tsx
- [ ] Remove console.log from oauthStorage.ts
- [ ] Complete error shape documentation above
