# Profile Creation Setup Guide

## Problem

Users are created in Supabase Auth but their profiles are not being added to the `profiles` table in the database.

## Root Cause

The database trigger (`handle_new_user`) that automatically creates profiles when users sign up may not be set up in your Supabase database.

## Solution

We've implemented a **two-layer approach**:

1. **Database Trigger** (Primary): Automatically creates profiles
2. **Fallback in Code** (Secondary): Creates profile if trigger fails

---

## Step 1: Set Up the Database Trigger

### Option A: Using Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Click **New Query**
4. Copy and paste the contents of `apps/admin/scripts/03-setup-profile-trigger.sql`
5. Click **Run** or press `Cmd/Ctrl + Enter`
6. Verify the trigger was created (the query will show the trigger details)

### Option B: Using the SQL Script Directly

Run this SQL in your Supabase SQL Editor:

```sql
-- Create function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    COALESCE(NEW.raw_user_meta_data->>'role', 'learner')
  );
  RETURN NEW;
EXCEPTION
  WHEN unique_violation THEN
    -- Profile already exists, just return
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger for new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### Verify the Trigger

Run this query to verify the trigger exists:

```sql
SELECT
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';
```

You should see one row with:
- `trigger_name`: `on_auth_user_created`
- `event_manipulation`: `INSERT`
- `event_object_table`: `users`

---

## Step 2: Fallback Mechanism (Already Implemented)

The signup code now includes a fallback that:

1. **Waits 500ms** for the trigger to fire
2. **Checks** if profile was created
3. **Creates profile** using `upsert` if it doesn't exist

This ensures profiles are **always created**, even if:
- The trigger is not set up
- The trigger fails for some reason
- There's a race condition

### Code Flow

```typescript
// 1. Create user in Supabase Auth
const { data, error } = await supabase.auth.signUp({
  email,
  password,
  options: {
    data: { full_name: fullName, role: role }
  }
});

// 2. Wait for trigger to fire
await new Promise(resolve => setTimeout(resolve, 500));

// 3. Check if profile exists
const { data: existingProfile } = await supabase
  .from('profiles')
  .select('id')
  .eq('id', data.user.id)
  .single();

// 4. Create profile if trigger didn't
if (!existingProfile) {
  await supabase.from('profiles').upsert({
    id: data.user.id,
    email: data.user.email!,
    full_name: fullName,
    role: role,
  }, { onConflict: 'id' });
}
```

---

## Step 3: Fix Existing Users (Optional)

If you have users in `auth.users` without profiles, run this script to create their profiles:

```sql
-- Create profiles for existing users who don't have one
INSERT INTO public.profiles (id, email, full_name, role)
SELECT
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'full_name', au.email),
  COALESCE(au.raw_user_meta_data->>'role', 'learner')
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
WHERE p.id IS NULL;
```

---

## Testing

### Test New User Signup

1. **Sign up** a new user from the mobile app
2. **Check Supabase Dashboard**:
   - Go to **Authentication** → **Users** - user should be there
   - Go to **Table Editor** → **profiles** - profile should be there
3. **Check console logs**:
   - If you see "Trigger did not create profile, creating manually as fallback" - the fallback worked
   - If you don't see this message - the trigger worked correctly

### Expected Behavior

✅ User created in `auth.users`
✅ Profile created in `profiles` table
✅ User can log in immediately
✅ No duplicate key errors

---

## Troubleshooting

### Issue: Trigger Not Firing

**Symptoms:**
- User created in auth
- No profile in database
- Console shows: "Trigger did not create profile, creating manually as fallback"

**Solution:**
1. Verify trigger exists (see "Verify the Trigger" section)
2. Check Supabase logs for trigger errors
3. The fallback will create the profile anyway

### Issue: Duplicate Key Error

**Symptoms:**
```
duplicate key value violates unique constraint "profiles_pkey"
```

**Solution:**
- This should not happen anymore with the `upsert` approach
- If it does, check if you have multiple signup calls happening

### Issue: Profile Has Wrong Data

**Symptoms:**
- Profile created but `full_name` or `role` is wrong

**Solution:**
1. Check that metadata is passed correctly in signup:
   ```typescript
   options: {
     data: {
       full_name: fullName,  // Make sure this is correct
       role: role,            // Make sure this is correct
     }
   }
   ```
2. Update the trigger to use correct metadata keys

---

## How It Works

### Database Trigger Flow

```
User Signs Up
     ↓
Supabase creates user in auth.users
     ↓
Trigger fires: on_auth_user_created
     ↓
Trigger function: handle_new_user()
     ↓
Extracts metadata from raw_user_meta_data
     ↓
Inserts profile into profiles table
     ↓
Done! ✅
```

### Fallback Flow (if trigger fails)

```
User Signs Up
     ↓
Wait 500ms for trigger
     ↓
Check if profile exists
     ↓
Profile missing? → Create with upsert
     ↓
Done! ✅
```

---

## Files Modified

1. **`apps/mobile/contexts/AuthContext.tsx`**
   - Added fallback profile creation
   - Uses `upsert` to prevent duplicates

2. **`apps/admin/scripts/03-setup-profile-trigger.sql`** (NEW)
   - SQL script to set up the trigger
   - Includes error handling

---

## Best Practices

1. **Always set up the trigger** - It's more reliable and faster
2. **Keep the fallback** - It ensures robustness
3. **Use upsert** - Prevents duplicate key errors
4. **Pass metadata** - Include `full_name` and `role` in signup options
5. **Test thoroughly** - Verify both trigger and fallback work

---

## Summary

✅ **Trigger**: Primary mechanism for profile creation
✅ **Fallback**: Ensures profiles are always created
✅ **Upsert**: Prevents duplicate key errors
✅ **Robust**: Works even if trigger is not set up

Now signup should work reliably with profiles always being created! 🎉
