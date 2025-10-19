# Canvas API Client Documentation

Complete documentation for the Canvas LMS API client built for snapSyllabus.

## Table of Contents
- [Setup](#setup)
- [Authentication](#authentication)
- [Core Methods](#core-methods)
- [Assignments](#assignments)
- [Submissions & Grades](#submissions--grades)
- [Quizzes](#quizzes)
- [Modules](#modules)
- [Pages](#pages)
- [Files](#files)
- [Discussions](#discussions)
- [Analytics](#analytics)
- [Comprehensive Data Fetching](#comprehensive-data-fetching)
- [Type Definitions](#type-definitions)
- [Examples](#examples)

---

## Setup

### Installation
The Canvas API client is already included in the project. Import it:

```typescript
import { createCanvasClient, CanvasApiClient } from './canvasApi';
```

### Running the Proxy Server
The Canvas API requires a proxy server to avoid CORS issues:

```bash
# Terminal 1: Start the proxy server
npm run proxy

# Terminal 2: Start the dev server
npm run dev
```

---

## Authentication

### Creating a Client

```typescript
const client = createCanvasClient(accessToken);
```

**Parameters:**
- `accessToken` (string): User's Canvas personal access token

**Getting a Token:**
1. Go to https://canvas.instructure.com/profile/settings
2. Scroll to "Approved Integrations"
3. Click "+ New Access Token"
4. Copy the generated token

### Validating a Token

```typescript
const isValid = await client.validateToken();
// Returns: boolean
```

---

## Core Methods

### Get Current User

```typescript
const user = await client.getCurrentUser();
```

**Returns:** `CanvasUser`
```typescript
{
  id: number;
  name: string;
  email: string;
  login_id: string;
}
```

### Get All Courses

```typescript
const courses = await client.getCourses();
```

**Returns:** `CanvasCourse[]`
```typescript
{
  id: number;
  name: string;
  course_code: string;
  workflow_state: string;
  account_id: number;
  start_at: string | null;
  end_at: string | null;
  enrollment_term_id: number;
  enrollments?: Array<{
    type: string;
    role: string;
    enrollment_state: string;
  }>;
  syllabus_body?: string;
}
```

---

## Assignments

### Get All Assignments for a Course

```typescript
const assignments = await client.getCourseAssignments(courseId);
```

**Parameters:**
- `courseId` (number): The course ID

**Returns:** `CanvasAssignment[]`
```typescript
{
  id: number;
  name: string;
  description: string;
  due_at: string | null;
  unlock_at: string | null;
  lock_at: string | null;
  points_possible: number;
  course_id: number;
  submission_types: string[];
  grading_type: string;
  has_submitted_submissions: boolean;
  attachments?: CanvasFile[];
}
```

### Get a Specific Assignment

```typescript
const assignment = await client.getAssignment(courseId, assignmentId);
```

**Parameters:**
- `courseId` (number): The course ID
- `assignmentId` (number): The assignment ID

**Returns:** `CanvasAssignment`

### Get All Assignments Across All Courses

```typescript
const assignmentsMap = await client.getAllAssignments();
```

**Returns:** `Map<number, CanvasAssignment[]>`
- Key: Course ID
- Value: Array of assignments for that course

**Example:**
```typescript
const assignmentsMap = await client.getAllAssignments();
assignmentsMap.forEach((assignments, courseId) => {
  console.log(`Course ${courseId} has ${assignments.length} assignments`);
  assignments.forEach(assignment => {
    console.log(`- ${assignment.name} (Due: ${assignment.due_at})`);
  });
});
```

---

## Submissions & Grades

### Get Assignment Submission

```typescript
const submissions = await client.getAssignmentSubmission(courseId, assignmentId);
```

**Parameters:**
- `courseId` (number): The course ID
- `assignmentId` (number): The assignment ID

**Returns:** `CanvasSubmission[]`
```typescript
{
  id: number;
  assignment_id: number;
  user_id: number;
  submitted_at: string | null;
  score: number | null;
  grade: string | null;
  attempt: number;
  workflow_state: string; // "submitted", "unsubmitted", "graded", "pending_review"
  late: boolean;
  missing: boolean;
  excused: boolean;
  submission_type: string | null;
}
```

### Get All Submissions for a Course

```typescript
const submissions = await client.getCourseSubmissions(courseId);
```

**Parameters:**
- `courseId` (number): The course ID

**Returns:** `CanvasSubmission[]`

**Use Case:** Get all your submissions to analyze performance patterns

### Get Course Grades

```typescript
const grades = await client.getCourseGrades(courseId);
```

**Parameters:**
- `courseId` (number): The course ID

**Returns:** `CanvasGrade`
```typescript
{
  current_score: number | null;
  final_score: number | null;
  current_grade: string | null;  // "A", "B+", etc.
  final_grade: string | null;
}
```

---

## Quizzes

### Get All Quizzes for a Course

```typescript
const quizzes = await client.getCourseQuizzes(courseId);
```

**Parameters:**
- `courseId` (number): The course ID

**Returns:** `CanvasQuiz[]`
```typescript
{
  id: number;
  title: string;
  description: string;
  quiz_type: string; // "practice_quiz", "assignment", "graded_survey"
  assignment_id: number | null;
  time_limit: number | null;
  allowed_attempts: number;
  question_count: number;
  points_possible: number;
  due_at: string | null;
  lock_at: string | null;
  unlock_at: string | null;
}
```

### Get Quiz Questions

```typescript
const questions = await client.getQuizQuestions(courseId, quizId);
```

**Parameters:**
- `courseId` (number): The course ID
- `quizId` (number): The quiz ID

**Returns:** `CanvasQuizQuestion[]`
```typescript
{
  id: number;
  quiz_id: number;
  question_name: string;
  question_text: string;
  question_type: string; // "multiple_choice", "true_false", "short_answer", "essay"
  points_possible: number;
  answers?: Array<{
    id: number;
    text: string;
    weight: number; // 100 = correct answer
  }>;
}
```

**Note:** May require teacher permissions for some courses.

---

## Modules

### Get All Modules for a Course

```typescript
const modules = await client.getCourseModules(courseId);
```

**Parameters:**
- `courseId` (number): The course ID

**Returns:** `CanvasModule[]`
```typescript
{
  id: number;
  name: string;
  position: number;
  unlock_at: string | null;
  require_sequential_progress: boolean;
  state: string; // "locked", "unlocked", "started", "completed"
  items_count: number;
  items_url: string;
}
```

### Get Module Items

```typescript
const items = await client.getModuleItems(courseId, moduleId);
```

**Parameters:**
- `courseId` (number): The course ID
- `moduleId` (number): The module ID

**Returns:** `CanvasModuleItem[]`
```typescript
{
  id: number;
  module_id: number;
  position: number;
  title: string;
  type: string; // "File", "Page", "Discussion", "Assignment", "Quiz", "SubHeader", "ExternalUrl", "ExternalTool"
  content_id: number;
  html_url: string;
  url: string;
  completion_requirement?: {
    type: string;
    completed: boolean;
  };
}
```

---

## Pages

### Get All Pages for a Course

```typescript
const pages = await client.getCoursePages(courseId);
```

**Parameters:**
- `courseId` (number): The course ID

**Returns:** `CanvasPage[]`
```typescript
{
  page_id: number;
  url: string;
  title: string;
  body: string; // HTML content
  created_at: string;
  updated_at: string;
}
```

### Get a Specific Page

```typescript
const page = await client.getPage(courseId, pageUrl);
```

**Parameters:**
- `courseId` (number): The course ID
- `pageUrl` (string): The page URL slug (e.g., "week-1-introduction")

**Returns:** `CanvasPage`

**Example:**
```typescript
const page = await client.getPage(12345, "lecture-notes-chapter-1");
console.log(page.body); // Full HTML content of the page
```

---

## Files

### Get All Files for a Course

```typescript
const files = await client.getCourseFiles(courseId);
```

**Parameters:**
- `courseId` (number): The course ID

**Returns:** `CanvasFile[]`
```typescript
{
  id: number;
  display_name: string;
  filename: string;
  size: number; // bytes
  content_type: string; // "application/pdf", "image/png", etc.
  url: string; // Download URL
  created_at: string;
  modified_at: string;
}
```

### Get a Specific File

```typescript
const file = await client.getFile(fileId);
```

**Parameters:**
- `fileId` (number): The file ID

**Returns:** `CanvasFile`

### Extract File Links from HTML

```typescript
const fileLinks = client.extractFileLinksFromHTML(htmlContent);
```

**Parameters:**
- `htmlContent` (string): HTML content (from descriptions, pages, etc.)

**Returns:** `Array<{ url: string; text: string }>`

**Example:**
```typescript
const assignment = await client.getAssignment(courseId, assignmentId);
const links = client.extractFileLinksFromHTML(assignment.description);

links.forEach(link => {
  console.log(`${link.text}: ${link.url}`);
});
// Output: "Worksheet 1.pdf: https://canvas.../files/123"
```

### Get All Files for an Assignment

```typescript
const files = await client.getAssignmentFiles(courseId, assignmentId);
```

**Parameters:**
- `courseId` (number): The course ID
- `assignmentId` (number): The assignment ID

**Returns:**
```typescript
{
  attachments: CanvasFile[];           // Files directly attached
  linkedFiles: Array<{                 // Files linked in description
    url: string;
    text: string;
  }>;
}
```

**Example:**
```typescript
const { attachments, linkedFiles } = await client.getAssignmentFiles(courseId, assignmentId);

// Direct attachments
attachments.forEach(file => {
  console.log(`Attachment: ${file.display_name} (${file.content_type})`);
  console.log(`Download: ${file.url}`);
});

// Files mentioned in description
linkedFiles.forEach(link => {
  console.log(`Linked file: ${link.text} -> ${link.url}`);
});
```

---

## Discussions

### Get All Discussion Topics for a Course

```typescript
const discussions = await client.getCourseDiscussions(courseId);
```

**Parameters:**
- `courseId` (number): The course ID

**Returns:** `CanvasDiscussionTopic[]`
```typescript
{
  id: number;
  title: string;
  message: string; // HTML content
  posted_at: string;
  assignment_id: number | null;
  discussion_type: string;
  user_name: string;
}
```

---

## Analytics

### Get Course Analytics

```typescript
const analytics = await client.getCourseAnalytics(courseId);
```

**Parameters:**
- `courseId` (number): The course ID

**Returns:** `CanvasAnalytics`
```typescript
{
  page_views: {
    total: number;
    max: number;
    level: number;
  };
  participations: {
    total: number;
    max: number;
    level: number;
  };
  tardiness_breakdown: {
    on_time: number;
    late: number;
    missing: number;
    total: number;
  };
}
```

**Use Case:** Identify struggling patterns (low participation, high tardiness)

### Get Assignment Analytics

```typescript
const assignmentAnalytics = await client.getAssignmentAnalytics(courseId);
```

**Parameters:**
- `courseId` (number): The course ID

**Returns:** Assignment performance data including score distributions, submission patterns, etc.

**Note:** Analytics may not be available for all Canvas instances. Methods return empty/default data if unavailable.

---

## Comprehensive Data Fetching

### Get All Course Data

```typescript
const allData = await client.getAllCourseData();
```

**Returns:** Array of complete course data objects:
```typescript
Array<{
  course: CanvasCourse;
  assignments: CanvasAssignment[];
  submissions: CanvasSubmission[];
  grades: CanvasGrade;
  quizzes: CanvasQuiz[];
  modules: CanvasModule[];
  pages: CanvasPage[];
  files: CanvasFile[];
  discussions: CanvasDiscussionTopic[];
  analytics: CanvasAnalytics;
}>
```

**Use Case:** Perfect for AI processing - gets everything in one call!

**Example:**
```typescript
const allData = await client.getAllCourseData();

allData.forEach(courseData => {
  console.log(`\n=== ${courseData.course.name} ===`);
  console.log(`Grade: ${courseData.grades.current_grade}`);
  console.log(`Assignments: ${courseData.assignments.length}`);
  console.log(`Late submissions: ${courseData.analytics.tardiness_breakdown.late}`);
  console.log(`Missing assignments: ${courseData.analytics.tardiness_breakdown.missing}`);

  // Find struggling areas
  courseData.submissions.forEach(sub => {
    if (sub.score && sub.score < 70) {
      console.log(`⚠️ Low score on assignment ${sub.assignment_id}: ${sub.score}%`);
    }
  });
});
```

---

## Type Definitions

All TypeScript interfaces are exported from `canvasApi.ts`:

```typescript
import {
  CanvasUser,
  CanvasCourse,
  CanvasAssignment,
  CanvasSubmission,
  CanvasQuiz,
  CanvasQuizQuestion,
  CanvasModule,
  CanvasModuleItem,
  CanvasPage,
  CanvasFile,
  CanvasDiscussionTopic,
  CanvasGrade,
  CanvasAnalytics,
} from './canvasApi';
```

---

## Examples

### Example 1: Build a Study Calendar

```typescript
const client = createCanvasClient(token);
const assignmentsMap = await client.getAllAssignments();

const calendar = [];

assignmentsMap.forEach((assignments, courseId) => {
  assignments.forEach(assignment => {
    if (assignment.due_at) {
      calendar.push({
        date: new Date(assignment.due_at),
        title: assignment.name,
        points: assignment.points_possible,
      });
    }
  });
});

// Sort by due date
calendar.sort((a, b) => a.date.getTime() - b.date.getTime());

console.log("Upcoming Assignments:");
calendar.forEach(item => {
  console.log(`${item.date.toLocaleDateString()}: ${item.title} (${item.points} pts)`);
});
```

### Example 2: Identify Struggling Areas

```typescript
const client = createCanvasClient(token);
const allData = await client.getAllCourseData();

const strugglingCourses = allData.filter(courseData => {
  const grade = courseData.grades.current_score;
  const lateCount = courseData.analytics.tardiness_breakdown.late;
  const missingCount = courseData.analytics.tardiness_breakdown.missing;

  return grade < 75 || lateCount > 2 || missingCount > 0;
});

console.log("Courses needing attention:");
strugglingCourses.forEach(courseData => {
  console.log(`\n${courseData.course.name}:`);
  console.log(`  Grade: ${courseData.grades.current_grade}`);
  console.log(`  Late: ${courseData.analytics.tardiness_breakdown.late}`);
  console.log(`  Missing: ${courseData.analytics.tardiness_breakdown.missing}`);
});
```

### Example 3: Generate Practice Quizzes

```typescript
const client = createCanvasClient(token);
const quizzes = await client.getCourseQuizzes(courseId);

for (const quiz of quizzes) {
  const questions = await client.getQuizQuestions(courseId, quiz.id);

  console.log(`\n=== ${quiz.title} ===`);
  questions.forEach((q, idx) => {
    console.log(`\n${idx + 1}. ${q.question_text}`);

    if (q.answers) {
      q.answers.forEach((answer, ansIdx) => {
        const marker = answer.weight === 100 ? "✓" : " ";
        console.log(`  ${marker} ${String.fromCharCode(65 + ansIdx)}. ${answer.text}`);
      });
    }
  });
}
```

### Example 4: Download All Course Materials

```typescript
const client = createCanvasClient(token);
const courses = await client.getCourses();

for (const course of courses) {
  console.log(`\n=== ${course.name} ===`);

  // Get all files
  const files = await client.getCourseFiles(course.id);
  console.log(`\nFiles (${files.length}):`);
  files.forEach(file => {
    console.log(`- ${file.display_name} (${file.content_type})`);
    console.log(`  Download: ${file.url}`);
  });

  // Get all pages
  const pages = await client.getCoursePages(course.id);
  console.log(`\nPages (${pages.length}):`);
  pages.forEach(page => {
    console.log(`- ${page.title}`);
  });

  // Get assignment files
  const assignments = await client.getCourseAssignments(course.id);
  for (const assignment of assignments) {
    const { attachments, linkedFiles } = await client.getAssignmentFiles(course.id, assignment.id);

    if (attachments.length > 0 || linkedFiles.length > 0) {
      console.log(`\n${assignment.name} files:`);
      attachments.forEach(file => {
        console.log(`  [Attachment] ${file.display_name}`);
      });
      linkedFiles.forEach(link => {
        console.log(`  [Linked] ${link.text}`);
      });
    }
  }
}
```

### Example 5: AI Data Preparation

```typescript
const client = createCanvasClient(token);
const allData = await client.getAllCourseData();

// Prepare data for AI processing
const aiInput = allData.map(courseData => ({
  courseName: courseData.course.name,
  courseCode: courseData.course.course_code,
  currentGrade: courseData.grades.current_grade,

  // Upcoming assignments
  upcomingAssignments: courseData.assignments
    .filter(a => a.due_at && new Date(a.due_at) > new Date())
    .map(a => ({
      name: a.name,
      dueDate: a.due_at,
      points: a.points_possible,
      description: a.description,
    })),

  // Performance issues
  lowScores: courseData.submissions
    .filter(s => s.score && s.score < 70)
    .map(s => ({ assignmentId: s.assignment_id, score: s.score })),

  lateSubmissions: courseData.submissions
    .filter(s => s.late)
    .map(s => ({ assignmentId: s.assignment_id, submittedAt: s.submitted_at })),

  missingAssignments: courseData.submissions
    .filter(s => s.missing),

  // Learning materials
  quizQuestions: courseData.quizzes,
  modules: courseData.modules,
  pages: courseData.pages.map(p => ({ title: p.title, content: p.body })),
}));

// Send to AI for processing
console.log(JSON.stringify(aiInput, null, 2));
```

---

## Error Handling

All API methods can throw errors. Wrap calls in try-catch:

```typescript
try {
  const courses = await client.getCourses();
} catch (error) {
  console.error('Failed to fetch courses:', error);
}
```

Some methods have built-in error handling and return empty/default data:
- `getQuizQuestions()` - returns `[]` on error
- `getCourseAnalytics()` - returns default analytics object
- `getAssignmentAnalytics()` - returns `[]` on error

---

## Rate Limiting

Canvas API has rate limits. For production use:
- Cache responses when possible
- Add delays between bulk requests
- Use `getAllCourseData()` instead of multiple individual calls

---

## Security Notes

- **Never commit access tokens** to version control
- Tokens have full access to user's Canvas account
- Store tokens securely (encrypted, server-side)
- Rotate tokens periodically
- Revoke tokens when no longer needed (in Canvas settings)

---

## Support

For Canvas API documentation, see:
- https://canvas.instructure.com/doc/api/

For issues with this client, check:
- Proxy server is running (`npm run proxy`)
- Token is valid (hasn't been revoked)
- User has appropriate permissions for the endpoint
