// Canvas LMS API Client
// Base URL for Canvas instance - using local proxy to avoid CORS issues
const CANVAS_BASE_URL = 'http://localhost:3001/canvas-api';

// Types for Canvas API responses
export interface CanvasCourse {
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

export interface CanvasAssignment {
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
  attachments?: CanvasFile[]; // Files attached to assignment
}

export interface CanvasSubmission {
  id: number;
  assignment_id: number;
  user_id: number;
  submitted_at: string | null;
  score: number | null;
  grade: string | null;
  attempt: number;
  workflow_state: string; // submitted, unsubmitted, graded, pending_review
  late: boolean;
  missing: boolean;
  excused: boolean;
  submission_type: string | null;
}

export interface CanvasQuiz {
  id: number;
  title: string;
  description: string;
  quiz_type: string; // practice_quiz, assignment, graded_survey
  assignment_id: number | null;
  time_limit: number | null;
  allowed_attempts: number;
  question_count: number;
  points_possible: number;
  due_at: string | null;
  lock_at: string | null;
  unlock_at: string | null;
}

export interface CanvasQuizQuestion {
  id: number;
  quiz_id: number;
  question_name: string;
  question_text: string;
  question_type: string; // multiple_choice, true_false, short_answer, essay, etc.
  points_possible: number;
  answers?: Array<{
    id: number;
    text: string;
    weight: number;
  }>;
}

export interface CanvasModule {
  id: number;
  name: string;
  position: number;
  unlock_at: string | null;
  require_sequential_progress: boolean;
  state: string; // locked, unlocked, started, completed
  items_count: number;
  items_url: string;
}

export interface CanvasModuleItem {
  id: number;
  module_id: number;
  position: number;
  title: string;
  type: string; // File, Page, Discussion, Assignment, Quiz, SubHeader, ExternalUrl, ExternalTool
  content_id: number;
  html_url: string;
  url: string;
  completion_requirement?: {
    type: string;
    completed: boolean;
  };
}

export interface CanvasPage {
  page_id: number;
  url: string;
  title: string;
  body: string;
  created_at: string;
  updated_at: string;
}

export interface CanvasFile {
  id: number;
  display_name: string;
  filename: string;
  size: number;
  content_type: string;
  url: string;
  created_at: string;
  modified_at: string;
}

export interface CanvasDiscussionTopic {
  id: number;
  title: string;
  message: string;
  posted_at: string;
  assignment_id: number | null;
  discussion_type: string;
  user_name: string;
}

export interface CanvasGrade {
  current_score: number | null;
  final_score: number | null;
  current_grade: string | null;
  final_grade: string | null;
}

export interface CanvasUser {
  id: number;
  name: string;
  email: string;
  login_id: string;
}

export interface CanvasAnalytics {
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

// Canvas API Client Class
export class CanvasApiClient {
  private accessToken: string;
  private baseUrl: string;

  constructor(accessToken: string, baseUrl: string = CANVAS_BASE_URL) {
    this.accessToken = accessToken;
    this.baseUrl = baseUrl;
  }

  // Generic fetch wrapper with authentication
  private async fetchCanvas<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Canvas API Error: ${response.status} - ${errorText}`);
    }

    return response.json();
  }

  // Get current user info
  async getCurrentUser(): Promise<CanvasUser> {
    return this.fetchCanvas<CanvasUser>('/users/self');
  }

  // Get all courses for the current user
  async getCourses(): Promise<CanvasCourse[]> {
    // Include enrollments to get role info, filter for active courses
    return this.fetchCanvas<CanvasCourse[]>(
      '/courses?enrollment_state=active&include[]=term&include[]=total_students'
    );
  }

  // Get assignments for a specific course
  async getCourseAssignments(courseId: number): Promise<CanvasAssignment[]> {
    return this.fetchCanvas<CanvasAssignment[]>(
      `/courses/${courseId}/assignments?include[]=attachments`
    );
  }

  // Get a single assignment with full details including attachments
  async getAssignment(courseId: number, assignmentId: number): Promise<CanvasAssignment> {
    return this.fetchCanvas<CanvasAssignment>(
      `/courses/${courseId}/assignments/${assignmentId}?include[]=attachments`
    );
  }

  // Get all assignments across all courses
  async getAllAssignments(): Promise<Map<number, CanvasAssignment[]>> {
    const courses = await this.getCourses();
    const assignmentsMap = new Map<number, CanvasAssignment[]>();

    await Promise.all(
      courses.map(async (course) => {
        try {
          const assignments = await this.getCourseAssignments(course.id);
          assignmentsMap.set(course.id, assignments);
        } catch (error) {
          console.error(`Failed to fetch assignments for course ${course.id}:`, error);
          assignmentsMap.set(course.id, []);
        }
      })
    );

    return assignmentsMap;
  }

  // Validate token by attempting to fetch current user
  async validateToken(): Promise<boolean> {
    try {
      await this.getCurrentUser();
      return true;
    } catch {
      return false;
    }
  }

  // ===== SUBMISSIONS & GRADES =====

  // Get submission for a specific assignment
  async getAssignmentSubmission(courseId: number, assignmentId: number): Promise<CanvasSubmission[]> {
    return this.fetchCanvas<CanvasSubmission[]>(
      `/courses/${courseId}/assignments/${assignmentId}/submissions?include[]=submission_history&include[]=rubric_assessment`
    );
  }

  // Get all submissions for a course
  async getCourseSubmissions(courseId: number): Promise<CanvasSubmission[]> {
    return this.fetchCanvas<CanvasSubmission[]>(
      `/courses/${courseId}/students/submissions?student_ids[]=self&include[]=assignment`
    );
  }

  // Get user's grades for a course
  async getCourseGrades(courseId: number): Promise<CanvasGrade> {
    const enrollments = await this.fetchCanvas<any[]>(
      `/courses/${courseId}/enrollments?user_id=self`
    );
    if (enrollments.length > 0) {
      const grades = enrollments[0].grades || {};
      return {
        current_score: grades.current_score || null,
        final_score: grades.final_score || null,
        current_grade: grades.current_grade || null,
        final_grade: grades.final_grade || null,
      };
    }
    return {
      current_score: null,
      final_score: null,
      current_grade: null,
      final_grade: null,
    };
  }

  // ===== QUIZZES =====

  // Get all quizzes for a course
  async getCourseQuizzes(courseId: number): Promise<CanvasQuiz[]> {
    return this.fetchCanvas<CanvasQuiz[]>(
      `/courses/${courseId}/quizzes`
    );
  }

  // Get quiz questions (requires permissions)
  async getQuizQuestions(courseId: number, quizId: number): Promise<CanvasQuizQuestion[]> {
    try {
      return await this.fetchCanvas<CanvasQuizQuestion[]>(
        `/courses/${courseId}/quizzes/${quizId}/questions`
      );
    } catch (error) {
      console.error(`Failed to fetch quiz questions for quiz ${quizId}:`, error);
      return [];
    }
  }

  // ===== MODULES =====

  // Get all modules for a course
  async getCourseModules(courseId: number): Promise<CanvasModule[]> {
    return this.fetchCanvas<CanvasModule[]>(
      `/courses/${courseId}/modules?include[]=items`
    );
  }

  // Get items in a specific module
  async getModuleItems(courseId: number, moduleId: number): Promise<CanvasModuleItem[]> {
    return this.fetchCanvas<CanvasModuleItem[]>(
      `/courses/${courseId}/modules/${moduleId}/items`
    );
  }

  // ===== PAGES =====

  // Get all pages for a course
  async getCoursePages(courseId: number): Promise<CanvasPage[]> {
    return this.fetchCanvas<CanvasPage[]>(
      `/courses/${courseId}/pages`
    );
  }

  // Get a specific page with full content
  async getPage(courseId: number, pageUrl: string): Promise<CanvasPage> {
    return this.fetchCanvas<CanvasPage>(
      `/courses/${courseId}/pages/${pageUrl}`
    );
  }

  // ===== FILES =====

  // Get all files for a course
  async getCourseFiles(courseId: number): Promise<CanvasFile[]> {
    return this.fetchCanvas<CanvasFile[]>(
      `/courses/${courseId}/files`
    );
  }

  // Get a specific file by ID
  async getFile(fileId: number): Promise<CanvasFile> {
    return this.fetchCanvas<CanvasFile>(`/files/${fileId}`);
  }

  // Extract file URLs from HTML content (descriptions, pages, etc.)
  extractFileLinksFromHTML(htmlContent: string): Array<{ url: string; text: string }> {
    const fileLinks: Array<{ url: string; text: string }> = [];

    // Match href attributes in anchor tags
    const hrefRegex = /<a[^>]+href=["']([^"']+)["'][^>]*>([^<]*)<\/a>/gi;
    let match;

    while ((match = hrefRegex.exec(htmlContent)) !== null) {
      const url = match[1];
      const text = match[2];

      // Check if it's a file URL (contains /files/ or common file extensions)
      if (url.includes('/files/') ||
          /\.(pdf|docx?|xlsx?|pptx?|txt|csv|zip|png|jpe?g|gif)$/i.test(url)) {
        fileLinks.push({ url, text });
      }
    }

    return fileLinks;
  }

  // Get all files referenced in an assignment (attachments + links in description)
  async getAssignmentFiles(courseId: number, assignmentId: number): Promise<{
    attachments: CanvasFile[];
    linkedFiles: Array<{ url: string; text: string }>;
  }> {
    const assignment = await this.getAssignment(courseId, assignmentId);

    return {
      attachments: assignment.attachments || [],
      linkedFiles: this.extractFileLinksFromHTML(assignment.description || ''),
    };
  }

  // ===== DISCUSSIONS =====

  // Get all discussion topics for a course
  async getCourseDiscussions(courseId: number): Promise<CanvasDiscussionTopic[]> {
    return this.fetchCanvas<CanvasDiscussionTopic[]>(
      `/courses/${courseId}/discussion_topics`
    );
  }

  // ===== ANALYTICS =====

  // Get analytics for a specific course
  async getCourseAnalytics(courseId: number): Promise<CanvasAnalytics> {
    try {
      return await this.fetchCanvas<CanvasAnalytics>(
        `/courses/${courseId}/analytics/user_activity/self`
      );
    } catch (error) {
      console.error(`Analytics not available for course ${courseId}:`, error);
      return {
        page_views: { total: 0, max: 0, level: 0 },
        participations: { total: 0, max: 0, level: 0 },
        tardiness_breakdown: { on_time: 0, late: 0, missing: 0, total: 0 },
      };
    }
  }

  // Get assignment analytics (performance data)
  async getAssignmentAnalytics(courseId: number): Promise<any> {
    try {
      return await this.fetchCanvas<any>(
        `/courses/${courseId}/analytics/assignments`
      );
    } catch (error) {
      console.error(`Assignment analytics not available for course ${courseId}:`, error);
      return [];
    }
  }

  // ===== COMPREHENSIVE DATA FETCH =====

  // Get all data for AI processing (this is the big one!)
  async getAllCourseData() {
    const courses = await this.getCourses();
    const allData = await Promise.all(
      courses.map(async (course) => {
        try {
          const [
            assignments,
            submissions,
            grades,
            quizzes,
            modules,
            pages,
            files,
            discussions,
            analytics,
          ] = await Promise.all([
            this.getCourseAssignments(course.id),
            this.getCourseSubmissions(course.id),
            this.getCourseGrades(course.id),
            this.getCourseQuizzes(course.id),
            this.getCourseModules(course.id),
            this.getCoursePages(course.id),
            this.getCourseFiles(course.id),
            this.getCourseDiscussions(course.id),
            this.getCourseAnalytics(course.id),
          ]);

          return {
            course,
            assignments,
            submissions,
            grades,
            quizzes,
            modules,
            pages,
            files,
            discussions,
            analytics,
          };
        } catch (error) {
          console.error(`Failed to fetch data for course ${course.id}:`, error);
          return {
            course,
            assignments: [],
            submissions: [],
            grades: { current_score: null, final_score: null, current_grade: null, final_grade: null },
            quizzes: [],
            modules: [],
            pages: [],
            files: [],
            discussions: [],
            analytics: {
              page_views: { total: 0, max: 0, level: 0 },
              participations: { total: 0, max: 0, level: 0 },
              tardiness_breakdown: { on_time: 0, late: 0, missing: 0, total: 0 },
            },
          };
        }
      })
    );

    return allData;
  }
}

// Export a factory function for convenience
export function createCanvasClient(accessToken: string): CanvasApiClient {
  return new CanvasApiClient(accessToken);
}
