
import { initTRPC } from '@trpc/server';
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
  createCommentInputSchema
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

const t = initTRPC.create({
  transformer: superjson,
});

const publicProcedure = t.procedure;
const router = t.router;

const appRouter = router({
  healthcheck: publicProcedure.query(() => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }),

  // Project routes
  createProject: publicProcedure
    .input(createProjectInputSchema)
    .mutation(({ input }) => createProject(input)),
  
  getUserProjects: publicProcedure
    .input(getUserProjectsInputSchema)
    .query(({ input }) => getUserProjects(input)),
  
  getProject: publicProcedure
    .input(getProjectInputSchema)
    .query(({ input }) => getProject(input)),
  
  updateProject: publicProcedure
    .input(updateProjectInputSchema)
    .mutation(({ input }) => updateProject(input)),
  
  deleteProject: publicProcedure
    .input(getProjectInputSchema)
    .mutation(({ input }) => deleteProject(input)),

  // Canvas node routes
  createCanvasNode: publicProcedure
    .input(createCanvasNodeInputSchema)
    .mutation(({ input }) => createCanvasNode(input)),
  
  updateCanvasNode: publicProcedure
    .input(updateCanvasNodeInputSchema)
    .mutation(({ input }) => updateCanvasNode(input)),
  
  deleteCanvasNode: publicProcedure
    .input(getProjectInputSchema.pick({ id: true }))
    .mutation(({ input }) => deleteCanvasNode(input)),
  
  getProjectCanvas: publicProcedure
    .input(getProjectCanvasInputSchema)
    .query(({ input }) => getProjectCanvas(input)),

  // Canvas edge routes
  createCanvasEdge: publicProcedure
    .input(createCanvasEdgeInputSchema)
    .mutation(({ input }) => createCanvasEdge(input)),
  
  deleteCanvasEdge: publicProcedure
    .input(getProjectInputSchema.pick({ id: true }))
    .mutation(({ input }) => deleteCanvasEdge(input)),

  // AI document routes
  createAiDocument: publicProcedure
    .input(createAiDocumentInputSchema)
    .mutation(({ input }) => createAiDocument(input)),
  
  getAiDocument: publicProcedure
    .input(getProjectInputSchema.pick({ id: true }).extend({ node_id: getProjectInputSchema.shape.id }))
    .query(({ input }) => getAiDocument({ node_id: input.node_id })),

  // Project sharing routes
  createProjectShare: publicProcedure
    .input(createProjectShareInputSchema)
    .mutation(({ input }) => createProjectShare(input)),
  
  getProjectShares: publicProcedure
    .input(getProjectCanvasInputSchema)
    .query(({ input }) => getProjectShares({ project_id: input.project_id })),
  
  deleteProjectShare: publicProcedure
    .input(getProjectInputSchema.pick({ id: true }))
    .mutation(({ input }) => deleteProjectShare(input)),

  // Comment routes
  createComment: publicProcedure
    .input(createCommentInputSchema)
    .mutation(({ input }) => createComment(input)),
  
  getProjectComments: publicProcedure
    .input(getProjectCanvasInputSchema)
    .query(({ input }) => getProjectComments({ project_id: input.project_id })),
  
  deleteComment: publicProcedure
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
    createContext() {
      return {};
    },
  });
  server.listen(port);
  console.log(`TRPC server listening at port: ${port}`);
}

start();
