'use server';

// const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

export type Citation = {
  document_id: string;
  source: string;
  text: string;
  score: number;
};

export type ChatResponse = {
  answer: string;
  citations: Citation[];
};

export async function askAI(query: string): Promise<{ data?: ChatResponse; error?: string }> {
  if (!query || query.trim() === '') {
    return { error: 'Query cannot be empty.' };
  }

  try {
    // 1. In a real environment, we proxy the request to the Go API
    // const res = await fetch(`${API_URL}/ai/chat`, {
    //   method: 'POST',
    //   headers: { 
    //     'Content-Type': 'application/json',
    //     // Add Auth headers here (cookies().get('access_token'))
    //   },
    //   body: JSON.stringify({ query }),
    // });
    
    // const data = await res.json();
    // if (!res.ok) {
    //   return { error: data.error?.message || 'Failed to get response.' };
    // }
    // return { data: data.data };

    // 2. Mocking the Go backend response for the Frontend implementation phase
    
    // Simulate network latency
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    return {
      data: {
        answer: "Based on the retrieved context, the latency issues were primarily attributed to Database Connection Pooling exhausting during peak load.",
        citations: [
          {
            document_id: "doc-123",
            source: "Q3 Enterprise Architecture Review",
            text: "The legacy service frequently exhausted connection pools during peak load.",
            score: 0.92
          }
        ]
      }
    };
  } catch (error) {
    console.error('AI Request Error:', error);
    return { error: 'An unexpected error occurred while communicating with the AI Service.' };
  }
}
