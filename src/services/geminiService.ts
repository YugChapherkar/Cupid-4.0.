// Client-side helper that proxies requests to the Express server API

export const hasApiKey = async (): Promise<boolean> => {
  try {
    const res = await fetch('/api/gemini/status');
    const data = await res.json();
    return data.configReady;
  } catch(e) {
    return false;
  }
};

export const generateSessionSummary = async (transcript: string): Promise<string> => {
  try {
    const res = await fetch('/api/gemini/summary', {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ transcript })
    });
    const data = await res.json();
    return data.result;
  } catch (e) {
    return "Error generating summary.";
  }
};

export const generateDateItinerary = async (city: string, mood: string, budget: string): Promise<string> => {
  try {
    const res = await fetch('/api/gemini/itinerary', {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ city, mood, budget })
    });
    const data = await res.json();
    return data.result;
  } catch (e) {
    return "Error generating itinerary.";
  }
};

export const rewriteProposal = async (name: string, memory: string, message: string): Promise<string> => {
  try {
    const res = await fetch('/api/gemini/proposal', {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, memory, message })
    });
    const data = await res.json();
    return data.result;
  } catch (e) {
    return "Error generating proposal.";
  }
};

export const generateIcebreaker = async (topic: string): Promise<string> => {
  try {
    const res = await fetch('/api/gemini/icebreaker', {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topic })
    });
    const data = await res.json();
    return data.result;
  } catch (e) {
    return "What's your favorite programming language and why?";
  }
};