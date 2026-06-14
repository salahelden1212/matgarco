export async function callAIService(endpoint: string, data: any): Promise<any> {
  const aiServiceUrl = process.env.AI_SERVICE_URL || 'http://localhost:8000';
  const apiKey = process.env.AI_SERVICE_API_KEY || '';

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (apiKey) {
    headers['Authorization'] = `Bearer ${apiKey}`;
  }

  const response = await fetch(`${aiServiceUrl}${endpoint}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`AI service error (${response.status}): ${errorText}`);
  }

  return response.json();
}
