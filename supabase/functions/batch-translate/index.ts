import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    const { batch_size = 20, lang = "en" } = await req.json();

    const langColumn = `description_${lang}`;

    // Find tools that haven't been translated yet for this language
    const { data: tools, error } = await supabase
      .from("ai_tools")
      .select("id, name, description")
      .is(langColumn, null)
      .not("description", "is", null)
      .limit(batch_size);

    if (error) throw error;
    if (!tools || tools.length === 0) {
      return new Response(
        JSON.stringify({ success: true, message: `No more tools to translate for ${lang}`, translated: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const langNames: Record<string, string> = {
      en: "English",
      ja: "Japanese",
      ko: "Korean",
    };

    const descriptions = tools.map((t) => `[ID:${t.id}] ${t.name}: ${t.description}`).join("\n");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${lovableApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `You are a professional translator. Translate the following AI tool descriptions from Chinese to ${langNames[lang]}. Keep brand/product names in their original form (e.g. ChatGPT, Midjourney). Return ONLY a JSON array with objects having "id" and "description" fields. No markdown, no explanation.`,
          },
          {
            role: "user",
            content: descriptions,
          },
        ],
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("AI API error:", errText);
      throw new Error(`AI API error: ${response.status}`);
    }

    const aiData = await response.json();
    let content = aiData.choices?.[0]?.message?.content || "";

    // Clean markdown code blocks if present
    content = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

    let translations: Array<{ id: string; description: string }>;
    try {
      translations = JSON.parse(content);
    } catch {
      console.error("Failed to parse AI response:", content);
      throw new Error("Failed to parse translation response");
    }

    // Update each tool with its translation
    let updated = 0;
    for (const t of translations) {
      const updateData: Record<string, string> = {};
      updateData[langColumn] = t.description;

      const { error: updateError } = await supabase
        .from("ai_tools")
        .update(updateData)
        .eq("id", t.id);

      if (!updateError) updated++;
      else console.error(`Failed to update ${t.id}:`, updateError);
    }

    const { count } = await supabase
      .from("ai_tools")
      .select("id", { count: "exact", head: true })
      .is(langColumn, null)
      .not("description", "is", null);

    return new Response(
      JSON.stringify({
        success: true,
        translated: updated,
        remaining: count || 0,
        lang,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Translation error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : String(error) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
