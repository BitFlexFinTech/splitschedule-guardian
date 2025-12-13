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
    const { message } = await req.json();
    
    if (!message || typeof message !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Message is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      // Fallback to simple keyword analysis if API key not available
      const negativeWords = ['hate', 'angry', 'stupid', 'idiot', 'never', 'always', 'fault', 'blame', 'terrible', 'worst'];
      const positiveWords = ['thank', 'please', 'appreciate', 'understand', 'agree', 'help', 'support', 'cooperate', 'together'];
      
      const lowerMessage = message.toLowerCase();
      const negativeCount = negativeWords.filter(word => lowerMessage.includes(word)).length;
      const positiveCount = positiveWords.filter(word => lowerMessage.includes(word)).length;
      
      let score: number;
      let label: string;
      
      if (negativeCount > positiveCount + 1) {
        score = 0.3;
        label = 'negative';
      } else if (positiveCount > negativeCount) {
        score = 0.8;
        label = 'positive';
      } else {
        score = 0.5;
        label = 'neutral';
      }
      
      return new Response(
        JSON.stringify({ score, label, warning: negativeCount > 2 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Use Lovable AI for advanced tone analysis
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
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
            content: `You are a tone analyzer for co-parenting communication. Analyze the tone of messages and respond with JSON only.
            
Rate the message tone on these criteria:
- score: 0.0 (very hostile) to 1.0 (very positive/constructive)
- label: "negative", "neutral", or "positive"
- warning: true if the message contains hostile, accusatory, or inflammatory language
- suggestion: Brief suggestion to improve tone if needed (null if tone is good)

Respond ONLY with valid JSON, no other text.`
          },
          {
            role: 'user',
            content: `Analyze this message: "${message}"`
          }
        ],
      }),
    });

    if (!response.ok) {
      throw new Error('AI gateway request failed');
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    // Parse the JSON response
    try {
      const analysis = JSON.parse(content);
      return new Response(
        JSON.stringify(analysis),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch {
      // Fallback if AI response isn't valid JSON
      return new Response(
        JSON.stringify({ score: 0.5, label: 'neutral', warning: false }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

  } catch (error) {
    console.error('Tone analyzer error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
