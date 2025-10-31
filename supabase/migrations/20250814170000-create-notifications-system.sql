-- Create Notifications System
-- This migration sets up the complete notifications infrastructure with RLS and triggers

-- 1. Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN (
    'scoping_submitted', 'approval_decision', 'resubmission', 
    'procurement_update', 'deployment_milestone', 'maintenance_due', 
    'forecast_risk', 'system_alert'
  )),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  entity_type TEXT NOT NULL CHECK (entity_type IN (
    'site', 'scoping_approval', 'costing_approval', 'deployment', 'asset'
  )),
  entity_id UUID NOT NULL,
  action_url TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID NOT NULL REFERENCES auth.users(id),
  metadata JSONB DEFAULT '{}',
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent'))
);

-- 2. Create notification preferences table
CREATE TABLE IF NOT EXISTS public.notification_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  email_enabled BOOLEAN DEFAULT TRUE,
  push_enabled BOOLEAN DEFAULT TRUE,
  scoping_notifications BOOLEAN DEFAULT TRUE,
  approval_notifications BOOLEAN DEFAULT TRUE,
  deployment_notifications BOOLEAN DEFAULT TRUE,
  maintenance_notifications BOOLEAN DEFAULT TRUE,
  forecast_notifications BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create audit logs table for comprehensive tracking
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  table_name TEXT NOT NULL,
  record_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'
);

-- 4. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON public.notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_entity ON public.notifications(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON public.notifications(user_id, is_read) WHERE NOT is_read;

CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON public.audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_table ON public.audit_logs(table_name);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);

-- 5. Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- 6. Create RLS policies for notifications
-- Users can only see their own notifications
CREATE POLICY "notifications: user can view own" ON public.notifications
  FOR SELECT USING (auth.role() = 'authenticated' AND user_id = auth.uid());

-- Users can update their own notifications (mark as read)
CREATE POLICY "notifications: user can update own" ON public.notifications
  FOR UPDATE USING (auth.role() = 'authenticated' AND user_id = auth.uid());

-- Admins can view all notifications
CREATE POLICY "notifications: admin can view all" ON public.notifications
  FOR SELECT USING (
    auth.role() = 'authenticated' AND 
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- System can create notifications for users
CREATE POLICY "notifications: system can create" ON public.notifications
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- 7. Create RLS policies for notification preferences
CREATE POLICY "notification_preferences: user can manage own" ON public.notification_preferences
  FOR ALL USING (auth.role() = 'authenticated' AND user_id = auth.uid());

-- 8. Create RLS policies for audit logs
-- Users can see their own audit logs
CREATE POLICY "audit_logs: user can view own" ON public.audit_logs
  FOR SELECT USING (auth.role() = 'authenticated' AND user_id = auth.uid());

-- Admins can see all audit logs
CREATE POLICY "audit_logs: admin can view all" ON public.audit_logs
  FOR SELECT USING (
    auth.role() = 'authenticated' AND 
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- System can create audit logs
CREATE POLICY "audit_logs: system can create" ON public.audit_logs
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- 9. Create functions for notification management
CREATE OR REPLACE FUNCTION public.create_notification(
  _user_ids UUID[],
  _type TEXT,
  _title TEXT,
  _message TEXT,
  _entity_type TEXT,
  _entity_id UUID,
  _action_url TEXT DEFAULT NULL,
  _metadata JSONB DEFAULT '{}',
  _priority TEXT DEFAULT 'normal'
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  user_id UUID;
BEGIN
  -- Check if current user is authenticated
  IF auth.role() != 'authenticated' THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  -- Create notifications for each user
  FOREACH user_id IN ARRAY _user_ids
  LOOP
    INSERT INTO public.notifications (
      user_id, type, title, message, entity_type, entity_id, 
      action_url, metadata, priority, created_by
    ) VALUES (
      user_id, _type, _title, _message, _entity_type, _entity_id,
      _action_url, _metadata, _priority, auth.uid()
    );
  END LOOP;
END;
$$;

-- 10. Create function to get notifications with role-based filtering
CREATE OR REPLACE FUNCTION public.get_user_notifications(
  _limit INTEGER DEFAULT 50,
  _offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  type TEXT,
  title TEXT,
  message TEXT,
  entity_type TEXT,
  entity_id UUID,
  action_url TEXT,
  is_read BOOLEAN,
  created_at TIMESTAMPTZ,
  created_by UUID,
  priority TEXT,
  metadata JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  -- Check if current user is authenticated
  IF auth.role() != 'authenticated' THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  RETURN QUERY
  SELECT 
    n.id, n.type, n.title, n.message, n.entity_type, n.entity_id,
    n.action_url, n.is_read, n.created_at, n.created_by, n.priority, n.metadata
  FROM public.notifications n
  WHERE n.user_id = auth.uid()
  ORDER BY 
    CASE n.priority 
      WHEN 'urgent' THEN 1 
      WHEN 'high' THEN 2 
      WHEN 'normal' THEN 3 
      WHEN 'low' THEN 4 
    END,
    n.created_at DESC
  LIMIT _limit OFFSET _offset;
END;
$$;

-- 11. Create function to mark notifications as read
CREATE OR REPLACE FUNCTION public.mark_notification_read(_notification_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  -- Check if current user is authenticated
  IF auth.role() != 'authenticated' THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  -- Update notification if it belongs to the current user
  UPDATE public.notifications 
  SET is_read = TRUE 
  WHERE id = _notification_id AND user_id = auth.uid();
  
  RETURN FOUND;
END;
$$;

-- 12. Create function to get unread count
CREATE OR REPLACE FUNCTION public.get_unread_notification_count()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  -- Check if current user is authenticated
  IF auth.role() != 'authenticated' THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  RETURN (
    SELECT COUNT(*)::INTEGER 
    FROM public.notifications 
    WHERE user_id = auth.uid() AND NOT is_read
  );
END;
$$;

-- 13. Create function to log audit events
CREATE OR REPLACE FUNCTION public.log_audit_event(
  _action TEXT,
  _table_name TEXT,
  _record_id UUID DEFAULT NULL,
  _old_values JSONB DEFAULT NULL,
  _new_values JSONB DEFAULT NULL,
  _metadata JSONB DEFAULT '{}'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  audit_id UUID;
BEGIN
  -- Check if current user is authenticated
  IF auth.role() != 'authenticated' THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  INSERT INTO public.audit_logs (
    user_id, action, table_name, record_id, old_values, new_values, metadata
  ) VALUES (
    auth.uid(), _action, _table_name, _record_id, _old_values, _new_values, _metadata
  ) RETURNING id INTO audit_id;

  RETURN audit_id;
END;
$$;

-- 14. Create triggers for automatic notification creation
-- Trigger function for scoping submissions
CREATE OR REPLACE FUNCTION public.notify_scoping_submitted()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  ops_manager_ids UUID[];
BEGIN
  -- Get Ops Manager IDs for the organization
  SELECT ARRAY_AGG(ur.user_id) INTO ops_manager_ids
  FROM public.user_roles ur
  JOIN public.profiles p ON ur.user_id = p.id
  WHERE ur.role = 'ops_manager' 
    AND p.organization_id = NEW.organization_id;

  -- Create notifications for Ops Managers
  IF array_length(ops_manager_ids, 1) > 0 THEN
    PERFORM public.create_notification(
      ops_manager_ids,
      'scoping_submitted',
      'New Scoping Submitted',
      format('Site "%s" has submitted scoping for approval', NEW.site_name),
      'scoping_approval',
      NEW.id,
      format('/approvals/%s', NEW.id),
      jsonb_build_object('site_id', NEW.site_id, 'organization_id', NEW.organization_id),
      'high'
    );
  END IF;

  RETURN NEW;
END;
$$;

-- 15. Create trigger for scoping submissions
DROP TRIGGER IF EXISTS trigger_notify_scoping_submitted ON public.hardware_requests;
CREATE TRIGGER trigger_notify_scoping_submitted
  AFTER INSERT ON public.hardware_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_scoping_submitted();

-- 16. Create trigger function for approval decisions
CREATE OR REPLACE FUNCTION public.notify_approval_decision()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  deployment_engineer_id UUID;
  notification_type TEXT;
  notification_title TEXT;
  notification_message TEXT;
  notification_priority TEXT;
BEGIN
  -- Determine notification details based on status change
  IF NEW.status = 'approved' AND OLD.status != 'approved' THEN
    notification_type := 'approval_decision';
    notification_title := 'Scope Approved';
    notification_message := format('Your scoping for site "%s" has been approved', 
      (SELECT site_name FROM public.hardware_requests WHERE id = NEW.id));
    notification_priority := 'normal';
  ELSIF NEW.status = 'rejected' AND OLD.status != 'rejected' THEN
    notification_type := 'approval_decision';
    notification_title := 'Scope Rejected';
    notification_message := format('Your scoping for site "%s" has been rejected. Please review and resubmit.', 
      (SELECT site_name FROM public.hardware_requests WHERE id = NEW.id));
    notification_priority := 'high';
  ELSE
    RETURN NEW;
  END IF;

  -- Get the deployment engineer who submitted the scope
  SELECT created_by INTO deployment_engineer_id
  FROM public.hardware_requests
  WHERE id = NEW.id;

  -- Create notification for the deployment engineer
  IF deployment_engineer_id IS NOT NULL THEN
    PERFORM public.create_notification(
      ARRAY[deployment_engineer_id],
      notification_type,
      notification_title,
      notification_message,
      'scoping_approval',
      NEW.id,
      format('/approvals/%s', NEW.id),
      jsonb_build_object('site_id', NEW.site_id, 'status', NEW.status),
      notification_priority
    );
  END IF;

  RETURN NEW;
END;
$$;

-- 17. Create trigger for approval decisions
DROP TRIGGER IF EXISTS trigger_notify_approval_decision ON public.hardware_requests;
CREATE TRIGGER trigger_notify_approval_decision
  AFTER UPDATE ON public.hardware_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_approval_decision();

-- 18. Create function to seed initial notification preferences for existing users
CREATE OR REPLACE FUNCTION public.seed_notification_preferences()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  user_record RECORD;
BEGIN
  FOR user_record IN SELECT id FROM auth.users
  LOOP
    INSERT INTO public.notification_preferences (user_id)
    VALUES (user_record.id)
    ON CONFLICT (user_id) DO NOTHING;
  END LOOP;
END;
$$;

-- 19. Seed notification preferences for existing users
SELECT public.seed_notification_preferences();

-- 20. Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.notifications TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.notification_preferences TO authenticated;
GRANT SELECT ON public.audit_logs TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- 21. Create real-time subscriptions (for Supabase real-time)
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.audit_logs;
