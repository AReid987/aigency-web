
import { initTRPC, TRPCError } from '@trpc/server';
import { createHTTPServer } from '@trpc/server/adapters/standalone';
import 'dotenv/config';
import cors from 'cors';
import superjson from 'superjson';

// Import schemas
import {
  createProjectInputSchema,
  getUserProjectsInputSchema,
  getProjectInputSchema,
  updateProjectInputSchema,
  createCanvasNodeInputSchema,
  updateCanvasNodeInputSchema,
  getProjectCanvasInputSchema,
  createCanvasEdgeInputSchema,
  createAiDocumentInputSchema,
  createProjectShareInputSchema,
  createCommentInputSchema,
  loginInputSchema,
  signupInputSchema,
  type User
} from './schema';

// Import handlers
import { createProject } from './handlers/create_project';
import { getUserProjects } from './handlers/get_user_projects';
import { getProject } from './handlers/get_project';
import { updateProject } from './handlers/update_project';
import { deleteProject } from './handlers/delete_project';
import { createCanvasNode } from './handlers/create_canvas_node';
import { updateCanvasNode } from './handlers/update_canvas_node';
import { deleteCanvasNode } from './handlers/delete_canvas_node';
import { getProjectCanvas } from './handlers/get_project_canvas';
import { createCanvasEdge } from './handlers/create_canvas_edge';
import { deleteCanvasEdge } from './handlers/delete_canvas_edge';
import { createAiDocument } from './handlers/create_ai_document';
import { getAiDocument } from './handlers/get_ai_document';
import { createProjectShare } from './handlers/create_project_share';
import { getProjectShares } from './handlers/get_project_shares';
import { deleteProjectShare } from './handlers/delete_project_share';
import { createComment } from './handlers/create_comment';
import { getProjectComments } from './handlers/get_project_comments';
import { deleteComment } from './handlers/delete_comment';
import { login, signup } from './handlers/auth';

// Context type
interface Context {
  user?: User;
}

const t = initTRPC.context<Context>().create({
  transformer: superjson,
});

const publicProcedure = t.procedure;
const router = t.router;

// Protected procedure middleware
const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
  // For now, use a mock user when no context user is provided
  // In a real implementation, this would validate JWT tokens
  const user = ctx.user || {
    id: 'user-1',
    email: 'user@example.com',
    name: 'Creative User',
    avatar_url: null,
    created_at: new Date(),
    updated_at: new Date()
  };

  return next({
    ctx: {
      ...ctx,
      user
    },
  });
});

const appRouter = router({
  healthcheck: publicProcedure.query(() => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }),

  // Auth routes
  login: publicProcedure
    .input(loginInputSchema)
    .mutation(({ input }) => login(input)),
  
  signup: publicProcedure
    .input(signupInputSchema)
    .mutation(({ input }) => signup(input)),

  // Project routes
  createProject: protectedProcedure
    .input(createProjectInputSchema.omit({ owner_id: true }))
    .mutation(({ input, ctx }) => createProject({ ...input, owner_id: ctx.user.id })),
  
  getUserProjects: protectedProcedure
    .query(({ ctx }) => getUserProjects({ user_id: ctx.user.id })),
  
  getProject: protectedProcedure
    .input(getProjectInputSchema)
    .query(({ input }) => getProject(input)),
  
  updateProject: protectedProcedure
    .input(updateProjectInputSchema)
    .mutation(({ input }) => updateProject(input)),
  
  deleteProject: protectedProcedure
    .input(getProjectInputSchema)
    .mutation(({ input }) => deleteProject(input)),

  // Canvas node routes
  createCanvasNode: protectedProcedure
    .input(createCanvasNodeInputSchema.omit({ created_by: true }))
    .mutation(({ input, ctx }) => createCanvasNode({ ...input, created_by: ctx.user.id })),
  
  updateCanvasNode: protectedProcedure
    .input(updateCanvasNodeInputSchema)
    .mutation(({ input }) => updateCanvasNode(input)),
  
  deleteCanvasNode: protectedProcedure
    .input(getProjectInputSchema.pick({ id: true }))
    .mutation(({ input }) => deleteCanvasNode(input)),
  
  getProjectCanvas: protectedProcedure
    .input(getProjectCanvasInputSchema)
    .query(({ input }) => getProjectCanvas(input)),

  // Canvas edge routes
  createCanvasEdge: protectedProcedure
    .input(createCanvasEdgeInputSchema)
    .mutation(({ input }) => createCanvasEdge(input)),
  
  deleteCanvasEdge: protectedProcedure
    .input(getProjectInputSchema.pick({ id: true }))
    .mutation(({ input }) => deleteCanvasEdge(input)),

  // AI document routes
  createAiDocument: protectedProcedure
    .input(createAiDocumentInputSchema)
    .mutation(({ input }) => createAiDocument(input)),
  
  getAiDocument: protectedProcedure
    .input(getProjectInputSchema.pick({ id: true }).extend({ node_id: getProjectInputSchema.shape.id }))
    .query(({ input }) => getAiDocument({ node_id: input.node_id })),

  // Project sharing routes
  createProjectShare: protectedProcedure
    .input(createProjectShareInputSchema.omit({ created_by: true }))
    .mutation(({ input, ctx }) => createProjectShare({ ...input, created_by: ctx.user.id })),
  
  getProjectShares: protectedProcedure
    .input(getProjectCanvasInputSchema)
    .query(({ input }) => getProjectShares({ project_id: input.project_id })),
  
  deleteProjectShare: protectedProcedure
    .input(getProjectInputSchema.pick({ id: true }))
    .mutation(({ input }) => deleteProjectShare(input)),

  // Comment routes
  createComment: protectedProcedure
    .input(createCommentInputSchema.omit({ author_id: true }))
    .mutation(({ input, ctx }) => createComment({ ...input, author_id: ctx.user.id })),
  
  getProjectComments: protectedProcedure
    .input(getProjectCanvasInputSchema)
    .query(({ input }) => getProjectComments({ project_id: input.project_id })),
  
  deleteComment: protectedProcedure
    .input(getProjectInputSchema.pick({ id: true }))
    .mutation(({ input }) => deleteComment(input))
});

export type AppRouter = typeof appRouter;

async function start() {
  const port = process.env['SERVER_PORT'] || 2022;
  const server = createHTTPServer({
    middleware: (req, res, next) => {
      cors()(req, res, next);
    },
    router: appRouter,
    createContext({ req }): Context {
      // In a real implementation, extract user from JWT token in Authorization header
      // For now, mock context
      return {};
    },
  });
  server.listen(port);
  console.log(`TRPC server listening at port: ${port}`);
}

start();
