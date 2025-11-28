import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { crypto } from "https://deno.land/std@0.177.0/crypto/mod.ts";

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

    const formData = await req.formData();
    const file = formData.get('file') as File;
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const evidenceType = formData.get('evidenceType') as string;
    const metadata = formData.get('metadata') ? JSON.parse(formData.get('metadata') as string) : {};

    if (!file || !title || !evidenceType) {
      throw new Error('Missing required fields');
    }

    // Read file as ArrayBuffer for hashing
    const fileBuffer = await file.arrayBuffer();
    const fileData = new Uint8Array(fileBuffer);

    // Generate SHA-256 hash
    const hashBuffer = await crypto.subtle.digest('SHA-256', fileData);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const fileHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    console.log('Generated file hash:', fileHash);

    // Upload file to storage
    const fileName = `${user.id}/${Date.now()}-${file.name}`;
    const { data: uploadData, error: uploadError } = await supabaseClient.storage
      .from('evidence-files')
      .upload(fileName, fileData, {
        contentType: file.type,
        cacheControl: '3600',
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      throw uploadError;
    }

    // Get public URL
    const { data: { publicUrl } } = supabaseClient.storage
      .from('evidence-files')
      .getPublicUrl(fileName);

    // Create evidence record with blockchain timestamp simulation
    const { data: evidenceData, error: evidenceError } = await supabaseClient
      .from('evidence_items')
      .insert({
        user_id: user.id,
        title,
        description,
        evidence_type: evidenceType,
        file_url: publicUrl,
        file_hash: fileHash,
        blockchain_timestamp: new Date().toISOString(),
        metadata: {
          ...metadata,
          file_size: file.size,
          file_type: file.type,
          original_name: file.name,
        },
        status: 'verified'
      })
      .select()
      .single();

    if (evidenceError) {
      console.error('Database error:', evidenceError);
      throw evidenceError;
    }

    console.log('Evidence uploaded successfully:', evidenceData.id);

    return new Response(
      JSON.stringify({ 
        success: true, 
        evidence: evidenceData,
        hash: fileHash 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error in upload-evidence:', error);
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
