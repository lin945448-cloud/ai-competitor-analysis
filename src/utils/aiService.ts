export const fetchAIInsight = async (summaryData: any) => {
  // 注意：这个 Key 我们之后会在 Vercel 的后台设置，非常安全
  const apiKey = import.meta.env.VITE_DEEPSEEK_KEY; 
  
  const systemPrompt = `你是一个顶级品牌分析专家。基于以下竞品投放统计数据：${JSON.stringify(summaryData)}
  请深度洞察并输出：
  1. 达人采购策略：ROI/曝光/铺量型判定及证据。
  2. 内容运营：视频比例、关键词、爆款特征。
  3. 人群策略：基于标签推断目标人群（学生/白领/宝妈等）。
  4. 预算ROI：单互动成本CPE分析。
  5. 决策意见：具体可执行的建议。
  要求：多用数据说话，语言专业，建议具体。`;

  try {
    const response = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [{ role: "system", content: systemPrompt }, { role: "user", content: "请生成洞察报告" }],
        stream: false
      })
    });
    const result = await response.json();
    return result.choices[0].message.content;
  } catch (error) {
    return "AI 洞察生成失败，请检查 API Key 配置。";
  }
};
