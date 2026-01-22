---
inclusion: always
---

# Product Overview

Ademy is an online learning management system (LMS) that enables trainers to create and publish courses with video lessons, and learners to enroll and track their progress.

## Core Features

- **Multi-role system**: Admin, Trainer, and Learner roles with distinct capabilities
- **Course management**: Trainers create courses with lessons, descriptions, pricing, and categories
- **Video hosting**: Integrated with Bunny.net Stream for video uploads, transcoding, and adaptive streaming
- **Enrollment system**: Learners enroll in courses and track lesson completion
- **Progress tracking**: Per-lesson completion status and overall course progress

## User Roles

- **Admin**: Manages users, courses, and enrollments across the platform
- **Trainer**: Creates and manages their own courses and lessons
- **Learner**: Enrolls in courses, watches lessons, and tracks progress

## Video Integration

The platform uses Bunny.net Stream for video hosting with a custom URL scheme:
- Format: `bunny://LIBRARY_ID/VIDEO_ID`
- Supports both uploaded videos (via Bunny Stream) and external URLs (YouTube, Vimeo, etc.)
- Automatic transcoding and adaptive bitrate streaming
