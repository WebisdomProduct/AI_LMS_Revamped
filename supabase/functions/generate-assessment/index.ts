import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, context, questionCount = 5, questionTypes = ['mcq'], difficulty = 'medium' } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const systemPrompt = `You are an expert educational assessment creator specializing in CBSE curriculum. 
    Create high-quality, pedagogically sound questions that accurately assess student understanding.
    
    Guidelines:
    - Create clear, unambiguous questions
    - For MCQs, include 4 options with one correct answer
    - Include helpful explanations for each question
    - Align questions with CBSE learning objectives
    - Vary question difficulty appropriately
    - Include hints where helpful for learning
    
    Return a JSON object with the following structure:
    {
      "questions": [
        {
          "question_text": "The question",
          "question_type": "mcq|short_answer|long_answer|true_false",
          "options": [{"text": "Option A", "isCorrect": true}, {"text": "Option B", "isCorrect": false}, ...],
          "correct_answer": "The correct answer text",
          "marks": 1,
          "hint": "A helpful hint",
          "explanation": "Why this is the correct answer"
        }
      ],
      "rubric": {
        "criteria": [
          {"name": "Accuracy", "weight": 40, "description": "Correctness of the answer"},
          {"name": "Understanding", "weight": 30, "description": "Demonstrates concept understanding"},
          {"name": "Application", "weight": 30, "description": "Applies concepts correctly"}
        ]
      }
    }`;

    const userPrompt = `Create ${questionCount} assessment questions for:
    Class: ${context.className}
    Grade: ${context.grade}
    Subject: ${context.subject}
    Topic: ${context.topic}
    Difficulty: ${difficulty}
    Question Types: ${questionTypes.join(', ')}
    
    Additional Instructions: ${prompt}
    
    Return ONLY valid JSON, no markdown or additional text.`;

    console.log('Generating assessment with prompt:', userPrompt);

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
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Payment required. Please add credits to your workspace.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('No content received from AI');
    }

    // Parse the JSON response
    let parsedContent;
    try {
      // Remove markdown code blocks if present
      const cleanContent = content.replace(/```json\n?|\n?```/g, '').trim();
      parsedContent = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error('Failed to parse AI response:', content);
      throw new Error('Failed to parse AI response as JSON');
    }

    console.log('Successfully generated assessment:', parsedContent);

    return new Response(
      JSON.stringify(parsedContent),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: unknown) {
    console.error('Error in generate-assessment:', error);
    const message = error instanceof Error ? error.message : 'Failed to generate assessment';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
