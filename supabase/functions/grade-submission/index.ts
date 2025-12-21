import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Question {
  id: string;
  question_text: string;
  question_type: string;
  correct_answer: string | null;
  options: { text: string; isCorrect: boolean }[];
  marks: number;
}

interface SubmissionData {
  questions: Question[];
  answers: Record<string, string>;
  rubric?: Record<string, any>;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { questions, answers, rubric }: SubmissionData = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const feedback: Record<string, { score: number; feedback: string }> = {};
    let totalScore = 0;
    let maxScore = 0;

    // Grade MCQ and true/false questions automatically
    const autoGradeableTypes = ['mcq', 'true_false'];
    const aiGradeableQuestions: Question[] = [];

    for (const question of questions) {
      maxScore += question.marks;
      const studentAnswer = answers[question.id] || '';

      if (autoGradeableTypes.includes(question.question_type)) {
        // Auto-grade MCQ and true/false
        let isCorrect = false;

        if (question.question_type === 'mcq') {
          const correctOption = question.options?.find((o) => o.isCorrect);
          isCorrect = correctOption?.text === studentAnswer;
        } else {
          isCorrect = question.correct_answer?.toLowerCase() === studentAnswer.toLowerCase();
        }

        const score = isCorrect ? question.marks : 0;
        totalScore += score;

        feedback[question.id] = {
          score,
          feedback: isCorrect
            ? 'Correct! Well done.'
            : `Incorrect. The correct answer is: ${question.correct_answer || question.options?.find((o) => o.isCorrect)?.text || 'N/A'}`,
        };
      } else {
        // Queue for AI grading
        aiGradeableQuestions.push(question);
      }
    }

    // Use AI to grade open-ended questions
    if (aiGradeableQuestions.length > 0) {
      const systemPrompt = `You are an expert educational grader. Grade the following student answers based on the rubric and question requirements.
      
      For each question, provide:
      1. A score (0 to max marks)
      2. Constructive feedback explaining the grade
      
      Return a JSON object with this structure:
      {
        "grades": {
          "question_id": { "score": number, "feedback": "detailed feedback" }
        }
      }
      
      Be fair but encouraging. Highlight what the student did well and areas for improvement.`;

      const questionsContext = aiGradeableQuestions.map((q) => ({
        id: q.id,
        question: q.question_text,
        type: q.question_type,
        maxMarks: q.marks,
        expectedAnswer: q.correct_answer,
        studentAnswer: answers[q.id] || 'No answer provided',
      }));

      const userPrompt = `Grade these student answers:
      
      ${JSON.stringify(questionsContext, null, 2)}
      
      ${rubric ? `Rubric: ${JSON.stringify(rubric)}` : ''}
      
      Return ONLY valid JSON.`;

      console.log('Grading with AI:', userPrompt);

      const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${LOVABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
        }),
      });

      if (!response.ok) {
        console.error('AI grading failed, using fallback');
        // Fallback: give partial credit
        for (const question of aiGradeableQuestions) {
          const hasAnswer = answers[question.id]?.trim();
          const score = hasAnswer ? Math.floor(question.marks * 0.5) : 0;
          totalScore += score;
          feedback[question.id] = {
            score,
            feedback: hasAnswer
              ? 'Your answer has been received. Manual review pending.'
              : 'No answer provided.',
          };
        }
      } else {
        const data = await response.json();
        const content = data.choices?.[0]?.message?.content;

        try {
          const cleanContent = content.replace(/```json\n?|\n?```/g, '').trim();
          const aiGrades = JSON.parse(cleanContent);

          for (const question of aiGradeableQuestions) {
            const aiGrade = aiGrades.grades?.[question.id];
            if (aiGrade) {
              const score = Math.min(Math.max(0, aiGrade.score), question.marks);
              totalScore += score;
              feedback[question.id] = {
                score,
                feedback: aiGrade.feedback || 'Graded by AI.',
              };
            } else {
              feedback[question.id] = {
                score: 0,
                feedback: 'Could not grade this answer.',
              };
            }
          }
        } catch (parseError) {
          console.error('Failed to parse AI grades:', parseError);
          // Fallback
          for (const question of aiGradeableQuestions) {
            feedback[question.id] = {
              score: 0,
              feedback: 'Grading error. Manual review required.',
            };
          }
        }
      }
    }

    const percentage = maxScore > 0 ? (totalScore / maxScore) * 100 : 0;
    const gradeLetter = getGradeLetter(percentage);

    // Generate overall AI feedback
    let aiFeedback = '';
    try {
      const summaryResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${LOVABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages: [
            {
              role: 'system',
              content: 'You are a supportive teacher providing feedback. Keep it brief (2-3 sentences), encouraging, and actionable.',
            },
            {
              role: 'user',
              content: `Student scored ${percentage.toFixed(1)}% (${totalScore}/${maxScore}). Provide brief overall feedback.`,
            },
          ],
        }),
      });

      if (summaryResponse.ok) {
        const summaryData = await summaryResponse.json();
        aiFeedback = summaryData.choices?.[0]?.message?.content || '';
      }
    } catch {
      aiFeedback = percentage >= 80
        ? 'Excellent work! Keep up the great performance.'
        : percentage >= 60
        ? 'Good effort! Review the areas where you lost marks.'
        : 'Keep practicing! Focus on understanding the concepts better.';
    }

    return new Response(
      JSON.stringify({
        totalScore,
        maxScore,
        percentage,
        gradeLetter,
        feedback,
        aiFeedback,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: unknown) {
    console.error('Error in grade-submission:', error);
    const message = error instanceof Error ? error.message : 'Failed to grade submission';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function getGradeLetter(percentage: number): string {
  if (percentage >= 90) return 'A+';
  if (percentage >= 80) return 'A';
  if (percentage >= 70) return 'B+';
  if (percentage >= 60) return 'B';
  if (percentage >= 50) return 'C';
  if (percentage >= 40) return 'D';
  return 'F';
}
