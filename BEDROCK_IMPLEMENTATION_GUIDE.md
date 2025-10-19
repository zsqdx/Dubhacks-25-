# CourseCompanion AI Teaching Assistant
## Step-by-Step Implementation Guide

**Based on:** BEDROCK_AGENT_ARCHITECTURE.md v1.0
**Last Updated:** October 2025
**Estimated Timeline:** 8-10 weeks
**Project:** CourseCompanion - AI-Powered Canvas LMS Teaching Assistant

---

## Quick Start Checklist

Before you begin, ensure you have:
- [ ] AWS Account with Bedrock access enabled
- [ ] AWS CLI configured with appropriate credentials
- [ ] Node.js 18+ and npm/yarn installed
- [ ] TypeScript knowledge
- [ ] Canvas LMS test account with API token
- [ ] IAM permissions for: Lambda, S3, API Gateway, Bedrock, OpenSearch
- [ ] CDK or Terraform installed (we'll use CDK in this guide)
- [ ] Budget approved (~$1,270/month for 1000 users, optimizable to ~$800)

---

## Table of Contents

### Phase 1: Foundation (Week 1-2)
1. [AWS Environment Setup](#step-1-aws-environment-setup)
2. [Create Bedrock Agent](#step-2-create-bedrock-agent)
3. [Implement First Action Group](#step-3-implement-first-action-group)
4. [Build Chat Handler](#step-4-build-chat-handler)
5. [Set Up API Gateway](#step-5-set-up-api-gateway)
6. [Update Frontend](#step-6-update-frontend)
7. [Test Basic Functionality](#step-7-test-basic-functionality)

### Phase 2: Intelligence (Week 3-4)
8. [Implement Assignment Analysis](#step-8-implement-assignment-analysis)
9. [Implement Performance Analysis](#step-9-implement-performance-analysis)
10. [Implement Quiz Analysis](#step-10-implement-quiz-analysis)
11. [Implement Recommendations Engine](#step-11-implement-recommendations-engine)
12. [Add Conversation Memory](#step-12-add-conversation-memory)
13. [Enhance Agent Instructions](#step-13-enhance-agent-instructions)

### Phase 3: Content Generation (Week 5-6)
14. [Set Up Knowledge Base](#step-14-set-up-knowledge-base)
15. [Configure Vector Embeddings](#step-15-configure-vector-embeddings)
16. [Implement Study Guide Generation](#step-16-implement-study-guide-generation)
17. [Implement Content Extraction](#step-17-implement-content-extraction)
18. [Integrate RAG with Agent](#step-18-integrate-rag-with-agent)

### Phase 4: Safety & Polish (Week 7-8)
19. [Configure Bedrock Guardrails](#step-19-configure-bedrock-guardrails)
20. [Add Academic Integrity Detection](#step-20-add-academic-integrity-detection)
21. [Implement Rate Limiting](#step-21-implement-rate-limiting)
22. [Set Up Monitoring & Logging](#step-22-set-up-monitoring-and-logging)
23. [Security Audit & Hardening](#step-23-security-audit-and-hardening)
24. [Performance Optimization](#step-24-performance-optimization)

### Phase 5: Advanced Features (Week 9-10)
25. [Add Export & Sharing Features](#step-25-add-export-and-sharing-features)
26. [Build Admin Dashboard](#step-26-build-admin-dashboard)
27. [Implement User Feedback](#step-27-implement-user-feedback)
28. [Production Deployment](#step-28-production-deployment)

---

# PHASE 1: FOUNDATION (Week 1-2)

## Step 1: AWS Environment Setup

### 1.1 Enable AWS Bedrock Access

```bash
# Request model access in AWS Console
# Navigate to: AWS Console → Bedrock → Model access
# Enable: Anthropic Claude 3.5 Sonnet
# Enable: Amazon Titan Embed Text v1
```

**Manual Steps:**
1. Go to AWS Console → Amazon Bedrock
2. Click "Model access" in left sidebar
3. Click "Manage model access"
4. Check boxes for:
   - Anthropic Claude 3.5 Sonnet
   - Amazon Titan Embed Text v1
5. Click "Request model access"
6. Wait for approval (usually instant for standard models)

### 1.2 Set Up Project Structure

```bash
# Create project directory
mkdir coursecompanion-bedrock
cd coursecompanion-bedrock

# Initialize CDK project
npm install -g aws-cdk
cdk init app --language=typescript

# Install dependencies
npm install @aws-sdk/client-bedrock-agent-runtime \
            @aws-sdk/client-bedrock-agent \
            @aws-sdk/client-s3 \
            @aws-sdk/client-lambda \
            axios \
            uuid

# Create folder structure
mkdir -p lambda/action-groups/{canvas-data,assignments,performance,quiz,study-guide,content-extraction,recommendations}
mkdir -p lambda/chat-handler
mkdir -p lambda/shared
mkdir -p knowledge-base/{study-techniques,subject-templates,academic-skills,learning-science,resources}
```

**Project Structure:**
```
coursecompanion-bedrock/
├── bin/
│   └── bedrock-stack.ts          # CDK app entry point
├── lib/
│   └── bedrock-stack.ts          # Infrastructure definitions
├── lambda/
│   ├── action-groups/
│   │   ├── canvas-data/          # Action Group 1
│   │   ├── assignments/          # Action Group 2
│   │   ├── performance/          # Action Group 3
│   │   ├── quiz/                 # Action Group 4
│   │   ├── study-guide/          # Action Group 5
│   │   ├── content-extraction/   # Action Group 6
│   │   └── recommendations/      # Action Group 7
│   ├── chat-handler/
│   │   └── index.ts              # Main chat orchestration
│   └── shared/
│       ├── canvas-api-client.ts
│       ├── auth-utils.ts
│       └── types.ts
├── knowledge-base/               # RAG content
└── openapi-schemas/              # API definitions
```

### 1.3 Configure AWS Credentials

```bash
# Configure AWS CLI
aws configure

# Verify access
aws sts get-caller-identity
aws bedrock list-foundation-models --region us-east-2 | grep claude
```

### 1.4 Set Environment Variables

Create `.env` file:
```bash
AWS_REGION=us-east-2
BEDROCK_AGENT_NAME=CourseCompanion-TeachingAssistant
CANVAS_API_BASE_URL=https://canvas.instructure.com/api/v1
S3_BUCKET_PREFIX=coursecompanion
ENVIRONMENT=dev
```

---

## Step 2: Create Bedrock Agent

### 2.1 Define Agent Configuration

Create `lib/bedrock-agent-config.ts`:

```typescript
export const AGENT_CONFIG = {
  agentName: 'CourseCompanion-TeachingAssistant',
  description: 'AI teaching assistant integrated with Canvas LMS for personalized academic support',
  foundationModel: 'anthropic.claude-3-5-sonnet-20241022-v2:0',
  instruction: `You are CourseCompanion, an AI teaching assistant integrated with Canvas LMS.

CORE PURPOSE:
- Provide personalized study support based on Canvas data
- Generate custom study materials and practice problems
- Identify knowledge gaps and learning opportunities
- Offer homework guidance while maintaining academic integrity
- Create actionable study plans based on deadlines and performance

PERSONALITY:
- Encouraging: Always supportive, never judgmental about struggles or low grades
- Clear: Explain complex concepts simply, break down into manageable pieces
- Patient: Willing to explain multiple times in different ways
- Proactive: Suggest improvements and study strategies before being asked
- Professional yet Friendly: Maintain educational standards with approachable tone
- Adaptive: Adjust explanations based on student's comprehension level

OPERATIONAL GUIDELINES:

When students ask questions:
1. Always check Canvas context first (grades, deadlines, performance data)
2. Provide contextualized help that references their specific courses and assignments
3. Be actionable - give concrete next steps, not just general advice

For study guide generation:
- Include clear learning objectives
- Define all key terms with examples
- Explain concepts using multiple approaches (visual, verbal, examples)
- Provide practice problems with step-by-step solutions
- Add tips for common mistakes
- Link to relevant course materials in Canvas
- Adapt difficulty level to student's current performance

For homework help (CRITICAL - Academic Integrity):
DO:
- Ask guiding questions that help students think through problems
- Explain underlying concepts and theories
- Reference relevant course materials and textbook sections
- Provide similar example problems (with different numbers) and show solutions
- Check assignment rubrics to ensure you're helping appropriately

DON'T:
- Give direct answers to homework problems
- Write essays or complete assignments for students
- Provide answers during take-home exams unless explicitly allowed
- Violate any assignment instructions or academic integrity policies

For performance analysis:
- Be honest but encouraging about areas needing improvement
- Identify patterns (e.g., "You tend to score lower on application questions vs theory")
- Suggest specific study strategies for weak areas
- Celebrate improvements and strengths

For workload management:
- Prioritize by: 1) Urgent deadlines, 2) High point value, 3) Weak subject areas
- Suggest realistic time allocations (don't overwhelm)
- Recommend breaking large assignments into smaller tasks
- Identify optimal study times based on deadline distribution

WHEN TO USE TOOLS:
- Use Canvas action groups to fetch real student data
- Use knowledge base (RAG) for study techniques and subject-specific resources
- Combine both for personalized, evidence-based recommendations

Remember: Your goal is to empower students to learn and succeed independently, not to do their work for them.`,
  inferenceConfiguration: {
    maximumLength: 4096,
    temperature: 0.7,
    topP: 0.9,
    stopSequences: []
  },
  idleSessionTTLInSeconds: 3600
};
```

### 2.2 Create Agent with CDK

Create `lib/bedrock-stack.ts`:

```typescript
import * as cdk from 'aws-cdk-lib';
import * as bedrock from 'aws-cdk-lib/aws-bedrock';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as s3 from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';
import { AGENT_CONFIG } from './bedrock-agent-config';

export class BedrockStack extends cdk.Stack {
  public readonly agent: bedrock.CfnAgent;
  public readonly conversationBucket: s3.Bucket;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create S3 bucket for conversation history
    this.conversationBucket = new s3.Bucket(this, 'ConversationBucket', {
      bucketName: `coursecompanion-conversations-${this.account}`,
      encryption: s3.BucketEncryption.S3_MANAGED,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      versioned: true,
      lifecycleRules: [
        {
          expiration: cdk.Duration.days(90), // Keep conversations for 90 days
          transitions: [
            {
              storageClass: s3.StorageClass.INTELLIGENT_TIERING,
              transitionAfter: cdk.Duration.days(30)
            }
          ]
        }
      ]
    });

    // Create IAM role for Bedrock Agent
    const agentRole = new iam.Role(this, 'AgentRole', {
      assumedBy: new iam.ServicePrincipal('bedrock.amazonaws.com'),
      description: 'Role for CourseCompanion Bedrock Agent'
    });

    // Grant Bedrock model invocation permissions
    agentRole.addToPolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: [
        'bedrock:InvokeModel',
        'bedrock:InvokeModelWithResponseStream'
      ],
      resources: [
        `arn:aws:bedrock:${this.region}::foundation-model/${AGENT_CONFIG.foundationModel}`
      ]
    }));

    // Grant S3 permissions for conversation storage
    this.conversationBucket.grantReadWrite(agentRole);

    // Create Bedrock Agent
    this.agent = new bedrock.CfnAgent(this, 'CourseCompanionAgent', {
      agentName: AGENT_CONFIG.agentName,
      description: AGENT_CONFIG.description,
      agentResourceRoleArn: agentRole.roleArn,
      foundationModel: AGENT_CONFIG.foundationModel,
      instruction: AGENT_CONFIG.instruction,
      idleSessionTtlInSeconds: AGENT_CONFIG.idleSessionTTLInSeconds,
      promptOverrideConfiguration: {
        promptConfigurations: [
          {
            promptType: 'PRE_PROCESSING',
            inferenceConfiguration: {
              maximumLength: AGENT_CONFIG.inferenceConfiguration.maximumLength,
              temperature: AGENT_CONFIG.inferenceConfiguration.temperature,
              topP: AGENT_CONFIG.inferenceConfiguration.topP,
              stopSequences: AGENT_CONFIG.inferenceConfiguration.stopSequences
            },
            promptState: 'ENABLED',
            promptCreationMode: 'DEFAULT'
          }
        ]
      }
    });

    // Output agent details
    new cdk.CfnOutput(this, 'AgentId', {
      value: this.agent.attrAgentId,
      description: 'Bedrock Agent ID'
    });

    new cdk.CfnOutput(this, 'AgentArn', {
      value: this.agent.attrAgentArn,
      description: 'Bedrock Agent ARN'
    });

    new cdk.CfnOutput(this, 'ConversationBucketName', {
      value: this.conversationBucket.bucketName,
      description: 'S3 bucket for conversation storage'
    });
  }
}
```

### 2.3 Deploy Initial Infrastructure

```bash
# Bootstrap CDK (first time only)
cdk bootstrap aws://YOUR_ACCOUNT_ID/us-east-2

# Synthesize CloudFormation template
cdk synth

# Deploy
cdk deploy

# Save outputs
cdk deploy --outputs-file outputs.json
```

**Expected Output:**
```
Outputs:
BedrockStack.AgentId = ABCDEF123456
BedrockStack.AgentArn = arn:aws:bedrock:us-east-2:123456789012:agent/ABCDEF123456
BedrockStack.ConversationBucketName = coursecompanion-conversations-123456789012
```

### 2.4 Verify Agent Creation

```bash
# List agents
aws bedrock-agent list-agents --region us-east-2

# Get agent details
aws bedrock-agent get-agent \
  --agent-id ABCDEF123456 \
  --region us-east-2
```

---

## Step 3: Implement First Action Group (Canvas Data Retrieval)

### 3.1 Create Shared Canvas API Client

Create `lambda/shared/canvas-api-client.ts`:

```typescript
import axios, { AxiosInstance } from 'axios';

export interface Course {
  id: number;
  name: string;
  course_code: string;
  enrollment_term_id: number;
  start_at?: string;
  end_at?: string;
  workflow_state: string;
}

export interface CourseDetails extends Course {
  syllabus_body?: string;
  total_students?: number;
  enrollments?: any[];
}

export interface Module {
  id: number;
  name: string;
  position: number;
  items?: ModuleItem[];
}

export interface ModuleItem {
  id: number;
  title: string;
  type: 'File' | 'Page' | 'Discussion' | 'Assignment' | 'Quiz' | 'ExternalUrl';
  content_id?: number;
  url?: string;
}

export class CanvasApiClient {
  private client: AxiosInstance;
  private baseUrl: string;

  constructor(accessToken: string, baseUrl: string = 'https://canvas.instructure.com/api/v1') {
    this.baseUrl = baseUrl;
    this.client = axios.create({
      baseURL: baseUrl,
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });
  }

  /**
   * Get all active courses for the current user
   */
  async getCourses(): Promise<Course[]> {
    try {
      const response = await this.client.get('/courses', {
        params: {
          enrollment_state: 'active',
          per_page: 100
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching courses:', error);
      throw new Error(`Failed to fetch courses: ${error.message}`);
    }
  }

  /**
   * Get detailed information about a specific course
   */
  async getCourseDetails(courseId: number, includeSyllabus: boolean = true): Promise<CourseDetails> {
    try {
      const includes = ['syllabus_body', 'total_students', 'enrollments'];
      const response = await this.client.get(`/courses/${courseId}`, {
        params: {
          include: includeSyllabus ? includes : includes.filter(i => i !== 'syllabus_body')
        }
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching course ${courseId}:`, error);
      throw new Error(`Failed to fetch course details: ${error.message}`);
    }
  }

  /**
   * Get all modules for a course
   */
  async getCourseModules(courseId: number): Promise<Module[]> {
    try {
      const response = await this.client.get(`/courses/${courseId}/modules`, {
        params: {
          include: ['items'],
          per_page: 100
        }
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching modules for course ${courseId}:`, error);
      throw new Error(`Failed to fetch course modules: ${error.message}`);
    }
  }
}
```

### 3.2 Create OpenAPI Schema

Create `openapi-schemas/canvas-data-retrieval.yaml`:

```yaml
openapi: 3.0.0
info:
  title: Canvas Course Data Retrieval API
  version: 1.0.0
  description: Fetch course information, syllabi, modules, and learning materials from Canvas LMS

paths:
  /get_all_courses:
    post:
      summary: Fetch all active courses for the student
      description: Returns a list of all courses the student is currently enrolled in
      operationId: getAllCourses
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                userId:
                  type: string
                  description: Unique user identifier from your authentication system
                canvasToken:
                  type: string
                  description: Canvas API access token for the authenticated user
              required:
                - userId
                - canvasToken
      responses:
        '200':
          description: List of active courses
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/Course'
        '400':
          description: Invalid request
        '401':
          description: Unauthorized - invalid Canvas token
        '500':
          description: Server error

  /get_course_details:
    post:
      summary: Get detailed information about a specific course
      description: Retrieves comprehensive course information including syllabus, enrollment data, and learning objectives
      operationId: getCourseDetails
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                userId:
                  type: string
                  description: Unique user identifier
                canvasToken:
                  type: string
                  description: Canvas API access token
                courseId:
                  type: integer
                  description: Canvas course ID to retrieve details for
                includeSyllabus:
                  type: boolean
                  description: Whether to include full syllabus content
                  default: true
              required:
                - userId
                - canvasToken
                - courseId
      responses:
        '200':
          description: Detailed course information
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/CourseDetails'
        '404':
          description: Course not found

  /get_course_modules:
    post:
      summary: Retrieve all modules and learning materials for a course
      description: Returns structured learning content organized by modules and module items
      operationId: getCourseModules
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                userId:
                  type: string
                canvasToken:
                  type: string
                courseId:
                  type: integer
                  description: Canvas course ID to retrieve modules for
              required:
                - userId
                - canvasToken
                - courseId
      responses:
        '200':
          description: Course modules with items
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/Module'

components:
  schemas:
    Course:
      type: object
      properties:
        id:
          type: integer
          description: Unique Canvas course ID
        name:
          type: string
          description: Full course name
          example: "Introduction to Computer Science"
        course_code:
          type: string
          description: Course code or number
          example: "CS 101"
        enrollment_term_id:
          type: integer
          description: Academic term identifier
        start_at:
          type: string
          format: date-time
          description: Course start date
        end_at:
          type: string
          format: date-time
          description: Course end date
        workflow_state:
          type: string
          enum: [available, completed, unpublished]

    CourseDetails:
      type: object
      properties:
        id:
          type: integer
        name:
          type: string
        course_code:
          type: string
        syllabus_body:
          type: string
          description: HTML content of course syllabus
        start_at:
          type: string
          format: date-time
        end_at:
          type: string
          format: date-time
        total_students:
          type: integer
          description: Number of enrolled students
        enrollments:
          type: array
          description: User's enrollment details
          items:
            type: object

    Module:
      type: object
      properties:
        id:
          type: integer
        name:
          type: string
          description: Module name/title
        position:
          type: integer
          description: Order position in course
        items:
          type: array
          description: Learning materials in this module
          items:
            $ref: '#/components/schemas/ModuleItem'

    ModuleItem:
      type: object
      properties:
        id:
          type: integer
        title:
          type: string
          description: Item title
        type:
          type: string
          enum: [File, Page, Discussion, Assignment, Quiz, ExternalUrl]
          description: Type of learning material
        content_id:
          type: integer
          description: ID of the actual content object
        url:
          type: string
          description: API URL to retrieve full item details
```

### 3.3 Create Lambda Handler

Create `lambda/action-groups/canvas-data/index.ts`:

```typescript
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { CanvasApiClient } from '../../shared/canvas-api-client';

interface BedrockAgentEvent {
  messageVersion: string;
  agent: {
    name: string;
    id: string;
    alias: string;
    version: string;
  };
  sessionId: string;
  sessionAttributes: Record<string, string>;
  promptSessionAttributes: Record<string, string>;
  inputText: string;
  apiPath: string;
  httpMethod: string;
  parameters: Array<{
    name: string;
    type: string;
    value: string;
  }>;
}

interface BedrockAgentResponse {
  messageVersion: string;
  response: {
    actionGroup: string;
    apiPath: string;
    httpMethod: string;
    httpStatusCode: number;
    responseBody: {
      'application/json': {
        body: string;
      };
    };
  };
}

export const handler = async (event: any): Promise<BedrockAgentResponse> => {
  console.log('Received event:', JSON.stringify(event, null, 2));

  try {
    const agentEvent = event as BedrockAgentEvent;
    const { apiPath, httpMethod, parameters } = agentEvent;

    // Extract parameters
    const params: Record<string, any> = {};
    parameters.forEach(param => {
      params[param.name] = param.value;
    });

    const { userId, canvasToken, courseId, includeSyllabus } = params;

    // Validate required parameters
    if (!userId || !canvasToken) {
      throw new Error('Missing required parameters: userId and canvasToken');
    }

    // Initialize Canvas client
    const canvasBaseUrl = process.env.CANVAS_API_BASE_URL || 'https://canvas.instructure.com/api/v1';
    const canvasClient = new CanvasApiClient(canvasToken, canvasBaseUrl);

    let result: any;

    // Route to appropriate method based on API path
    switch (apiPath) {
      case '/get_all_courses':
        console.log(`Fetching all courses for user ${userId}`);
        result = await canvasClient.getCourses();
        break;

      case '/get_course_details':
        if (!courseId) {
          throw new Error('Missing required parameter: courseId');
        }
        console.log(`Fetching details for course ${courseId}`);
        result = await canvasClient.getCourseDetails(
          parseInt(courseId),
          includeSyllabus !== 'false'
        );
        break;

      case '/get_course_modules':
        if (!courseId) {
          throw new Error('Missing required parameter: courseId');
        }
        console.log(`Fetching modules for course ${courseId}`);
        result = await canvasClient.getCourseModules(parseInt(courseId));
        break;

      default:
        throw new Error(`Unknown API path: ${apiPath}`);
    }

    console.log(`Successfully processed ${apiPath}`);

    // Return Bedrock Agent response format
    return {
      messageVersion: '1.0',
      response: {
        actionGroup: agentEvent.agent.name,
        apiPath: apiPath,
        httpMethod: httpMethod,
        httpStatusCode: 200,
        responseBody: {
          'application/json': {
            body: JSON.stringify(result)
          }
        }
      }
    };

  } catch (error) {
    console.error('Error in canvas-data-retrieval handler:', error);

    return {
      messageVersion: '1.0',
      response: {
        actionGroup: 'canvas-data-retrieval',
        apiPath: event.apiPath || '/unknown',
        httpMethod: event.httpMethod || 'POST',
        httpStatusCode: 500,
        responseBody: {
          'application/json': {
            body: JSON.stringify({
              error: error.message,
              details: error.stack
            })
          }
        }
      }
    };
  }
};
```

### 3.4 Add Lambda to CDK Stack

Update `lib/bedrock-stack.ts` to include the Lambda function:

```typescript
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as path from 'path';

// ... existing code ...

export class BedrockStack extends cdk.Stack {
  // ... existing code ...

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // ... existing S3 and agent role code ...

    // Create Lambda for Canvas Data Retrieval
    const canvasDataLambda = new lambda.Function(this, 'CanvasDataRetrieval', {
      functionName: 'coursecompanion-canvas-data-retrieval',
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../lambda/action-groups/canvas-data')),
      timeout: cdk.Duration.seconds(30),
      memorySize: 512,
      environment: {
        CANVAS_API_BASE_URL: process.env.CANVAS_API_BASE_URL || 'https://canvas.instructure.com/api/v1'
      }
    });

    // Grant Bedrock Agent permission to invoke Lambda
    canvasDataLambda.grantInvoke(agentRole);

    // Create Action Group
    const canvasDataActionGroup = new bedrock.CfnAgentActionGroup(this, 'CanvasDataActionGroup', {
      agentId: this.agent.attrAgentId,
      agentVersion: 'DRAFT',
      actionGroupName: 'canvas-data-retrieval',
      description: 'Fetch course information, syllabi, modules, and learning materials from Canvas LMS',
      actionGroupExecutor: {
        lambda: canvasDataLambda.functionArn
      },
      apiSchema: {
        s3: {
          s3BucketName: 'YOUR_SCHEMA_BUCKET', // Upload schema here
          s3ObjectKey: 'canvas-data-retrieval.yaml'
        }
      }
    });

    // Ensure action group is created after agent
    canvasDataActionGroup.node.addDependency(this.agent);

    new cdk.CfnOutput(this, 'CanvasDataLambdaArn', {
      value: canvasDataLambda.functionArn
    });
  }
}
```

### 3.5 Upload OpenAPI Schema to S3

```bash
# Create S3 bucket for schemas
aws s3 mb s3://coursecompanion-schemas-$(aws sts get-caller-identity --query Account --output text) --region us-east-2

# Upload schema
aws s3 cp openapi-schemas/canvas-data-retrieval.yaml \
  s3://coursecompanion-schemas-$(aws sts get-caller-identity --query Account --output text)/canvas-data-retrieval.yaml
```

### 3.6 Build and Deploy

```bash
# Install Lambda dependencies
cd lambda/action-groups/canvas-data
npm init -y
npm install axios

# Build TypeScript (if using)
npx tsc index.ts --outDir dist --target ES2020 --module commonjs

# Deploy
cd ../../..
cdk deploy
```

### 3.7 Prepare Agent

```bash
# Prepare the agent (creates executable version)
aws bedrock-agent prepare-agent \
  --agent-id YOUR_AGENT_ID \
  --region us-east-2

# Create alias
aws bedrock-agent create-agent-alias \
  --agent-id YOUR_AGENT_ID \
  --agent-alias-name prod \
  --region us-east-2
```

---

## Step 4: Build Chat Handler

### 4.1 Create Types

Create `lambda/shared/types.ts`:

```typescript
export interface ChatRequest {
  message: string;
  sessionId?: string;
  userId: string;
  canvasToken: string;
}

export interface ChatResponse {
  message: string;
  sessionId: string;
  citations?: Citation[];
  trace?: any;
}

export interface Citation {
  type: 'knowledge_base' | 'action_group' | 'canvas_data';
  content?: string;
  source?: string;
  metadata?: Record<string, any>;
}

export interface ConversationHistory {
  sessionId: string;
  userId: string;
  messages: ConversationMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  citations?: Citation[];
}
```

### 4.2 Create Chat Handler Lambda

Create `lambda/chat-handler/index.ts`:

```typescript
import {
  BedrockAgentRuntimeClient,
  InvokeAgentCommand,
  InvokeAgentCommandInput
} from '@aws-sdk/client-bedrock-agent-runtime';
import { S3Client, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';
import { ChatRequest, ChatResponse, ConversationHistory, Citation } from '../shared/types';

const bedrockClient = new BedrockAgentRuntimeClient({ region: process.env.AWS_REGION || 'us-east-2' });
const s3Client = new S3Client({ region: process.env.AWS_REGION || 'us-east-2' });

const AGENT_ID = process.env.BEDROCK_AGENT_ID!;
const AGENT_ALIAS_ID = process.env.BEDROCK_AGENT_ALIAS_ID!;
const CONVERSATION_BUCKET = process.env.CONVERSATION_BUCKET!;

export const handler = async (event: any): Promise<any> => {
  console.log('Chat handler received event:', JSON.stringify(event, null, 2));

  try {
    const body: ChatRequest = JSON.parse(event.body);
    const { message, userId, canvasToken } = body;
    let { sessionId } = body;

    // Validate required fields
    if (!message || !userId || !canvasToken) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Missing required fields: message, userId, canvasToken' })
      };
    }

    // Generate session ID if not provided
    if (!sessionId) {
      sessionId = uuidv4();
      console.log(`Created new session: ${sessionId}`);
    }

    // Load conversation history
    const conversationHistory = await loadConversationHistory(userId, sessionId);

    // Prepare Bedrock Agent invocation
    const input: InvokeAgentCommandInput = {
      agentId: AGENT_ID,
      agentAliasId: AGENT_ALIAS_ID,
      sessionId: sessionId,
      inputText: message,
      sessionState: {
        sessionAttributes: {
          userId: userId,
          canvasToken: canvasToken
        }
      },
      enableTrace: true
    };

    console.log('Invoking Bedrock Agent...');
    const command = new InvokeAgentCommand(input);
    const response = await bedrockClient.send(command);

    // Process streaming response
    let fullResponse = '';
    const citations: Citation[] = [];
    let traceData: any = null;

    if (response.completion) {
      for await (const event of response.completion) {
        if (event.chunk) {
          const chunk = new TextDecoder().decode(event.chunk.bytes);
          fullResponse += chunk;
          console.log('Received chunk:', chunk);
        }

        if (event.trace) {
          console.log('Trace event:', JSON.stringify(event.trace, null, 2));
          traceData = event.trace;

          // Extract citations from trace
          if (event.trace.orchestrationTrace) {
            const orchestration = event.trace.orchestrationTrace;

            // Knowledge base citations
            if (orchestration.observation?.knowledgeBaseLookupOutput) {
              const kbResults = orchestration.observation.knowledgeBaseLookupOutput.retrievedReferences || [];
              kbResults.forEach((ref: any) => {
                citations.push({
                  type: 'knowledge_base',
                  content: ref.content?.text,
                  source: ref.location?.s3Location?.uri,
                  metadata: ref.metadata
                });
              });
            }

            // Action group citations
            if (orchestration.observation?.actionGroupInvocationOutput) {
              const actionOutput = orchestration.observation.actionGroupInvocationOutput;
              citations.push({
                type: 'action_group',
                source: actionOutput.text,
                metadata: {
                  actionGroup: orchestration.rationale?.traceId
                }
              });
            }
          }
        }
      }
    }

    console.log('Full response:', fullResponse);
    console.log('Citations:', citations);

    // Save conversation to history
    conversationHistory.messages.push(
      {
        role: 'user',
        content: message,
        timestamp: new Date().toISOString()
      },
      {
        role: 'assistant',
        content: fullResponse,
        timestamp: new Date().toISOString(),
        citations: citations
      }
    );
    conversationHistory.updatedAt = new Date().toISOString();

    await saveConversationHistory(userId, sessionId, conversationHistory);

    // Prepare response
    const chatResponse: ChatResponse = {
      message: fullResponse,
      sessionId: sessionId,
      citations: citations,
      trace: traceData
    };

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify(chatResponse)
    };

  } catch (error) {
    console.error('Error in chat handler:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        error: 'Internal server error',
        details: error.message
      })
    };
  }
};

/**
 * Load conversation history from S3
 */
async function loadConversationHistory(userId: string, sessionId: string): Promise<ConversationHistory> {
  try {
    const key = `conversations/${userId}/${sessionId}.json`;
    const command = new GetObjectCommand({
      Bucket: CONVERSATION_BUCKET,
      Key: key
    });

    const response = await s3Client.send(command);
    const body = await response.Body?.transformToString();

    if (body) {
      return JSON.parse(body);
    }
  } catch (error) {
    if (error.name !== 'NoSuchKey') {
      console.error('Error loading conversation history:', error);
    }
  }

  // Return new conversation history if not found
  return {
    sessionId,
    userId,
    messages: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

/**
 * Save conversation history to S3
 */
async function saveConversationHistory(
  userId: string,
  sessionId: string,
  history: ConversationHistory
): Promise<void> {
  try {
    const key = `conversations/${userId}/${sessionId}.json`;
    const command = new PutObjectCommand({
      Bucket: CONVERSATION_BUCKET,
      Key: key,
      Body: JSON.stringify(history, null, 2),
      ContentType: 'application/json'
    });

    await s3Client.send(command);
    console.log(`Saved conversation history to ${key}`);
  } catch (error) {
    console.error('Error saving conversation history:', error);
    throw error;
  }
}
```

### 4.3 Add Chat Handler to CDK

Update `lib/bedrock-stack.ts`:

```typescript
// Create Chat Handler Lambda
const chatHandlerLambda = new lambda.Function(this, 'ChatHandler', {
  functionName: 'coursecompanion-chat-handler',
  runtime: lambda.Runtime.NODEJS_18_X,
  handler: 'index.handler',
  code: lambda.Code.fromAsset(path.join(__dirname, '../lambda/chat-handler')),
  timeout: cdk.Duration.seconds(60),
  memorySize: 1024,
  environment: {
    BEDROCK_AGENT_ID: this.agent.attrAgentId,
    BEDROCK_AGENT_ALIAS_ID: 'YOUR_ALIAS_ID', // Update after creating alias
    CONVERSATION_BUCKET: this.conversationBucket.bucketName,
    AWS_REGION: this.region
  }
});

// Grant permissions
this.conversationBucket.grantReadWrite(chatHandlerLambda);
chatHandlerLambda.addToRolePolicy(new iam.PolicyStatement({
  effect: iam.Effect.ALLOW,
  actions: [
    'bedrock:InvokeAgent',
    'bedrock:InvokeModel'
  ],
  resources: [
    this.agent.attrAgentArn,
    `arn:aws:bedrock:${this.region}::foundation-model/*`
  ]
}));
```

---

## Step 5: Set Up API Gateway

### 5.1 Create API Gateway with CDK

Update `lib/bedrock-stack.ts`:

```typescript
import * as apigateway from 'aws-cdk-lib/aws-apigateway';

// ... in constructor ...

// Create API Gateway
const api = new apigateway.RestApi(this, 'CourseCompanionApi', {
  restApiName: 'CourseCompanion Chat API',
  description: 'API for CourseCompanion AI Teaching Assistant',
  defaultCorsPreflightOptions: {
    allowOrigins: apigateway.Cors.ALL_ORIGINS,
    allowMethods: apigateway.Cors.ALL_METHODS,
    allowHeaders: [
      'Content-Type',
      'X-Amz-Date',
      'Authorization',
      'X-Api-Key',
      'X-Amz-Security-Token'
    ]
  },
  deployOptions: {
    stageName: 'prod',
    throttlingBurstLimit: 100,
    throttlingRateLimit: 50,
    loggingLevel: apigateway.MethodLoggingLevel.INFO,
    dataTraceEnabled: true
  }
});

// Create /chat endpoint
const chatResource = api.root.addResource('chat');
const chatIntegration = new apigateway.LambdaIntegration(chatHandlerLambda, {
  proxy: true,
  allowTestInvoke: true
});

chatResource.addMethod('POST', chatIntegration, {
  authorizationType: apigateway.AuthorizationType.NONE, // Add auth later
  requestValidatorOptions: {
    validateRequestBody: true,
    validateRequestParameters: false
  }
});

// Output API URL
new cdk.CfnOutput(this, 'ApiUrl', {
  value: api.url,
  description: 'API Gateway URL'
});

new cdk.CfnOutput(this, 'ChatEndpoint', {
  value: `${api.url}chat`,
  description: 'Chat endpoint URL'
});
```

### 5.2 Deploy

```bash
cdk deploy
```

**Expected output:**
```
Outputs:
BedrockStack.ApiUrl = https://abc123.execute-api.us-east-2.amazonaws.com/prod/
BedrockStack.ChatEndpoint = https://abc123.execute-api.us-east-2.amazonaws.com/prod/chat
```

### 5.3 Test API Endpoint

```bash
# Test chat endpoint
curl -X POST https://YOUR_API_URL/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "What courses am I enrolled in?",
    "userId": "test-user-123",
    "canvasToken": "YOUR_CANVAS_TOKEN"
  }'
```

---

## Step 6: Update Frontend

### 6.1 Update Environment Variables

Create or update `frontend/.env`:

```bash
REACT_APP_API_URL=https://YOUR_API_URL/chat
REACT_APP_BEDROCK_REGION=us-east-2
```

### 6.2 Create Chat API Service

Create `frontend/src/services/chatApi.ts`:

```typescript
export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  citations?: Citation[];
}

export interface Citation {
  type: 'knowledge_base' | 'action_group' | 'canvas_data';
  content?: string;
  source?: string;
  metadata?: Record<string, any>;
}

export interface SendMessageRequest {
  message: string;
  sessionId?: string;
  userId: string;
  canvasToken: string;
}

export interface SendMessageResponse {
  message: string;
  sessionId: string;
  citations?: Citation[];
  trace?: any;
}

class ChatApiService {
  private apiUrl: string;

  constructor() {
    this.apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3000/chat';
  }

  async sendMessage(request: SendMessageRequest): Promise<SendMessageResponse> {
    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(request)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send message');
      }

      return await response.json();
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }
}

export default new ChatApiService();
```

### 6.3 Update ChatPage Component

Update `frontend/src/pages/ChatPage.tsx`:

```typescript
import React, { useState, useEffect, useRef } from 'react';
import chatApi, { ChatMessage, Citation } from '../services/chatApi';
import { useAuth } from '../contexts/AuthContext'; // Your existing auth

const ChatPage: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [sessionId, setSessionId] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { user } = useAuth(); // Get authenticated user

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !user) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: inputMessage,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await chatApi.sendMessage({
        message: inputMessage,
        sessionId: sessionId,
        userId: user.id,
        canvasToken: user.canvasToken // From your auth context
      });

      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: response.message,
        timestamp: new Date().toISOString(),
        citations: response.citations
      };

      setMessages(prev => [...prev, assistantMessage]);
      setSessionId(response.sessionId);

    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h1>CourseCompanion AI</h1>
        <p>Your personalized teaching assistant</p>
      </div>

      <div className="messages-container">
        {messages.map((msg, index) => (
          <div key={index} className={`message message-${msg.role}`}>
            <div className="message-content">
              {msg.content}
            </div>
            {msg.citations && msg.citations.length > 0 && (
              <div className="citations">
                <strong>Sources:</strong>
                {msg.citations.map((citation, i) => (
                  <div key={i} className="citation">
                    <span className="citation-type">{citation.type}</span>
                    {citation.source && (
                      <span className="citation-source">{citation.source}</span>
                    )}
                  </div>
                ))}
              </div>
            )}
            <div className="message-timestamp">
              {new Date(msg.timestamp).toLocaleTimeString()}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="message message-assistant loading">
            <div className="typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="input-container">
        <textarea
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Ask me anything about your courses..."
          disabled={isLoading}
          rows={3}
        />
        <button
          onClick={handleSendMessage}
          disabled={isLoading || !inputMessage.trim()}
        >
          {isLoading ? 'Sending...' : 'Send'}
        </button>
      </div>
    </div>
  );
};

export default ChatPage;
```

### 6.4 Add Styles

Create `frontend/src/pages/ChatPage.css`:

```css
.chat-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  max-width: 1200px;
  margin: 0 auto;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.chat-header {
  padding: 20px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  color: white;
  text-align: center;
}

.chat-header h1 {
  margin: 0;
  font-size: 2rem;
}

.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.message {
  max-width: 70%;
  padding: 12px 16px;
  border-radius: 12px;
  animation: fadeIn 0.3s ease-in;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.message-user {
  align-self: flex-end;
  background: #4CAF50;
  color: white;
}

.message-assistant {
  align-self: flex-start;
  background: white;
  color: #333;
}

.message-content {
  margin-bottom: 8px;
  white-space: pre-wrap;
  word-wrap: break-word;
}

.citations {
  margin-top: 12px;
  padding-top: 8px;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
  font-size: 0.85rem;
}

.citation {
  margin: 4px 0;
  padding: 4px 8px;
  background: rgba(0, 0, 0, 0.05);
  border-radius: 4px;
}

.citation-type {
  font-weight: bold;
  margin-right: 8px;
  color: #667eea;
}

.message-timestamp {
  font-size: 0.75rem;
  color: rgba(0, 0, 0, 0.5);
  margin-top: 4px;
}

.message-user .message-timestamp {
  color: rgba(255, 255, 255, 0.7);
}

.loading .typing-indicator {
  display: flex;
  gap: 4px;
}

.typing-indicator span {
  width: 8px;
  height: 8px;
  background: #667eea;
  border-radius: 50%;
  animation: typing 1.4s infinite;
}

.typing-indicator span:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-indicator span:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes typing {
  0%, 60%, 100% {
    transform: translateY(0);
  }
  30% {
    transform: translateY(-10px);
  }
}

.input-container {
  padding: 20px;
  background: white;
  display: flex;
  gap: 12px;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
}

.input-container textarea {
  flex: 1;
  padding: 12px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  font-family: inherit;
  resize: none;
  transition: border-color 0.3s;
}

.input-container textarea:focus {
  outline: none;
  border-color: #667eea;
}

.input-container button {
  padding: 12px 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.input-container button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.input-container button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
```

---

## Step 7: Test Basic Functionality

### 7.1 Prepare Test Canvas Token

1. Log into Canvas
2. Go to Account → Settings
3. Scroll to "Approved Integrations"
4. Click "+ New Access Token"
5. Purpose: "CourseCompanion Testing"
6. Expires: (set future date)
7. Click "Generate Token"
8. **SAVE THIS TOKEN** - you can't see it again

### 7.2 Manual API Test

```bash
# Save your Canvas token
export CANVAS_TOKEN="YOUR_CANVAS_TOKEN_HERE"

# Test chat endpoint
curl -X POST https://YOUR_API_URL/chat \
  -H "Content-Type: application/json" \
  -d "{
    \"message\": \"What courses am I enrolled in?\",
    \"userId\": \"test-user-123\",
    \"canvasToken\": \"$CANVAS_TOKEN\"
  }" | jq
```

**Expected Response:**
```json
{
  "message": "You are currently enrolled in the following courses:\n\n1. Introduction to Computer Science (CS 101)\n2. Calculus I (MATH 141)\n3. English Composition (ENG 101)\n\nWould you like me to provide more details about any of these courses?",
  "sessionId": "abc-123-def-456",
  "citations": [
    {
      "type": "action_group",
      "source": "canvas-data-retrieval: get_all_courses",
      "metadata": {}
    }
  ]
}
```

### 7.3 Frontend Test

```bash
# Start frontend development server
cd frontend
npm start
```

1. Navigate to Chat page
2. Send message: "What courses am I enrolled in?"
3. Verify response appears
4. Check citations are displayed
5. Test follow-up questions

### 7.4 Verify Conversation Persistence

```bash
# List conversations in S3
aws s3 ls s3://YOUR_CONVERSATION_BUCKET/conversations/ --recursive

# Download a conversation
aws s3 cp s3://YOUR_CONVERSATION_BUCKET/conversations/test-user-123/SESSION_ID.json ./test-conversation.json

# View contents
cat test-conversation.json | jq
```

### 7.5 Test Scenarios

**Test 1: Basic Course Query**
- User: "What courses am I taking?"
- Expected: List of active courses
- Verify: Action group `get_all_courses` was called

**Test 2: Course Details**
- User: "Tell me more about my CS 101 course"
- Expected: Course details including syllabus
- Verify: Action group `get_course_details` was called

**Test 3: Multi-turn Conversation**
- User: "What courses am I taking?"
- AI: (lists courses)
- User: "What modules are in the first one?"
- Expected: AI remembers context, fetches modules
- Verify: Session ID persists, conversation history maintained

**Test 4: Error Handling**
- User: Send request with invalid Canvas token
- Expected: Graceful error message
- Verify: No crash, helpful error response

### 7.6 Troubleshooting

**Problem: "Agent not found" error**
```bash
# Verify agent exists
aws bedrock-agent get-agent --agent-id YOUR_AGENT_ID --region us-east-2

# Ensure agent is prepared
aws bedrock-agent prepare-agent --agent-id YOUR_AGENT_ID --region us-east-2
```

**Problem: "Lambda timeout"**
```bash
# Increase timeout in CDK
timeout: cdk.Duration.seconds(60)

# Redeploy
cdk deploy
```

**Problem: "CORS error"**
```bash
# Verify API Gateway CORS settings
aws apigateway get-method \
  --rest-api-id YOUR_API_ID \
  --resource-id YOUR_RESOURCE_ID \
  --http-method OPTIONS \
  --region us-east-2
```

**Problem: "Canvas API unauthorized"**
```bash
# Test Canvas token directly
curl -H "Authorization: Bearer $CANVAS_TOKEN" \
  https://canvas.instructure.com/api/v1/courses
```

---

## Phase 1 Completion Checklist

- [ ] AWS Bedrock access enabled
- [ ] Bedrock Agent created with basic instructions
- [ ] Action Group 1 (Canvas Data Retrieval) implemented
- [ ] OpenAPI schema uploaded to S3
- [ ] Lambda function deployed and connected
- [ ] Chat Handler Lambda created
- [ ] Conversation history saving to S3
- [ ] API Gateway endpoint deployed
- [ ] Frontend ChatPage updated
- [ ] Basic chat functionality tested
- [ ] Multi-turn conversations working
- [ ] Session persistence verified
- [ ] Error handling tested

**Deliverable Achieved:** ✅ Students can chat with AI and ask about their Canvas courses

---

# PHASE 2: INTELLIGENCE (Week 3-4)

## Step 8: Implement Assignment Analysis

### 8.1 Extend Canvas API Client

Update `lambda/shared/canvas-api-client.ts`:

```typescript
export interface Assignment {
  id: number;
  name: string;
  description: string;
  due_at: string;
  points_possible: number;
  submission_types: string[];
  has_submitted_submissions: boolean;
  workflow_state: string;
  course_id: number;
}

export interface Submission {
  id: number;
  assignment_id: number;
  user_id: number;
  submitted_at: string;
  score: number;
  grade: string;
  late: boolean;
  missing: boolean;
  workflow_state: string;
}

// Add to CanvasApiClient class:

async getCourseAssignments(courseId: number): Promise<Assignment[]> {
  try {
    const response = await this.client.get(`/courses/${courseId}/assignments`, {
      params: {
        per_page: 100,
        order_by: 'due_at'
      }
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching assignments for course ${courseId}:`, error);
    throw new Error(`Failed to fetch assignments: ${error.message}`);
  }
}

async getUserSubmissions(courseId: number, userId: number): Promise<Submission[]> {
  try {
    const response = await this.client.get(
      `/courses/${courseId}/students/submissions`,
      {
        params: {
          student_ids: [userId],
          per_page: 100
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error(`Error fetching submissions:`, error);
    throw new Error(`Failed to fetch submissions: ${error.message}`);
  }
}
```

### 8.2 Create OpenAPI Schema

Create `openapi-schemas/assignment-analysis.yaml`:

```yaml
openapi: 3.0.0
info:
  title: Assignment & Deadline Analysis API
  version: 1.0.0
  description: Analyze assignments, deadlines, and calculate workload distribution

paths:
  /get_upcoming_assignments:
    post:
      summary: Fetch all assignments due in next N days
      operationId: getUpcomingAssignments
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                userId:
                  type: string
                canvasToken:
                  type: string
                daysAhead:
                  type: integer
                  description: Number of days to look ahead
                  default: 14
              required:
                - userId
                - canvasToken
      responses:
        '200':
          description: List of upcoming assignments
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/UpcomingAssignment'

  /get_assignment_details:
    post:
      summary: Retrieve full assignment information including rubrics
      operationId: getAssignmentDetails
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                userId:
                  type: string
                canvasToken:
                  type: string
                courseId:
                  type: integer
                assignmentId:
                  type: integer
              required:
                - userId
                - canvasToken
                - courseId
                - assignmentId
      responses:
        '200':
          description: Detailed assignment information

  /analyze_workload:
    post:
      summary: Calculate total point value and estimated time per assignment
      operationId: analyzeWorkload
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                userId:
                  type: string
                canvasToken:
                  type: string
                daysAhead:
                  type: integer
                  default: 14
              required:
                - userId
                - canvasToken
      responses:
        '200':
          description: Workload analysis
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/WorkloadAnalysis'

  /get_missing_assignments:
    post:
      summary: Identify overdue or missing assignments
      operationId: getMissingAssignments
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                userId:
                  type: string
                canvasToken:
                  type: string
              required:
                - userId
                - canvasToken
      responses:
        '200':
          description: List of missing assignments
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/MissingAssignment'

components:
  schemas:
    UpcomingAssignment:
      type: object
      properties:
        id:
          type: integer
        name:
          type: string
        courseId:
          type: integer
        courseName:
          type: string
        dueDate:
          type: string
          format: date-time
        points:
          type: number
        submitted:
          type: boolean
        daysUntilDue:
          type: integer
        priority:
          type: string
          enum: [high, medium, low]

    WorkloadAnalysis:
      type: object
      properties:
        totalPoints:
          type: number
        estimatedHours:
          type: number
        breakdown:
          type: array
          items:
            type: object
            properties:
              courseId:
                type: integer
              courseName:
                type: string
              assignments:
                type: array
                items:
                  type: object
        recommendations:
          type: array
          items:
            type: string

    MissingAssignment:
      type: object
      properties:
        id:
          type: integer
        name:
          type: string
        courseName:
          type: string
        dueDate:
          type: string
        pointsLost:
          type: number
        daysOverdue:
          type: integer
```

### 8.3 Create Lambda Handler

Create `lambda/action-groups/assignments/index.ts`:

```typescript
import { CanvasApiClient, Assignment } from '../../shared/canvas-api-client';

interface WorkloadAnalysis {
  totalPoints: number;
  estimatedHours: number;
  breakdown: {
    courseId: number;
    courseName: string;
    assignments: {
      id: number;
      name: string;
      dueDate: string;
      points: number;
      estimatedHours: number;
      priority: 'high' | 'medium' | 'low';
    }[];
  }[];
  recommendations: string[];
}

export const handler = async (event: any): Promise<any> => {
  console.log('Assignment analysis handler:', JSON.stringify(event, null, 2));

  try {
    const { apiPath, parameters } = event;
    const params: Record<string, any> = {};
    parameters.forEach((p: any) => {
      params[p.name] = p.value;
    });

    const { userId, canvasToken, daysAhead = 14 } = params;
    const canvasClient = new CanvasApiClient(canvasToken);

    let result: any;

    switch (apiPath) {
      case '/get_upcoming_assignments':
        result = await getUpcomingAssignments(canvasClient, parseInt(daysAhead));
        break;

      case '/get_assignment_details':
        const { courseId, assignmentId } = params;
        result = await getAssignmentDetails(
          canvasClient,
          parseInt(courseId),
          parseInt(assignmentId)
        );
        break;

      case '/analyze_workload':
        result = await analyzeWorkload(canvasClient, parseInt(daysAhead));
        break;

      case '/get_missing_assignments':
        result = await getMissingAssignments(canvasClient);
        break;

      default:
        throw new Error(`Unknown API path: ${apiPath}`);
    }

    return {
      messageVersion: '1.0',
      response: {
        actionGroup: 'assignment-analysis',
        apiPath,
        httpMethod: 'POST',
        httpStatusCode: 200,
        responseBody: {
          'application/json': {
            body: JSON.stringify(result)
          }
        }
      }
    };
  } catch (error) {
    console.error('Error in assignment-analysis:', error);
    return {
      messageVersion: '1.0',
      response: {
        actionGroup: 'assignment-analysis',
        apiPath: event.apiPath || '/unknown',
        httpMethod: 'POST',
        httpStatusCode: 500,
        responseBody: {
          'application/json': {
            body: JSON.stringify({ error: error.message })
          }
        }
      }
    };
  }
};

async function getUpcomingAssignments(client: CanvasApiClient, daysAhead: number) {
  const courses = await client.getCourses();
  const now = new Date();
  const cutoffDate = new Date(now.getTime() + daysAhead * 24 * 60 * 60 * 1000);

  const upcoming = [];

  for (const course of courses) {
    const assignments = await client.getCourseAssignments(course.id);

    for (const assignment of assignments) {
      if (!assignment.due_at) continue;

      const dueDate = new Date(assignment.due_at);
      if (dueDate > now && dueDate <= cutoffDate) {
        const daysUntilDue = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

        upcoming.push({
          id: assignment.id,
          name: assignment.name,
          courseId: course.id,
          courseName: course.name,
          dueDate: assignment.due_at,
          points: assignment.points_possible,
          submitted: assignment.has_submitted_submissions,
          daysUntilDue,
          priority: calculatePriority(daysUntilDue, assignment.points_possible)
        });
      }
    }
  }

  return upcoming.sort((a, b) =>
    new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
  );
}

async function getAssignmentDetails(
  client: CanvasApiClient,
  courseId: number,
  assignmentId: number
) {
  // Fetch assignment details - implementation similar to above
  const assignments = await client.getCourseAssignments(courseId);
  return assignments.find(a => a.id === assignmentId);
}

async function analyzeWorkload(client: CanvasApiClient, daysAhead: number): Promise<WorkloadAnalysis> {
  const courses = await client.getCourses();
  const now = new Date();
  const cutoffDate = new Date(now.getTime() + daysAhead * 24 * 60 * 60 * 1000);

  const breakdown = [];
  let totalPoints = 0;
  let totalHours = 0;

  for (const course of courses) {
    const assignments = await client.getCourseAssignments(course.id);
    const upcoming = assignments.filter(a => {
      if (!a.due_at || a.has_submitted_submissions) return false;
      const due = new Date(a.due_at);
      return due > now && due <= cutoffDate;
    });

    const courseAssignments = upcoming.map(a => {
      const daysUntilDue = Math.ceil(
        (new Date(a.due_at).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      );
      const estimatedHours = estimateTimeRequired(a);

      totalPoints += a.points_possible;
      totalHours += estimatedHours;

      return {
        id: a.id,
        name: a.name,
        dueDate: a.due_at,
        points: a.points_possible,
        estimatedHours,
        priority: calculatePriority(daysUntilDue, a.points_possible)
      };
    });

    if (courseAssignments.length > 0) {
      breakdown.push({
        courseId: course.id,
        courseName: course.name,
        assignments: courseAssignments
      });
    }
  }

  const recommendations = generateWorkloadRecommendations(breakdown, totalHours, daysAhead);

  return {
    totalPoints,
    estimatedHours: totalHours,
    breakdown,
    recommendations
  };
}

async function getMissingAssignments(client: CanvasApiClient) {
  const courses = await client.getCourses();
  const missing = [];
  const now = new Date();

  for (const course of courses) {
    const assignments = await client.getCourseAssignments(course.id);

    for (const assignment of assignments) {
      if (assignment.due_at && !assignment.has_submitted_submissions) {
        const dueDate = new Date(assignment.due_at);
        if (dueDate < now) {
          const daysOverdue = Math.floor((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));

          missing.push({
            id: assignment.id,
            name: assignment.name,
            courseName: course.name,
            dueDate: assignment.due_at,
            pointsLost: assignment.points_possible,
            daysOverdue
          });
        }
      }
    }
  }

  return missing.sort((a, b) => b.daysOverdue - a.daysOverdue);
}

function calculatePriority(daysUntilDue: number, points: number): 'high' | 'medium' | 'low' {
  if (daysUntilDue <= 2) return 'high';
  if (daysUntilDue <= 5 && points >= 50) return 'high';
  if (daysUntilDue <= 7) return 'medium';
  return 'low';
}

function estimateTimeRequired(assignment: Assignment): number {
  // Simple heuristic: 1 hour per 10 points, minimum 1 hour
  const baseHours = Math.max(1, assignment.points_possible / 10);

  // Adjust based on submission type
  const submissionTypes = assignment.submission_types || [];
  let multiplier = 1;

  if (submissionTypes.includes('online_upload') || submissionTypes.includes('online_text_entry')) {
    multiplier = 1.5; // Essays/projects take longer
  }
  if (submissionTypes.includes('external_tool')) {
    multiplier = 2; // External tools often complex
  }

  return Math.round(baseHours * multiplier * 10) / 10;
}

function generateWorkloadRecommendations(breakdown: any[], totalHours: number, daysAhead: number): string[] {
  const recommendations = [];
  const hoursPerDay = totalHours / daysAhead;

  if (hoursPerDay > 4) {
    recommendations.push(`High workload detected: ${totalHours} hours over ${daysAhead} days. Consider starting assignments early.`);
  }

  const highPriorityCount = breakdown.reduce((sum, course) =>
    sum + course.assignments.filter((a: any) => a.priority === 'high').length, 0
  );

  if (highPriorityCount > 3) {
    recommendations.push(`You have ${highPriorityCount} high-priority assignments. Focus on these first.`);
  }

  recommendations.push(`Recommended daily study time: ${Math.ceil(hoursPerDay)} hours`);

  return recommendations;
}
```

### 8.4 Deploy Action Group

```bash
# Build and package
cd lambda/action-groups/assignments
npm install

# Upload schema
aws s3 cp ../../../openapi-schemas/assignment-analysis.yaml \
  s3://coursecompanion-schemas-$(aws sts get-caller-identity --query Account --output text)/

# Deploy with CDK (add to bedrock-stack.ts similar to Step 3.4)
cd ../../..
cdk deploy
```

### 8.5 Test Assignment Analysis

```bash
curl -X POST https://YOUR_API_URL/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "What assignments are due this week?",
    "userId": "test-user",
    "canvasToken": "YOUR_TOKEN",
    "sessionId": "test-session"
  }'
```

---

**Continue this pattern for Steps 9-27...**

Due to length constraints, I've provided detailed implementation for the first 8 steps. The remaining steps follow the same pattern:

- **Steps 9-11:** Implement remaining action groups (Performance, Quiz, Recommendations)
- **Steps 12-13:** Add conversation memory and enhance agent instructions
- **Steps 14-18:** Set up knowledge base, RAG, and study guide generation
- **Steps 19-24:** Configure guardrails, security, monitoring
- **Steps 25-28:** Add advanced features and deploy to production

---

## Quick Reference: Complete Action Group List

1. ✅ **Canvas Data Retrieval** - Courses, modules, syllabi
2. ✅ **Assignment Analysis** - Deadlines, workload, missing work
3. **Performance Analysis** - Grades, weak areas, trends
4. **Quiz Analysis** - Quiz scores, question analysis
5. **Study Guide Generation** - Custom study materials
6. **Content Extraction** - PDFs, documents, videos
7. **Recommendations** - Study priorities, time allocation

---

## Deployment Commands Reference

```bash
# Initial setup
cdk bootstrap
cdk deploy

# Update agent after changes
aws bedrock-agent prepare-agent --agent-id YOUR_ID --region us-east-2

# Create/update alias
aws bedrock-agent create-agent-alias \
  --agent-id YOUR_ID \
  --agent-alias-name prod

# Test locally
npm run test

# View logs
aws logs tail /aws/lambda/coursecompanion-chat-handler --follow

# Check costs
aws ce get-cost-and-usage \
  --time-period Start=2025-01-01,End=2025-01-31 \
  --granularity MONTHLY \
  --metrics BlendedCost
```

---

## Support & Resources

- **AWS Bedrock Agents Documentation:** https://docs.aws.amazon.com/bedrock/latest/userguide/agents.html
- **Canvas API Documentation:** https://canvas.instructure.com/doc/api/
- **Claude Model Card:** https://docs.anthropic.com/claude/docs
- **CDK Documentation:** https://docs.aws.amazon.com/cdk/

---

## Next Steps

After completing Phase 1:
1. Review this guide and the original architecture document
2. Proceed to Phase 2 for intelligence features
3. Join implementation kickoff meeting
4. Set up project tracking board

**Questions?** Refer to BEDROCK_AGENT_ARCHITECTURE.md for detailed technical specifications.
