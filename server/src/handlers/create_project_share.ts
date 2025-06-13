
import { db } from '../db';
import { projectSharesTable } from '../db/schema';
import { type CreateProjectShareInput, type ProjectShare } from '../schema';
import { nanoid } from 'nanoid';

export const createProjectShare = async (input: CreateProjectShareInput): Promise<ProjectShare> => {
  try {
    const result = await db.insert(projectSharesTable)
      .values({
        id: nanoid(),
        project_id: input.project_id,
        shared_with_user_id: input.shared_with_user_id,
        permission: input.permission,
        created_by: input.created_by
      })
      .returning()
      .execute();

    const projectShare = result[0];
    return projectShare;
  } catch (error) {
    console.error('Project share creation failed:', error);
    throw error;
  }
};
