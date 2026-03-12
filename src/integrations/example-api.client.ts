import { HttpClient } from './http-client';

export interface ExternalTodo {
  id: number;
  userId: number;
  title: string;
  completed: boolean;
}

function isExternalTodo(payload: unknown): payload is ExternalTodo {
  if (!payload || typeof payload !== 'object') {
    return false;
  }

  const item = payload as Record<string, unknown>;
  return (
    typeof item.id === 'number'
    && typeof item.userId === 'number'
    && typeof item.title === 'string'
    && typeof item.completed === 'boolean'
  );
}

function isExternalTodoList(payload: unknown): payload is ExternalTodo[] {
  return Array.isArray(payload) && payload.every(isExternalTodo);
}

export class ExampleApiClient {
  constructor(private readonly httpClient: HttpClient) {}

  async getTodo(id: number): Promise<ExternalTodo> {
    return this.httpClient.get<ExternalTodo>(`/todos/${id}`, isExternalTodo);
  }

  async listTodos(limit = 10): Promise<ExternalTodo[]> {
    return this.httpClient.get<ExternalTodo[]>(`/todos?_limit=${limit}`, isExternalTodoList);
  }
}
