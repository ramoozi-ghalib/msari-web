export type ActionResponse<T = undefined> = 
  | { success: true; data?: T }
  | { success: false; error: { code: string; message: string; fieldErrors?: Record<string, string[] | undefined> } };
