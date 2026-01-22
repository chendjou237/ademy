---
inclusion: always
---

# Translation Implementation Guide

## Current Status

✅ **Fully Translated:**
- Navigation (all nav items)
- Language switcher
- Courses listing page
- Lesson player component
- Video player component

⚠️ **Partially Translated:**
- Home page (needs client wrapper)
- Course detail page
- Dashboards (learner, trainer, admin)
- Auth pages

## Quick Translation Pattern

### For Client Components

```tsx
"use client"
import { useTranslation } from "@/lib/i18n/context"

export function MyComponent() {
  const { t } = useTranslation()

  return <h1>{t("page.title")}</h1>
}
```

### For Server Components

Create a client wrapper:

```tsx
// components/my-page-client.tsx
"use client"
import { useTranslation } from "@/lib/i18n/context"

export function MyPageClient({ data }: { data: any }) {
  const { t } = useTranslation()
  return <div>{t("key")}</div>
}

// app/my-page/page.tsx
import { MyPageClient } from "@/components/my-page-client"

export default async function Page() {
  const data = await fetchData()
  return <MyPageClient data={data} />
}
```

## Translation Keys Structure

All keys follow this pattern:
- `nav.*` - Navigation items
- `common.*` - Common words (save, cancel, edit, etc.)
- `course.*` - Course-related strings
- `lesson.*` - Lesson-related strings
- `auth.*` - Authentication pages
- `trainer.*` - Trainer-specific strings
- `learner.*` - Learner-specific strings
- `admin.*` - Admin-specific strings
- `home.*` - Home page strings
- `button.*` - Button labels
- `error.*` - Error messages

## Adding New Keys

1. Add to both `en` and `fr` objects in `lib/i18n/translations.ts`
2. Use descriptive dot notation: `"section.subsection.key"`
3. Keep translations concise and natural

## Priority Pages to Translate

1. Home page (`app/page.tsx`)
2. Course detail (`app/courses/[id]/page.tsx`)
3. Learner dashboard (`app/learner/dashboard/page.tsx`)
4. Trainer dashboard (`app/trainer/dashboard/page.tsx`)
5. Auth pages (`app/auth/*/page.tsx`)
