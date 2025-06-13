
import { db } from '../db';
import { projectsTable, projectSharesTable } from '../db/schema';
import { type GetUserProjectsInput, type Project } from '../schema';
import { eq, or } from 'drizzle-orm';

export const getUserProjects = async (input: GetUserProjectsInput): Promise<Project[]> => {
  try {
    // Get projects where user is either owner or has shared access
    const results = await db.select({
      id: projectsTable.id,
      name: projectsTable.name,
      description: projectsTable.description,
      owner_id: projectsTable.owner_id,
      created_at: projectsTable.created_at,
      updated_at: projectsTable.updated_at
    })
    .from(projectsTable)
    .leftJoin(projectSharesTable, eq(projectsTable.id, projectSharesTable.project_id))
    .where(
      or(
        eq(projectsTable.owner_id, input.user_id),
        eq(projectSharesTable.shared_with_user_id, input.user_id)
      )
    )
    .execute();

    // Remove duplicates (a project might appear multiple times if shared with multiple permissions)
    const uniqueProjects = new Map<string, Project>();
    
    results.forEach(result => {
      if (!uniqueProjects.has(result.id)) {
        uniqueProjects.set(result.id, {
          id: result.id,
          name: result.name,
          description: result.description,
          owner_id: result.owner_id,
          created_at: result.created_at,
          updated_at: result.updated_at
        });
      }
    });

    return Array.from(uniqueProjects.values());
  } catch (error) {
    console.error('Get user projects failed:', error);
    throw error;
  }
};
