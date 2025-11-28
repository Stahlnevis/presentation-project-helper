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

    const { title, description, targetUrl } = await req.json();

    if (!title) {
      throw new Error('Title is required');
    }

    // Generate unique link code
    const linkCode = generateLinkCode();

    // Create tracking link
    const { data: trackingData, error: trackingError } = await supabaseClient
      .from('tracking_links')
      .insert({
        user_id: user.id,
        link_code: linkCode,
        title,
        description,
        target_url: targetUrl || null,
      })
      .select()
      .single();

    if (trackingError) {
      console.error('Database error:', trackingError);
      throw trackingError;
    }

    // Generate full URL
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const trackingUrl = `${supabaseUrl}/functions/v1/capture-geo?code=${linkCode}`;

    console.log('Tracking link created:', trackingData.id);

    return new Response(
      JSON.stringify({ 
        success: true, 
        tracking: trackingData,
        trackingUrl,
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error in create-tracking-link:', error);
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

function generateLinkCode(): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 12; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}
