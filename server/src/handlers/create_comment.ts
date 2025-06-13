
import { db } from '../db';
import { commentsTable } from '../db/schema';
import { type CreateCommentInput, type Comment } from '../schema';
import { nanoid } from 'nanoid';

export const createComment = async (input: CreateCommentInput): Promise<Comment> => {
  try {
    // Insert comment record
    const result = await db.insert(commentsTable)
      .values({
        id: nanoid(),
        project_id: input.project_id,
        node_id: input.node_id || null,
        content: input.content,
        position_x: input.position_x || null,
        position_y: input.position_y || null,
        author_id: input.author_id
      })
      .returning()
      .execute();

    const comment = result[0];
    return {
      ...comment,
      // Convert real columns back to numbers for the API
      position_x: comment.position_x !== null ? comment.position_x : null,
      position_y: comment.position_y !== null ? comment.position_y : null
    };
  } catch (error) {
    console.error('Comment creation failed:', error);
    throw error;
  }
};
