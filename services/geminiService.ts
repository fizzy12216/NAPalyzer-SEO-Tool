import { GoogleGenAI } from "@google/genai";
import { BusinessInfo, AnalysisResult } from "../types";

const SYSTEM_INSTRUCTION = `
You are a Local SEO & NAP Consistency Analysis Expert.

Your task is to:
1.  **SEARCH AGGRESSIVELY & FLEXIBLY**: Use Google Search to find the business listings.
    *   **Name Variations**: The business name might differ slightly across platforms (e.g., "Papa's Wish" vs "Papas Wish Fast Food" vs "Papa Wish"). You MUST search for variations.
    *   **Identification**: If a listing shares the same **Phone Number** or **Address** or **Website**, assume it IS the same business, even if the name is different. This is a "Name Mismatch" issue, not a missing profile.
    *   **Platforms to Check**:
        *   **Google Maps / Google Business Profile** (Primary)
        *   **Facebook** (Mandatory)
        *   **TikTok** (Mandatory if available)
        *   **Instagram**
        *   **Yelp, Yellow Pages, TripAdvisor** (if applicable)

2.  **EXTRACT**: Extract the Business Name, Address, and Phone Number (NAP) exactly as they appear on each platform.

3.  **ANALYZE**: Compare the data found against the "Official Business Info" (or the most common occurrence if official info is vague).
    *   Normalize phone numbers (e.g., +92 300 vs 0300) before marking as error.
    *   Ignore minor punctuation in addresses (e.g., "St." vs "Street").

4.  **SCORE**: Assign a NAP Consistency Score (0–100).
5.  **SUGGEST**: Generate specific fix instructions.
6.  **STRATEGIZE**: Provide strategic advice based on Google's 3 Local Ranking Factors.
7.  **COMPETITORS**: Identify 3 direct local competitors found in search results.
8.  **OPTIMIZE**: Create a "Master Profile" with the best possible data (Description, Keywords, Bio) that the user should use consistently everywhere.
9.  **OUTPUT**: Return the result in the specified JSON format.

You must:
-   Be accurate.
-   **Social Media Focus**: If you don't initially see Facebook or TikTok in the broad search, assume they might exist and look for queries like "[Business Name] [City] Facebook" or "[Business Name] [City] TikTok". Try variations of the name.
-   If a platform is truly not found after searching, mark it as "Not Found" or "Missing Profile" in the analysis to alert the user.
-   Return valid JSON.
`;

export const analyzeNAPConsistency = async (
  businessInfo: BusinessInfo
): Promise<AnalysisResult> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key is missing. Please set process.env.API_KEY.");
  }

  const ai = new GoogleGenAI({ apiKey });

  const prompt = `
I need you to perform a Local SEO Audit for this business:

**Target Business:**
*   Name: ${businessInfo.businessName} (Search for variations of this name too)
*   City: ${businessInfo.city}
*   Country: ${businessInfo.country}
*   Website: ${businessInfo.website || "Not provided (Search for it)"}

**Instructions:**
1.  Use the 'googleSearch' tool to find this business online.
2.  **MANDATORY**: You MUST explicitly check for **Facebook** and **TikTok** profiles.
3.  **MATCHING RULE**: If you find a profile with a slightly different name (e.g. spelling, extra words, abbreviations) but the same phone number, address, or distinct location, **COUNT IT**. Do not ignore it. We need to detect these name variations so we can fix them.
4.  Find its listings on major platforms (Google, Facebook, Instagram, TikTok, LinkedIn, etc.).
5.  Analyze the NAP (Name, Address, Phone) consistency.
6.  Derive strategic suggestions based on **Relevance, Proximity, and Prominence**.
7.  Identify 3 **Competitors**.
8.  Generate an **Optimized Profile** (Bio, Description, Keywords).
9.  **CRITICAL**: You must output the result as a VALID JSON string inside a markdown code block (e.g., \`\`\`json ... \`\`\`).

**JSON Structure to Follow:**
{
  "nap_consistency_score": number,
  "overall_status": "Critical" | "Needs Attention" | "Healthy",
  "summary": {
    "total_platforms": number,
    "healthy": number,
    "needs_attention": number,
    "critical": number
  },
  "platform_analysis": [
    {
      "platform": "String (e.g., Google Maps, Facebook, TikTok)",
      "normalized_data": {
        "name": "String (extracted name)",
        "address": "String (extracted address)",
        "phone": "String (extracted phone)"
      },
      "issues": [
        {
          "type": "String",
          "severity": "Critical" | "Needs Attention" | "Healthy",
          "description": "String"
        }
      ],
      "fix_suggestions": [
        {
          "step": number,
          "action": "String",
          "location": "String"
        }
      ],
      "status": "Critical" | "Needs Attention" | "Healthy"
    }
  ],
  "common_issues_detected": ["String"],
  "local_seo_impact": {
    "ranking_risk": "String",
    "trust_signal": "String",
    "map_visibility": "String"
  },
  "recommended_priority_actions": ["String"],
  "google_ranking_factors": {
    "relevance": ["String"],
    "proximity": ["String"],
    "prominence": ["String"]
  },
  "competitors": [
    {
      "name": "String",
      "strength": "String",
      "weakness": "String"
    }
  ],
  "optimized_profile": {
    "business_name": "String (Standardized Name)",
    "tagline": "String (Catchy short tagline)",
    "short_description": "String (For Social Bios - under 160 chars)",
    "long_description": "String (For About Us / GBP - SEO rich)",
    "primary_category": "String (Best GBP Category)",
    "target_keywords": ["String", "String", "String"]
  }
}
`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        // responseSchema and responseMimeType are NOT allowed when using tools: [{googleSearch: {}}]
        tools: [{ googleSearch: {} }],
      },
    });

    // 1. Extract JSON from the text response
    const text = response.text || "";
    let parsedResult: AnalysisResult;

    try {
      // Regex to find JSON block
      const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/```\n([\s\S]*?)\n```/);
      const jsonString = jsonMatch ? jsonMatch[1] : text;
      // Clean up potential markdown residue if regex failed but it's still somewhat messy
      const cleanJsonString = jsonString.trim().replace(/^```json/, '').replace(/```$/, '');
      
      parsedResult = JSON.parse(cleanJsonString);
    } catch (e) {
      console.error("Failed to parse JSON from Gemini response:", text);
      throw new Error("AI analysis failed to generate valid structured data. Please try again.");
    }

    // 2. Extract Grounding Metadata (Source URLs)
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const groundingUrls = groundingChunks
      .map((chunk) => chunk.web?.uri)
      .filter((uri): uri is string => !!uri); // Filter out undefined

    // Remove duplicates
    parsedResult.grounding_urls = Array.from(new Set(groundingUrls));

    return parsedResult;

  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw error;
  }
};