import { Request, Response, NextFunction } from 'express';
import { db } from '../db/client';
import { eq, and } from 'drizzle-orm';
import { teamMembers, rolePermissions, permissions } from '../db/schema';

// Permission checking middleware
export async function checkPermission(requiredPermission: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Get user's team roles
      const userTeams = await db.query.teamMembers.findMany({
        where: eq(teamMembers.userId, req.session.userId),
        with: {
          team: true
        }
      });

      // Get permissions for user's roles
      const userRoles = userTeams.map(member => member.role);
      const permissionGrants = await db.query.rolePermissions.findMany({
        where: (rolePermissions) => 
          userRoles.map(role => eq(rolePermissions.role, role)).reduce((a, b) => and(a, b)),
        with: {
          permission: true
        }
      });

      // Check if user has required permission
      const hasPermission = permissionGrants.some(grant => 
        grant.permission.name === requiredPermission
      );

      if (!hasPermission) {
        return res.status(403).json({ error: 'Permission denied' });
      }

      next();
    } catch (error) {
      console.error('Permission check error:', error);
      res.status(500).json({ error: 'Failed to check permissions' });
    }
  };
}

// Team access middleware
export async function checkTeamAccess(teamIdParam: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const teamId = req.params[teamIdParam];
      
      // Check if user is member of the team
      const membership = await db.query.teamMembers.findFirst({
        where: and(
          eq(teamMembers.userId, req.session.userId),
          eq(teamMembers.teamId, teamId)
        )
      });

      if (!membership) {
        return res.status(403).json({ error: 'Access denied to team' });
      }

      // Add team role to request for downstream use
      req.teamRole = membership.role;
      next();
    } catch (error) {
      console.error('Team access check error:', error);
      res.status(500).json({ error: 'Failed to check team access' });
    }
  };
}

// Audit logging middleware
export async function auditLog(action: string, resourceType: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const originalJson = res.json;
    res.json = function(body) {
      try {
        // Only log successful operations
        if (res.statusCode >= 200 && res.statusCode < 300) {
          db.insert(auditLogs).values({
            userId: req.session.userId!,
            action,
            resourceType,
            resourceId: req.params.id || 'N/A',
            details: JSON.stringify({
              method: req.method,
              path: req.path,
              body: req.body,
              response: body
            })
          }).execute();
        }
      } catch (error) {
        console.error('Audit logging error:', error);
      }
      return originalJson.call(this, body);
    };
    next();
  };
} 