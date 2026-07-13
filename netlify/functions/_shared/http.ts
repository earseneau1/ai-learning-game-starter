export const json = (status: number, body: unknown, headers: Record<string, string> = {}) => new Response(JSON.stringify(body), {
  status,
  headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...headers },
});

export const ok = <T>(data: T, status = 200, headers: Record<string, string> = {}) => json(status, { data }, headers);
export const fail = (status: number, message: string) => json(status, { message });

export function safeError(error: unknown) {
  if (error instanceof SyntaxError) return fail(400, 'The request body is not valid JSON.');
  console.error(error instanceof Error ? error.name : 'Unknown server error');
  return fail(500, 'The server could not complete that request. Please try again.');
}
