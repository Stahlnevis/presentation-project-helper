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
    const url = new URL(req.url);
    const linkCode = url.searchParams.get('code');

    if (!linkCode) {
      return new Response('Invalid tracking link', { status: 400 });
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Find tracking link
    const { data: trackingLink, error: linkError } = await supabaseClient
      .from('tracking_links')
      .select('*')
      .eq('link_code', linkCode)
      .eq('is_active', true)
      .single();

    if (linkError || !trackingLink) {
      console.error('Tracking link not found:', linkCode);
      return new Response('Link not found or inactive', { status: 404 });
    }

    console.log('Capturing data for tracking link:', trackingLink.id);

    // Get IP and user agent
    const ipAddress = req.headers.get('x-forwarded-for') || 
                     req.headers.get('x-real-ip') || 
                     'unknown';
    const userAgent = req.headers.get('user-agent') || 'unknown';

    // Parse device info from user agent
    const deviceInfo = {
      user_agent: userAgent,
      browser: getBrowserInfo(userAgent),
      os: getOSInfo(userAgent),
      device_type: getDeviceType(userAgent),
    };

    // Generate browser fingerprint
    const fingerprintData = [ipAddress, userAgent].join('|');
    const encoder = new TextEncoder();
    const data = encoder.encode(fingerprintData);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const browserFingerprint = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    // Try to get geolocation from IP (using ipapi.co)
    let geolocation = null;
    try {
      if (ipAddress !== 'unknown' && ipAddress !== '127.0.0.1') {
        const geoResponse = await fetch(`https://ipapi.co/${ipAddress}/json/`);
        if (geoResponse.ok) {
          geolocation = await geoResponse.json();
        }
      }
    } catch (error) {
      console.error('Geolocation lookup failed:', error);
      geolocation = { error: 'Geolocation unavailable' };
    }

    // Store capture
    const { data: captureData, error: captureError } = await supabaseClient
      .from('geo_captures')
      .insert({
        tracking_link_id: trackingLink.id,
        ip_address: ipAddress,
        geolocation,
        device_info: deviceInfo,
        browser_fingerprint: browserFingerprint,
      })
      .select()
      .single();

    if (captureError) {
      console.error('Capture error:', captureError);
    } else {
      console.log('Capture recorded:', captureData.id);
      
      // Update capture count
      await supabaseClient
        .from('tracking_links')
        .update({ captures_count: trackingLink.captures_count + 1 })
        .eq('id', trackingLink.id);
    }

    // Redirect to target URL or show success message
    if (trackingLink.target_url) {
      return Response.redirect(trackingLink.target_url, 302);
    } else {
      return new Response(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Link Captured</title>
            <style>
              body {
                font-family: system-ui;
                display: flex;
                align-items: center;
                justify-center;
                min-height: 100vh;
                margin: 0;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              }
              .card {
                background: white;
                padding: 3rem;
                border-radius: 1rem;
                box-shadow: 0 20px 60px rgba(0,0,0,0.3);
                text-align: center;
                max-width: 400px;
              }
              h1 { color: #667eea; margin: 0 0 1rem 0; }
              p { color: #666; }
            </style>
          </head>
          <body>
            <div class="card">
              <h1>✓ Link Accessed</h1>
              <p>This link is being monitored for security purposes.</p>
            </div>
          </body>
        </html>
      `, {
        headers: { 'Content-Type': 'text/html' },
        status: 200,
      });
    }

  } catch (error) {
    console.error('Error in capture-geo:', error);
    return new Response('Internal error', { status: 500 });
  }
});

function getBrowserInfo(userAgent: string): string {
  if (userAgent.includes('Chrome')) return 'Chrome';
  if (userAgent.includes('Firefox')) return 'Firefox';
  if (userAgent.includes('Safari')) return 'Safari';
  if (userAgent.includes('Edge')) return 'Edge';
  return 'Unknown';
}

function getOSInfo(userAgent: string): string {
  if (userAgent.includes('Windows')) return 'Windows';
  if (userAgent.includes('Mac')) return 'macOS';
  if (userAgent.includes('Linux')) return 'Linux';
  if (userAgent.includes('Android')) return 'Android';
  if (userAgent.includes('iOS')) return 'iOS';
  return 'Unknown';
}

function getDeviceType(userAgent: string): string {
  if (userAgent.includes('Mobile')) return 'Mobile';
  if (userAgent.includes('Tablet')) return 'Tablet';
  return 'Desktop';
}
