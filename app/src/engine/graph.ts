import { Booking } from '../types/trip';

/**
 * Builds a forward adjacency list (Directed Acyclic Graph) of bookings.
 * Map<bookingId, string[]> where the array contains the IDs of bookings that depend on it.
 */
export function buildDependencyGraph(bookings: Booking[]): Map<string, string[]> {
  const graph = new Map<string, string[]>();

  // Initialize graph with empty arrays for all nodes
  for (const booking of bookings) {
    if (!graph.has(booking.id)) {
      graph.set(booking.id, []);
    }
  }

  // Populate edges based on prevBookingId
  for (const booking of bookings) {
    if (booking.prevBookingId) {
      if (!graph.has(booking.prevBookingId)) {
        graph.set(booking.prevBookingId, []);
      }
      graph.get(booking.prevBookingId)!.push(booking.id);
    }
  }

  return graph;
}

/**
 * Traverses downstream dependencies using Breadth-First Search.
 * Returns an array of booking IDs that are descendants of the root, in topological/BFS order.
 */
export function getDownstreamBookings(rootId: string, graph: Map<string, string[]>): string[] {
  const downstream: string[] = [];
  const visited = new Set<string>();
  const queue: string[] = [];

  // Initialize with children of the root (do not include the root itself in the output)
  const children = graph.get(rootId) || [];
  for (const child of children) {
    queue.push(child);
    visited.add(child);
  }

  while (queue.length > 0) {
    const currentId = queue.shift()!;
    downstream.push(currentId);

    const nextChildren = graph.get(currentId) || [];
    for (const child of nextChildren) {
      if (!visited.has(child)) {
        visited.add(child);
        queue.push(child);
      }
    }
  }

  return downstream;
}
