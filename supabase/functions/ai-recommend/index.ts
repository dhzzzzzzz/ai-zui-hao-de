import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AiTool {
  id: string;
  name: string;
  description: string | null;
  website_url: string;
  tags: string[] | null;
  category_id: string | null;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query } = await req.json();

    if (!query || typeof query !== "string" || query.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: "请输入您的需求描述" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Limit query length for security
    const sanitizedQuery = query.trim().slice(0, 500);

    console.log("AI Recommend - User query:", sanitizedQuery);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch all tools from database
    const { data: tools, error: dbError } = await supabase
      .from("ai_tools")
      .select("id, name, description, website_url, tags, category_id")
      .limit(500);

    if (dbError) {
      console.error("Database error:", dbError);
      throw new Error("获取工具数据失败");
    }

    if (!tools || tools.length === 0) {
      return new Response(
        JSON.stringify({ recommendations: [], message: "暂无可推荐的工具" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch categories for context
    const { data: categories } = await supabase
      .from("categories")
      .select("id, name, slug");

    const categoryMap = new Map(categories?.map(c => [c.id, c.name]) || []);

    // Build tool list for AI analysis
    const toolList = tools.map((tool: AiTool, index: number) => {
      const categoryName = tool.category_id ? categoryMap.get(tool.category_id) || "其他" : "其他";
      const tags = tool.tags?.join(", ") || "无标签";
      return `${index + 1}. ${tool.name} - ${tool.description || "无描述"} [分类: ${categoryName}] [标签: ${tags}]`;
    }).join("\n");

    // Call Lovable AI Gateway
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!lovableApiKey) {
      throw new Error("AI服务未配置");
    }

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${lovableApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content: `你是一个AI工具推荐专家。用户会描述他们的需求，你需要从提供的工具列表中选择最匹配的5-10个工具推荐给用户。

请严格按照以下JSON格式返回结果：
{
  "recommendations": [
    {
      "index": 工具在列表中的序号(从1开始),
      "reason": "简短说明为什么推荐这个工具(不超过30字)"
    }
  ],
  "summary": "一句话总结推荐理由(不超过50字)"
}

注意事项：
1. 只返回JSON，不要有其他文字
2. 推荐5-10个最相关的工具
3. 按相关性排序，最相关的放前面
4. 如果用户需求涉及多个方面，尽量覆盖不同类型
5. 考虑用户可能的隐含需求`
          },
          {
            role: "user",
            content: `用户需求：${sanitizedQuery}

以下是可选的AI工具列表：
${toolList}`
          }
        ],
        temperature: 0.3,
        max_tokens: 1000,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("AI Gateway error:", errorText);
      throw new Error("AI推荐服务暂时不可用");
    }

    const aiResult = await aiResponse.json();
    const aiContent = aiResult.choices?.[0]?.message?.content;

    if (!aiContent) {
      throw new Error("AI未返回有效结果");
    }

    console.log("AI Response:", aiContent);

    // Parse AI response
    let parsedResult;
    try {
      // Extract JSON from response (handle potential markdown code blocks)
      const jsonMatch = aiContent.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("无法解析AI响应");
      }
      parsedResult = JSON.parse(jsonMatch[0]);
    } catch (parseError) {
      console.error("Parse error:", parseError);
      throw new Error("AI响应格式错误");
    }

    // Map recommendations to actual tools
    const recommendations = [];
    for (const rec of parsedResult.recommendations || []) {
      const toolIndex = rec.index - 1;
      if (toolIndex >= 0 && toolIndex < tools.length) {
        const tool = tools[toolIndex];
        recommendations.push({
          ...tool,
          category_name: tool.category_id ? categoryMap.get(tool.category_id) : null,
          recommendation_reason: rec.reason,
        });
      }
    }

    console.log(`Returning ${recommendations.length} recommendations`);

    return new Response(
      JSON.stringify({
        recommendations,
        summary: parsedResult.summary || "根据您的需求，为您推荐以上AI工具",
        query: sanitizedQuery,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("AI Recommend error:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "推荐服务出错，请稍后重试",
        recommendations: []
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});