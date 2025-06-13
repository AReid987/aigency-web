
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { usersTable, projectsTable, canvasNodesTable, canvasEdgesTable } from '../db/schema';
import { type GetProjectCanvasInput } from '../schema';
import { getProjectCanvas } from '../handlers/get_project_canvas';

// Test data
const testUser = {
  id: 'user-1',
  email: 'test@example.com',
  name: 'Test User',
  avatar_url: null
};

const testProject = {
  id: 'project-1',
  name: 'Test Project',
  description: 'A test project',
  owner_id: 'user-1'
};

const testNode1 = {
  id: 'node-1',
  project_id: 'project-1',
  type: 'text' as const,
  title: 'Node 1',
  content: 'First node',
  position_x: 100,
  position_y: 200,
  width: 300,
  height: 150,
  style_data: { color: 'blue' },
  metadata: { version: 1 },
  created_by: 'user-1'
};

const testNode2 = {
  id: 'node-2',
  project_id: 'project-1',
  type: 'ai_document' as const,
  title: 'Node 2',
  content: null,
  position_x: 400,
  position_y: 250,
  width: 250,
  height: 200,
  style_data: null,
  metadata: null,
  created_by: 'user-1'
};

const testEdge = {
  id: 'edge-1',
  project_id: 'project-1',
  source_node_id: 'node-1',
  target_node_id: 'node-2',
  style_data: { strokeWidth: 2 }
};

const testInput: GetProjectCanvasInput = {
  project_id: 'project-1'
};

describe('getProjectCanvas', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty canvas for project with no nodes or edges', async () => {
    // Create user and project
    await db.insert(usersTable).values(testUser).execute();
    await db.insert(projectsTable).values(testProject).execute();

    const result = await getProjectCanvas(testInput);

    expect(result.nodes).toHaveLength(0);
    expect(result.edges).toHaveLength(0);
  });

  it('should return nodes and edges for a project', async () => {
    // Create user and project
    await db.insert(usersTable).values(testUser).execute();
    await db.insert(projectsTable).values(testProject).execute();

    // Create nodes
    await db.insert(canvasNodesTable).values([testNode1, testNode2]).execute();

    // Create edge
    await db.insert(canvasEdgesTable).values(testEdge).execute();

    const result = await getProjectCanvas(testInput);

    // Check nodes
    expect(result.nodes).toHaveLength(2);
    
    const node1 = result.nodes.find(n => n.id === 'node-1');
    expect(node1).toBeDefined();
    expect(node1!.title).toEqual('Node 1');
    expect(node1!.content).toEqual('First node');
    expect(node1!.position_x).toEqual(100);
    expect(node1!.position_y).toEqual(200);
    expect(node1!.width).toEqual(300);
    expect(node1!.height).toEqual(150);
    expect(node1!.style_data).toEqual({ color: 'blue' });
    expect(node1!.metadata).toEqual({ version: 1 });
    expect(node1!.type).toEqual('text');
    expect(node1!.created_by).toEqual('user-1');
    expect(node1!.created_at).toBeInstanceOf(Date);

    const node2 = result.nodes.find(n => n.id === 'node-2');
    expect(node2).toBeDefined();
    expect(node2!.title).toEqual('Node 2');
    expect(node2!.content).toBeNull();
    expect(node2!.position_x).toEqual(400);
    expect(node2!.position_y).toEqual(250);
    expect(node2!.width).toEqual(250);
    expect(node2!.height).toEqual(200);
    expect(node2!.style_data).toBeNull();
    expect(node2!.metadata).toBeNull();
    expect(node2!.type).toEqual('ai_document');

    // Check edges
    expect(result.edges).toHaveLength(1);
    const edge = result.edges[0];
    expect(edge.id).toEqual('edge-1');
    expect(edge.project_id).toEqual('project-1');
    expect(edge.source_node_id).toEqual('node-1');
    expect(edge.target_node_id).toEqual('node-2');
    expect(edge.style_data).toEqual({ strokeWidth: 2 });
    expect(edge.created_at).toBeInstanceOf(Date);
  });

  it('should return only nodes and edges for the specified project', async () => {
    // Create users and projects
    await db.insert(usersTable).values(testUser).execute();
    await db.insert(projectsTable).values([
      testProject,
      { id: 'project-2', name: 'Other Project', description: null, owner_id: 'user-1' }
    ]).execute();

    // Create nodes for both projects
    const otherNode1 = { ...testNode1, id: 'node-other-1', project_id: 'project-2', title: 'Other Node 1' };
    const otherNode2 = { ...testNode2, id: 'node-other-2', project_id: 'project-2', title: 'Other Node 2' };
    
    await db.insert(canvasNodesTable).values([
      testNode1,
      testNode2, // Need to include testNode2 for the edge to work
      otherNode1,
      otherNode2
    ]).execute();

    // Create edges for both projects
    await db.insert(canvasEdgesTable).values([
      testEdge,
      { id: 'edge-other', project_id: 'project-2', source_node_id: 'node-other-1', target_node_id: 'node-other-2', style_data: null }
    ]).execute();

    const result = await getProjectCanvas(testInput);

    // Should only return data for project-1
    expect(result.nodes).toHaveLength(2);
    expect(result.nodes.find(n => n.id === 'node-1')).toBeDefined();
    expect(result.nodes.find(n => n.id === 'node-2')).toBeDefined();
    expect(result.nodes.every(n => n.project_id === 'project-1')).toBe(true);

    expect(result.edges).toHaveLength(1);
    expect(result.edges[0].id).toEqual('edge-1');
    expect(result.edges[0].project_id).toEqual('project-1');
  });

  it('should handle projects with nodes but no edges', async () => {
    // Create user and project
    await db.insert(usersTable).values(testUser).execute();
    await db.insert(projectsTable).values(testProject).execute();

    // Create only nodes, no edges
    await db.insert(canvasNodesTable).values([testNode1]).execute();

    const result = await getProjectCanvas(testInput);

    expect(result.nodes).toHaveLength(1);
    expect(result.edges).toHaveLength(0);
  });
});
