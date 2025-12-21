import { Groq } from 'groq-sdk';

// Configuration
const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY || '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';

// Initialize Groq client
const groq = new Groq({ apiKey: GROQ_API_KEY, dangerouslyAllowBrowser: true });

// Types
export interface LessonContext {
    className: string;
    grade: string;
    subject: string;
    topic: string;
}

export interface AssessmentContext extends LessonContext {
    type: string;
    questionCount: number;
    difficulty: string;
}

// Services
const groqAvailable = !!GROQ_API_KEY;

export const generateLessonPlan = async (prompt: string, context: LessonContext) => {
    const systemPrompt = `You are an expert teacher's assistant specializing in creating comprehensive lesson plans.
  Based on the following context, create a detailed lesson plan:
  Class: ${context.className}
  Grade: ${context.grade}
  Subject: ${context.subject}
  Topic: ${context.topic}
  
  The response should be formatted in Markdown.
  Include sections for: Objectives, Materials, Introduction, Core Activities, Practice, and Assessment.`;

    try {
        console.log('[AI] Generating lesson plan...');
        const chatCompletion = await groq.chat.completions.create({
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: prompt }
            ],
            model: 'llama-3.3-70b-versatile',
            temperature: 0.7,
            max_completion_tokens: 2048,
        });

        const content = chatCompletion.choices[0]?.message?.content;
        console.log('[AI] Lesson plan generated successfully');
        return content || 'Failed to generate lesson plan';
    } catch (error) {
        console.error('[AI] Lesson plan generation error:', error);
        throw new Error('Failed to generate lesson plan');
    }
};

export const generateAssessment = async (prompt: string, context: AssessmentContext) => {
    const systemPrompt = `You are an expert educational assessment creator.
  Create an assessment (quiz/test) based on:
  Grade: ${context.grade}
  Subject: ${context.subject}
  Topic: ${context.topic}
  Type: ${context.type}
  Difficulty: ${context.difficulty}
  Questions: ${context.questionCount}
  
  Return the result as a STRICT JSON object with this structure:
  {
    "title": "Assessment Title",
    "description": "Brief description",
    "questions": [
      {
        "text": "Question text",
        "type": "mcq" | "short_answer",
        "options": ["A", "B", "C", "D"], (only for mcq)
        "correctAnswer": "Correct option or answer text",
        "points": number,
        "explanation": "Why this answer is correct"
      }
    ],
    "rubric": "Grading criteria description"
  }
  Do not include markdown formatting or backticks around the JSON.`;

    try {
        console.log('[AI] Generating assessment...');
        const chatCompletion = await groq.chat.completions.create({
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: prompt }
            ],
            model: 'llama-3.3-70b-versatile',
            temperature: 0.5,
            max_completion_tokens: 2048,
            response_format: { type: "json_object" }
        });

        const content = chatCompletion.choices[0]?.message?.content;
        console.log('[AI] Assessment generated successfully');
        return JSON.parse(content || '{}');
    } catch (error) {
        console.error('[AI] Assessment generation error:', error);
        throw new Error('Failed to generate assessment');
    }
};

export const autoGradeSubmission = async (question: string, studentAnswer: string, rubric: string, correctAnswer?: string) => {
    const systemPrompt = `You are an AI grader. Grade the following student answer based on the rubric and/or correct answer.
    Question: ${question}
    Correct Answer: ${correctAnswer || 'N/A'}
    Rubric: ${rubric}
    
    Student Answer: ${studentAnswer}
    
    Return JSON:
    {
        "score": number (0-100),
        "feedback": "Constructive feedback for the student"
    }
    `;

    try {
        const chatCompletion = await groq.chat.completions.create({
            messages: [
                { role: 'system', content: systemPrompt },
            ],
            model: 'llama-3.3-70b-versatile',
            temperature: 0.3,
            max_completion_tokens: 512,
            response_format: { type: "json_object" }
        });

        const content = chatCompletion.choices[0]?.message?.content;
        return JSON.parse(content || '{"score": 0, "feedback": "Error during grading"}');
    } catch (error) {
        console.error('[AI] Grading error:', error);
        return { score: 0, feedback: "Error during auto-grading" };
    }
};
export const getTutorResponse = async (message: string, history: any[], context: any) => {
    const systemPrompt = `You are "EduSpark AI Tutor", a helpful, encouraging, and highly knowledgeable tutor for students.
    Current Context:
    Grade: ${context.grade}
    Subject: ${context.subject}
    Topic: ${context.topic}
    Curriculum: CBSE (Central Board of Secondary Education, India)

    Your goals:
    1. Provide clear, simple explanations appropriate for ${context.grade}.
    2. Use CBSE curriculum standards and examples (e.g., using Indian context for math/history).
    3. Encourage the student and ask follow-up questions to check understanding.
    4. If the student asks for practice, provide 1-2 short problems.
    5. Keep responses concise and use Markdown for formatting (bolding, lists, etc.).
    6. If the student asks something inappropriate for school, politely redirect them.

    Format your responses with a friendly persona.`;

    try {
        const chatCompletion = await groq.chat.completions.create({
            messages: [
                { role: 'system', content: systemPrompt },
                ...history.slice(-5).map((msg: any) => ({ role: msg.role as any, content: msg.content })),
                { role: 'user', content: message }
            ],
            model: 'llama-3.3-70b-versatile',
            temperature: 0.7,
            max_completion_tokens: 1024,
        });

        return chatCompletion.choices[0]?.message?.content || "I'm having trouble responding right now.";
    } catch (error) {
        console.error('[AI] Tutor error:', error);
        return "I'm sorry, I'm having a bit of trouble connecting to my brain right now. Can you try asking that again?";
    }
};

export const getEducationalTrends = async () => {
    const prompt = "Act as an educational technology researcher. Provide 3 latest global educational trends for 2024-2025. For each trend, provide a title and a 2-sentence explanation. Return as Markdown.";
    return callGroq(prompt);
};

export const getSchoolPoliciesInfo = async () => {
    const prompt = "Provide a summary of modern inclusive school policies and digital safety standards for 2024. Include 3 key areas of focus. Return as Markdown.";
    return callGroq(prompt);
};

export const expandIdeaAssistant = async (idea: string) => {
    const prompt = `You are a creative teaching assistant. I have this raw teaching idea: "${idea}". 
    Please expand it into a brief implementation plan with 3 steps and 1 potential challenge. Keep it concise. Return as Markdown grains (not too long).`;
    return callGroq(prompt);
};

async function callGroq(prompt: string): Promise<string> {
    try {
        console.log('[AI] Calling Groq API...');
        const chatCompletion = await groq.chat.completions.create({
            messages: [
                {
                    role: "user",
                    content: prompt
                }
            ],
            model: "llama-3.3-70b-versatile",
            temperature: 0.7,
            max_completion_tokens: 2048,
            top_p: 1,
            stream: false,
        });

        const response = chatCompletion.choices[0]?.message?.content || "AI response was empty.";
        console.log('[AI] Groq response received successfully');
        return response;
    } catch (error: any) {
        console.error('[AI] Groq API Error:', error.message || error);
        return "AI Assistant is currently unavailable. Please check your API key and internet connection.";
    }
}

// New function for custom AI queries
export const askCustomQuestion = async (question: string): Promise<string> => {
    const prompt = `You are an educational AI assistant helping teachers. Answer this question concisely and professionally: ${question}`;
    return callGroq(prompt);
};

// ============================================
// SCHEDULE AI FUNCTIONS
// ============================================

export interface ScheduleEvent {
    id: string;
    title: string;
    start: string;
    end: string;
    category: string;
    color: string;
    meetingLink?: string;
    description?: string;
}

// Main AI agent for schedule management
export const scheduleAIAgent = async (query: string, currentEvents: ScheduleEvent[]): Promise<{
    action: 'add' | 'edit' | 'delete' | 'query' | 'error';
    response: string;
    event?: Partial<ScheduleEvent>;
    eventId?: string;
}> => {
    try {
        console.log('[AI Schedule] Processing query:', query);

        const eventsContext = currentEvents.map(e => `- ${e.title} on ${new Date(e.start).toLocaleDateString()} at ${new Date(e.start).toLocaleTimeString()}`).join('\n');

        const prompt = `You are a scheduling AI assistant. Current events:
${eventsContext || 'No events scheduled'}

User request: "${query}"

Analyze the request and respond with a JSON object with this structure:
{
  "action": "add" | "edit" | "delete" | "query",
  "response": "Natural language response to user",
  "event": {
    "title": "Event title",
    "start": "ISO date string",
    "end": "ISO date string",
    "category": "lecture" | "meeting" | "holiday" | "school-event" | "personal",
    "description": "Optional description"
  },
  "eventId": "ID if editing/deleting"
}

For "add" actions, calculate appropriate start/end times.
For "query" actions, provide helpful information.
For "delete" actions, identify which event to delete.
Return ONLY valid JSON, no markdown.`;

        const chatCompletion = await groq.chat.completions.create({
            messages: [{ role: "user", content: prompt }],
            model: "llama-3.1-8b-instant",
            temperature: 0.3,
            max_completion_tokens: 1024,
            top_p: 1,
            stream: false,
        });

        const responseText = chatCompletion.choices[0]?.message?.content || "{}";
        console.log('[AI Schedule] Raw response:', responseText);

        // Try to extract JSON from response
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        const result = jsonMatch ? JSON.parse(jsonMatch[0]) : { action: 'error', response: 'Failed to parse AI response' };

        console.log('[AI Schedule] Parsed result:', result);
        return result;
    } catch (error: any) {
        console.error('[AI Schedule] Error:', error);
        return {
            action: 'error',
            response: 'AI Assistant encountered an error. Please try rephrasing your request.'
        };
    }
};

// Suggest optimal meeting times
export const suggestMeetingTimes = async (description: string, duration: number = 60): Promise<string> => {
    const prompt = `Suggest 3 optimal times for a ${duration}-minute ${description} meeting this week. Consider typical school hours (9 AM - 4 PM). Return as markdown list.`;

    try {
        const chatCompletion = await groq.chat.completions.create({
            messages: [{ role: "user", content: prompt }],
            model: "llama-3.1-8b-instant",
            temperature: 0.7,
            max_completion_tokens: 512,
            stream: false,
        });

        return chatCompletion.choices[0]?.message?.content || "Unable to suggest times.";
    } catch (error) {
        console.error('[AI] Meeting suggestion error:', error);
        return "Unable to suggest meeting times at this moment.";
    }
};

// Get upcoming holidays and school events
export const getUpcomingHolidays = async (): Promise<string> => {
    const prompt = `List important school holidays and events for the next 3 months (starting from December 2024). Include dates and brief descriptions. Format as markdown.`;

    try {
        const chatCompletion = await groq.chat.completions.create({
            messages: [{ role: "user", content: prompt }],
            model: "llama-3.1-8b-instant",
            temperature: 0.5,
            max_completion_tokens: 1024,
            stream: false,
        });

        return chatCompletion.choices[0]?.message?.content || "No upcoming holidays found.";
    } catch (error) {
        console.error('[AI] Holiday fetch error:', error);
        return "Unable to fetch holiday information.";
    }
};

// Analyze schedule for conflicts
export const analyzeScheduleConflicts = async (events: ScheduleEvent[]): Promise<string> => {
    const eventsText = events.map(e =>
        `${e.title}: ${new Date(e.start).toLocaleString()} - ${new Date(e.end).toLocaleString()}`
    ).join('\n');

    const prompt = `Analyze these scheduled events for conflicts or issues:
${eventsText}

Identify any overlapping events, back-to-back scheduling issues, or recommendations. Return as markdown.`;

    try {
        const chatCompletion = await groq.chat.completions.create({
            messages: [{ role: "user", content: prompt }],
            model: "llama-3.1-8b-instant",
            temperature: 0.3,
            max_completion_tokens: 1024,
            stream: false,
        });

        return chatCompletion.choices[0]?.message?.content || "No conflicts detected.";
    } catch (error) {
        console.error('[AI] Conflict analysis error:', error);
        return "Unable to analyze schedule conflicts.";
    }
};
