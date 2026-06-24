/* global Deno */
import { createClientFromRequest } from "npm:@base44/sdk";

Deno.serve(async (req) => {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "*",
    "Content-Type": "application/json",
  };

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const base44 = createClientFromRequest(req);
    const url = new URL(req.url);
    const apiKey = url.searchParams.get("apiKey") || req.headers.get("x-api-key");

    if (!apiKey) {
      return Response.json(
        { success: false, error: "API key required. Pass ?apiKey=YOUR_KEY or x-api-key header." },
        { status: 401, headers: corsHeaders }
      );
    }

    // Validate the key
    const keys = await base44.asServiceRole.entities.ApiKey.filter({ key: apiKey, active: true });
    if (!keys || keys.length === 0) {
      return Response.json(
        { success: false, error: "Invalid or inactive API key" },
        { status: 403, headers: corsHeaders }
      );
    }

    // Return all movies
    const movies = await base44.asServiceRole.entities.Movie.list("-created_date", 5000);

    return Response.json(
      { success: true, count: movies.length, movies },
      { headers: corsHeaders }
    );
  } catch (err) {
    return Response.json(
      { success: false, error: "Server error", details: err.message },
      { status: 500, headers: corsHeaders }
    );
  }
});