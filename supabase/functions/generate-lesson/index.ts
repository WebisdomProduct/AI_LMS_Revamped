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
    const { prompt, context } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const systemPrompt = `You are an expert educational curriculum designer specializing in CBSE curriculum. 
Create comprehensive, engaging lesson plans that are age-appropriate and aligned with learning objectives.

When creating a lesson plan, include:
1. **Learning Objectives** - Clear, measurable outcomes
2. **Materials Needed** - List of required resources
3. **Introduction/Hook** (5-10 min) - Engaging activity to capture attention
4. **Main Lesson Content** (20-30 min) - Core teaching with examples
5. **Guided Practice** (10-15 min) - Teacher-led practice activities
6. **Independent Practice** (10-15 min) - Student work activities
7. **Assessment** - How to check understanding
8. **Closure/Summary** (5 min) - Recap key points
9. **Differentiation** - Adaptations for different learners
10. **Extension Activities** - For advanced students

Context:
- Class: ${context.className}
- Grade: ${context.grade}
- Subject: ${context.subject}
- Topic: ${context.topic}

Format the lesson plan in clear markdown with headers and bullet points.`;

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
          { role: 'user', content: prompt }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'Usage limit reached. Please add credits.' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      throw new Error('Failed to generate lesson plan');
    }

    const data = await response.json();
    const lessonContent = data.choices?.[0]?.message?.content || '';

    return new Response(JSON.stringify({ content: lessonContent }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: unknown) {
    console.error('Error in generate-lesson:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
