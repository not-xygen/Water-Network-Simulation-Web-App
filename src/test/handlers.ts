import { http, HttpResponse } from "msw";

export const handlers = [
  http.get("/api/network", () => {
    return HttpResponse.json({
      nodes: [],
      edges: [],
    });
  }),
  http.post("/api/network", async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({
      success: true,
      data: body,
    });
  }),
];
