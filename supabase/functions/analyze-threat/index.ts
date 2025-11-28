import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Get the current user
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    
    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    const { platform, harasserUsername, harasserProfileUrl, incidentDescription, incidentDate, metadata } = await req.json();

    if (!platform || !incidentDescription || !incidentDate) {
      throw new Error('Missing required fields');
    }

    console.log('Analyzing threat incident...');

    // Use Lovable AI to analyze patterns
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const aiPrompt = `Analyze this cyberbullying/harassment incident and provide:
1. Severity level (low, medium, high, critical)
2. Risk score (0-100)
3. Behavioral patterns detected
4. Recommended actions

Incident details:
Platform: ${platform}
Username: ${harasserUsername || 'Anonymous'}
Description: ${incidentDescription}
Date: ${incidentDate}

Provide a structured analysis focusing on threat level and pattern recognition.`;

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
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
            content: 'You are a cybersecurity expert specializing in threat analysis for online harassment and GBV cases. Provide clear, actionable analysis.'
          },
          { role: 'user', content: aiPrompt }
        ],
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI gateway error:', aiResponse.status, errorText);
      throw new Error('AI analysis failed');
    }

    const aiData = await aiResponse.json();
    const analysis = aiData.choices[0].message.content;

    console.log('AI Analysis completed');

    // Extract severity from analysis (simple keyword matching)
    let severityLevel = 'medium';
    const lowerAnalysis = analysis.toLowerCase();
    if (lowerAnalysis.includes('critical') || lowerAnalysis.includes('severe')) {
      severityLevel = 'critical';
    } else if (lowerAnalysis.includes('high risk') || lowerAnalysis.includes('dangerous')) {
      severityLevel = 'high';
    } else if (lowerAnalysis.includes('low risk') || lowerAnalysis.includes('minor')) {
      severityLevel = 'low';
    }

    // Extract risk score (look for numbers between 0-100)
    const scoreMatch = analysis.match(/\b(\d{1,3})\b/);
    const riskScore = scoreMatch ? Math.min(parseInt(scoreMatch[1]), 100) : 50;

    // Create fingerprint for linking similar attackers
    const fingerprintData = [
      platform,
      harasserUsername?.toLowerCase() || '',
      metadata?.writing_style || '',
      metadata?.time_zone || ''
    ].join('|');
    
    const encoder = new TextEncoder();
    const data = encoder.encode(fingerprintData);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const attackerFingerprint = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    // Check for existing attacker profile
    let linkedAttackerId = null;
    const { data: existingAttacker } = await supabaseClient
      .from('linked_attackers')
      .select('*')
      .eq('attacker_fingerprint', attackerFingerprint)
      .single();

    if (existingAttacker) {
      // Update existing attacker
      linkedAttackerId = existingAttacker.id;
      await supabaseClient
        .from('linked_attackers')
        .update({
          incident_count: existingAttacker.incident_count + 1,
          risk_score: Math.max(existingAttacker.risk_score, riskScore),
          last_seen: new Date().toISOString(),
          known_aliases: [...new Set([...existingAttacker.known_aliases, harasserUsername].filter(Boolean))],
          platforms: [...new Set([...existingAttacker.platforms, platform])],
        })
        .eq('id', existingAttacker.id);
      
      console.log('Updated existing attacker profile:', linkedAttackerId);
    } else if (harasserUsername) {
      // Create new attacker profile
      const { data: newAttacker } = await supabaseClient
        .from('linked_attackers')
        .insert({
          attacker_fingerprint: attackerFingerprint,
          known_aliases: [harasserUsername],
          platforms: [platform],
          incident_count: 1,
          risk_score: riskScore,
          behavioral_patterns: { analysis },
        })
        .select()
        .single();
      
      linkedAttackerId = newAttacker?.id;
      console.log('Created new attacker profile:', linkedAttackerId);
    }

    // Create threat incident record
    const { data: incidentData, error: incidentError } = await supabaseClient
      .from('threat_incidents')
      .insert({
        reporter_id: user.id,
        platform,
        harasser_username: harasserUsername,
        harasser_profile_url: harasserProfileUrl,
        incident_description: incidentDescription,
        incident_date: incidentDate,
        severity_level: severityLevel,
        metadata: {
          ...metadata,
          ai_analysis: analysis,
          risk_score: riskScore,
        },
        linked_attacker_id: linkedAttackerId,
      })
      .select()
      .single();

    if (incidentError) {
      console.error('Database error:', incidentError);
      throw incidentError;
    }

    console.log('Threat incident recorded:', incidentData.id);

    return new Response(
      JSON.stringify({ 
        success: true, 
        incident: incidentData,
        analysis,
        severityLevel,
        riskScore,
        isRepeatOffender: !!existingAttacker,
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error in analyze-threat:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    );
  }
});
