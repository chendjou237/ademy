# Lesson Completion Fix - Summary

## Problem
Lesson completion was not working properly in both mobile and web apps. When learners marked lessons as complete, the completion status wasn't being saved or updated correctly in the database.

## Root Causes

### 1. **Mobile App Issue** (`apps/mobile/app/(learner)/lesson/[id].tsx`)
- **Upsert without conflict resolution**: The `upsert` operation wasn't specifying which columns to use for conflict detection
- **Incorrect progress calculation**: Was adding 1 to the count even when the lesson was already completed
- **No data refresh**: After marking complete, the UI wasn't refreshing to show updated progress

### 2. **Web App Issue** (`apps/admin/components/learner/lesson-player.tsx`)
- **Conditional insert/update logic**: Used separate `insert` and `update` operations based on whether a progress record existed
- **Race conditions**: This approach could fail if the record state changed between checking and updating
- **Unused parameter**: The `progressId` parameter was being passed but became unnecessary with the fix

## Solutions Implemented

### Mobile App Fixes

1. **Added proper conflict resolution to upsert**:
```typescript
.upsert(
  {
    enrollment_id: enrollment.id,
    lesson_id: lesson.id,
    completed: true,
    completed_at: new Date().toISOString(),
  },
  {
    onConflict: 'enrollment_id,lesson_id',  // ✅ Specifies unique constraint
  }
)
```

2. **Fixed progress calculation**:
```typescript
// Before: const completedCount = (completedLessons?.length || 0) + (isCompleted ? 0 : 1);
// After:
const completedCount = completedLessons?.length || 0;  // ✅ Query already includes the new completion
```

3. **Added error handling and data refresh**:
```typescript
const { error: enrollmentError } = await supabase
  .from('enrollments')
  .update({ progress: progressPercentage })
  .eq('id', enrollment.id);

if (enrollmentError) {
  console.error('Error updating enrollment progress:', enrollmentError);
}

// Refresh the lesson data to get updated progress
await fetchLessonData();  // ✅ Ensures UI shows latest state
```

### Web App Fixes

1. **Replaced conditional logic with upsert**:
```typescript
// Before: Separate if/else for insert vs update
// After: Single upsert operation
const { error } = await supabase
  .from("lesson_progress")
  .upsert(
    {
      enrollment_id: enrollmentId,
      lesson_id: lesson.id,
      completed: checked,
      completed_at: checked ? new Date().toISOString() : null,
    },
    {
      onConflict: "enrollment_id,lesson_id",
    }
  )
```

2. **Removed unused progressId parameter**:
- Removed from `LessonPlayerProps` interface
- Removed from component destructuring
- Removed from parent component's prop passing

## Database Schema
The fix relies on the unique constraint in the database:
```sql
CREATE TABLE lesson_progress (
  id UUID PRIMARY KEY,
  enrollment_id UUID NOT NULL,
  lesson_id UUID NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  UNIQUE(enrollment_id, lesson_id)  -- ✅ This enables proper upsert
);
```

## Benefits

1. **Reliability**: Upsert with conflict resolution handles both insert and update cases atomically
2. **Simplicity**: Single operation instead of conditional logic
3. **Consistency**: Same pattern used in both mobile and web apps
4. **Accuracy**: Progress calculation now correctly reflects actual completed lessons
5. **User Experience**: UI refreshes automatically to show updated progress

## Testing Checklist

- [ ] Mark a lesson as complete for the first time
- [ ] Mark the same lesson as complete again (should update, not error)
- [ ] Verify progress percentage updates correctly
- [ ] Check that completion shows in the course list
- [ ] Test on both mobile and web apps
- [ ] Verify with multiple lessons in a course
- [ ] Test toggling completion on/off (web only)
