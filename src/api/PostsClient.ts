import type { APIRequestContext, APIResponse } from '@playwright/test';
import { BaseApiClient } from './BaseApiClient';

export interface Post {
  readonly id: number;
  readonly userId: number;
  readonly title: string;
  readonly body: string;
}

export type NewPost = Omit<Post, 'id'>;

export class PostsClient extends BaseApiClient {
  constructor(request: APIRequestContext) {
    super(request, '/posts');
  }

  listAll(): Promise<Post[]> {
    return this.get<Post[]>('');
  }

  getById(id: number): Promise<Post> {
    return this.get<Post>(`/${id}`);
  }

  create(post: NewPost): Promise<Post> {
    return this.post<Post>('', post, [201]);
  }

  update(id: number, post: NewPost): Promise<Post> {
    return this.put<Post>(`/${id}`, post);
  }

  remove(id: number): Promise<void> {
    return this.delete(`/${id}`);
  }

  /** Exposed for status/header assertions, e.g. the 404 contract. */
  rawById(id: number): Promise<APIResponse> {
    return this.raw(`/${id}`);
  }
}
