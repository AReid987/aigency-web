
import { type Comment } from '../schema';

export declare function getProjectComments(input: { project_id: string }): Promise<Comment[]>;
