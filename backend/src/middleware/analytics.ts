import { Request, Response, NextFunction } from 'express';
import { AnalyticsModel } from '../models/Analytics';

export const trackEvent = (eventType: string) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authReq = req as any;
      const user_id = authReq.user?.id;

      // Track event asynchronously (don't wait for it)
      AnalyticsModel.trackEvent({
        user_id,
        event_type: eventType,
        event_data: {
          method: req.method,
          path: req.path,
          params: req.params,
          query: req.query,
        },
        ip_address: req.ip || req.socket.remoteAddress,
        user_agent: req.get('user-agent'),
      }).catch((err) => {
        console.error('Analytics tracking error:', err);
      });
    } catch (error) {
      // Don't fail the request if analytics fails
      console.error('Analytics middleware error:', error);
    }
    next();
  };
};


