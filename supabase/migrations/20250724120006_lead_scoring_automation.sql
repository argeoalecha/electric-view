-- supabase/migrations/20250724120006_lead_scoring_automation.sql
-- Lead scoring calculations and basic automation triggers

-- Lead scoring configuration table
CREATE TABLE public.lead_scoring_rules (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  organization_id UUID REFERENCES organizations(id) NOT NULL,
  rule_name TEXT NOT NULL,
  field_name TEXT NOT NULL, -- contact field to evaluate
  field_value TEXT, -- value to match (optional for numeric rules)
  operator TEXT NOT NULL CHECK (operator IN ('equals', 'contains', 'greater_than', 'less_than', 'exists', 'not_exists')),
  score_points INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  rule_type TEXT DEFAULT 'contact' CHECK (rule_type IN ('contact', 'company', 'activity', 'deal')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default Philippine market lead scoring rules
INSERT INTO lead_scoring_rules (organization_id, rule_name, field_name, field_value, operator, score_points, rule_type) 
SELECT 
  o.id,
  'Metro Manila Location',
  'city',
  'Manila|Quezon City|Makati|Taguig|Pasig|Mandaluyong|San Juan|Marikina|Pasay|Las Piñas|Muntinlupa|Parañaque|Caloocan|Malabon|Navotas|Valenzuela',
  'contains',
  15,
  'company'
FROM organizations o;

INSERT INTO lead_scoring_rules (organization_id, rule_name, field_name, field_value, operator, score_points, rule_type)
SELECT 
  o.id,
  'Enterprise Company Size',
  'size_category',
  'enterprise',
  'equals',
  25,
  'company'
FROM organizations o;

INSERT INTO lead_scoring_rules (organization_id, rule_name, field_name, field_value, operator, score_points, rule_type)
SELECT 
  o.id,
  'Decision Maker Contact',
  'is_decision_maker',
  'true',
  'equals',
  20,
  'contact'
FROM organizations o;

INSERT INTO lead_scoring_rules (organization_id, rule_name, field_name, field_value, operator, score_points, rule_type)
SELECT 
  o.id,
  'Mobile Number Provided',
  'mobile_number',
  NULL,
  'exists',
  10,
  'contact'
FROM organizations o;

INSERT INTO lead_scoring_rules (organization_id, rule_name, field_name, field_value, operator, score_points, rule_type)
SELECT 
  o.id,
  'High Value Deal',
  'value_php',
  '100000',
  'greater_than',
  30,
  'deal'
FROM organizations o;

-- Lead scoring calculation function
CREATE OR REPLACE FUNCTION calculate_lead_score(deal_id UUID)
RETURNS INTEGER AS $$
DECLARE
  deal_record RECORD;
  contact_record RECORD;
  company_record RECORD;
  total_score INTEGER := 0;
  rule_record RECORD;
  field_value TEXT;
  numeric_value DECIMAL;
BEGIN
  -- Get deal with related contact and company
  SELECT d.*, c.*, comp.* INTO deal_record, contact_record, company_record
  FROM deals d
  LEFT JOIN contacts c ON d.contact_id = c.id
  LEFT JOIN companies comp ON d.company_id = comp.id
  WHERE d.id = deal_id;
  
  IF NOT FOUND THEN
    RETURN 0;
  END IF;
  
  -- Apply scoring rules
  FOR rule_record IN 
    SELECT * FROM lead_scoring_rules 
    WHERE organization_id = deal_record.organization_id 
      AND is_active = TRUE
  LOOP
    CASE rule_record.rule_type
      WHEN 'contact' THEN
        -- Get contact field value
        EXECUTE format('SELECT ($1).%I::TEXT', rule_record.field_name) 
        INTO field_value USING contact_record;
        
      WHEN 'company' THEN
        -- Get company field value
        EXECUTE format('SELECT ($1).%I::TEXT', rule_record.field_name) 
        INTO field_value USING company_record;
        
      WHEN 'deal' THEN
        -- Get deal field value
        EXECUTE format('SELECT ($1).%I::TEXT', rule_record.field_name) 
        INTO field_value USING deal_record;
        
      ELSE
        CONTINUE;
    END CASE;
    
    -- Apply scoring logic based on operator
    CASE rule_record.operator
      WHEN 'equals' THEN
        IF field_value = rule_record.field_value THEN
          total_score := total_score + rule_record.score_points;
        END IF;
        
      WHEN 'contains' THEN
        IF field_value IS NOT NULL AND rule_record.field_value IS NOT NULL THEN
          -- Support multiple values separated by |
          IF field_value ~* ANY(string_to_array(rule_record.field_value, '|')) THEN
            total_score := total_score + rule_record.score_points;
          END IF;
        END IF;
        
      WHEN 'exists' THEN
        IF field_value IS NOT NULL AND field_value != '' THEN
          total_score := total_score + rule_record.score_points;
        END IF;
        
      WHEN 'not_exists' THEN
        IF field_value IS NULL OR field_value = '' THEN
          total_score := total_score + rule_record.score_points;
        END IF;
        
      WHEN 'greater_than' THEN
        BEGIN
          numeric_value := field_value::DECIMAL;
          IF numeric_value > rule_record.field_value::DECIMAL THEN
            total_score := total_score + rule_record.score_points;
          END IF;
        EXCEPTION WHEN OTHERS THEN
          -- Skip if not numeric
          CONTINUE;
        END;
        
      WHEN 'less_than' THEN
        BEGIN
          numeric_value := field_value::DECIMAL;
          IF numeric_value < rule_record.field_value::DECIMAL THEN
            total_score := total_score + rule_record.score_points;
          END IF;
        EXCEPTION WHEN OTHERS THEN
          -- Skip if not numeric
          CONTINUE;
        END;
    END CASE;
  END LOOP;
  
  -- Bonus scoring for activity engagement
  SELECT COUNT(*) * 5 INTO numeric_value
  FROM activities 
  WHERE deal_id = deal_record.id 
    AND activity_date > NOW() - INTERVAL '30 days';
  
  total_score := total_score + numeric_value::INTEGER;
  
  -- Bonus for recent activity
  IF EXISTS (
    SELECT 1 FROM activities 
    WHERE deal_id = deal_record.id 
      AND activity_date > NOW() - INTERVAL '7 days'
  ) THEN
    total_score := total_score + 10;
  END IF;
  
  -- Cap score at reasonable maximum
  total_score := LEAST(total_score, 100);
  
  RETURN total_score;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-calculate lead score when deal is updated
CREATE OR REPLACE FUNCTION update_deal_lead_score()
RETURNS TRIGGER AS $$
DECLARE
  new_score INTEGER;
BEGIN
  -- Calculate new lead score
  new_score := calculate_lead_score(NEW.id);
  
  -- Update the deal with new score (avoid infinite recursion)
  IF NEW.lead_score IS DISTINCT FROM new_score THEN
    UPDATE deals SET lead_score = new_score WHERE id = NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Only trigger on specific field changes to avoid excessive calculations
CREATE TRIGGER update_deal_score_trigger
  AFTER INSERT OR UPDATE OF contact_id, company_id, value_php, stage
  ON deals
  FOR EACH ROW
  EXECUTE FUNCTION update_deal_lead_score();

-- Trigger to update lead score when contact/company info changes
CREATE OR REPLACE FUNCTION update_related_deal_scores()
RETURNS TRIGGER AS $$
DECLARE
  deal_id UUID;
BEGIN
  -- Update scores for all related deals
  FOR deal_id IN 
    SELECT d.id FROM deals d 
    WHERE (TG_TABLE_NAME = 'contacts' AND d.contact_id = COALESCE(NEW.id, OLD.id))
       OR (TG_TABLE_NAME = 'companies' AND d.company_id = COALESCE(NEW.id, OLD.id))
  LOOP
    PERFORM calculate_lead_score(deal_id);
  END LOOP;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_contact_deal_scores
  AFTER UPDATE OF is_decision_maker, mobile_number, job_title
  ON contacts
  FOR EACH ROW
  EXECUTE FUNCTION update_related_deal_scores();

CREATE TRIGGER update_company_deal_scores
  AFTER UPDATE OF size_category, city, industry
  ON companies
  FOR EACH ROW
  EXECUTE FUNCTION update_related_deal_scores();

-- Basic automation triggers for Philippine business culture
CREATE OR REPLACE FUNCTION create_follow_up_tasks()
RETURNS TRIGGER AS $$
DECLARE
  follow_up_date DATE;
  task_title TEXT;
BEGIN
  -- Create follow-up tasks based on Philippine business practices
  CASE NEW.type
    WHEN 'call' THEN
      -- Follow up calls within 3 days (important in PH relationship culture)
      follow_up_date := (NEW.activity_date::DATE) + INTERVAL '3 days';
      task_title := 'Follow up on call with ' || (
        SELECT first_name || ' ' || last_name 
        FROM contacts WHERE id = NEW.contact_id
      );
      
    WHEN 'meeting' THEN
      -- Send meeting summary within 24 hours
      follow_up_date := (NEW.activity_date::DATE) + INTERVAL '1 day';
      task_title := 'Send meeting summary and next steps';
      
    WHEN 'email' THEN
      -- Follow up emails within 1 week
      follow_up_date := (NEW.activity_date::DATE) + INTERVAL '7 days';
      task_title := 'Follow up on email correspondence';
      
    ELSE
      RETURN NEW;
  END CASE;
  
  -- Don't create duplicate tasks
  IF NOT EXISTS (
    SELECT 1 FROM tasks 
    WHERE deal_id = NEW.deal_id 
      AND contact_id = NEW.contact_id
      AND due_date = follow_up_date
      AND title ILIKE '%follow%'
  ) THEN
    INSERT INTO tasks (
      organization_id,
      deal_id,
      contact_id,
      assigned_to,
      created_by,
      title,
      description,
      due_date,
      task_type,
      priority
    ) VALUES (
      NEW.organization_id,
      NEW.deal_id,
      NEW.contact_id,
      NEW.created_by, -- Assign to the person who created the activity
      NEW.created_by,
      task_title,
      'Auto-generated follow-up task based on ' || NEW.type || ' activity: ' || NEW.description,
      follow_up_date,
      'follow_up',
      CASE 
        WHEN NEW.type = 'meeting' THEN 'high'
        WHEN NEW.type = 'call' THEN 'medium'
        ELSE 'low'
      END
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER auto_create_follow_up_tasks
  AFTER INSERT ON activities
  FOR EACH ROW
  EXECUTE FUNCTION create_follow_up_tasks();

-- Deal stage automation for Philippine sales process
CREATE OR REPLACE FUNCTION handle_deal_stage_changes()
RETURNS TRIGGER AS $$
BEGIN
  -- Log stage changes as activities
  IF OLD.stage IS DISTINCT FROM NEW.stage THEN
    INSERT INTO activities (
      organization_id,
      deal_id,
      contact_id,
      created_by,
      type,
      description,
      activity_date
    ) VALUES (
      NEW.organization_id,
      NEW.id,
      NEW.contact_id,
      auth.uid(),
      'note',
      'Deal stage changed from ' || COALESCE(OLD.stage, 'none') || ' to ' || NEW.stage,
      NOW()
    );
    
    -- Create stage-specific tasks
    CASE NEW.stage
      WHEN 'qualified' THEN
        -- Schedule needs assessment meeting
        INSERT INTO tasks (
          organization_id,
          deal_id,
          contact_id,
          assigned_to,
          created_by,
          title,
          description,
          due_date,
          task_type,
          priority
        ) VALUES (
          NEW.organization_id,
          NEW.id,
          NEW.contact_id,
          auth.uid(),
          auth.uid(),
          'Schedule needs assessment meeting',
          'Deal has been qualified. Schedule a detailed needs assessment meeting to understand requirements.',
          CURRENT_DATE + INTERVAL '2 days',
          'meeting',
          'high'
        );
        
      WHEN 'proposal' THEN
        -- Prepare and send proposal
        INSERT INTO tasks (
          organization_id,
          deal_id,
          contact_id,
          assigned_to,
          created_by,
          title,
          description,
          due_date,
          task_type,
          priority
        ) VALUES (
          NEW.organization_id,
          NEW.id,
          NEW.contact_id,
          auth.uid(),
          auth.uid(),
          'Prepare and send proposal',
          'Create customized proposal based on client requirements and send for review.',
          CURRENT_DATE + INTERVAL '3 days',
          'proposal',
          'high'
        );
        
      WHEN 'closed' THEN
        -- Send thank you and request testimonial
        INSERT INTO tasks (
          organization_id,
          deal_id,
          contact_id,
          assigned_to,
          created_by,
          title,
          description,
          due_date,
          task_type,
          priority
        ) VALUES (
          NEW.organization_id,
          NEW.id,
          NEW.contact_id,
          auth.uid(),
          auth.uid(),
          'Send thank you and onboarding information',
          'Deal closed successfully! Send thank you message and onboarding details. Consider requesting testimonial.',
          CURRENT_DATE + INTERVAL '1 day',
          'email',
          'medium'
        );
    END CASE;
  END IF;
  
  -- Update deal probability based on stage
  NEW.probability := CASE NEW.stage
    WHEN 'lead' THEN 10
    WHEN 'qualified' THEN 25
    WHEN 'proposal' THEN 50
    WHEN 'negotiation' THEN 75
    WHEN 'closed' THEN 100
    ELSE NEW.probability
  END;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER deal_stage_automation
  BEFORE UPDATE OF stage ON deals
  FOR EACH ROW
  EXECUTE FUNCTION handle_deal_stage_changes();

-- Philippines-specific business insights function
CREATE OR REPLACE FUNCTION get_deal_insights(org_id UUID, days_back INTEGER DEFAULT 30)
RETURNS JSONB AS $$
DECLARE
  result JSONB;
  total_deals INTEGER;
  high_score_deals INTEGER;
  overdue_followups INTEGER;
  metro_manila_deals INTEGER;
  enterprise_deals INTEGER;
BEGIN
  -- Get deal statistics
  SELECT COUNT(*) INTO total_deals
  FROM deals 
  WHERE organization_id = org_id 
    AND created_at > NOW() - INTERVAL '1 day' * days_back;
  
  SELECT COUNT(*) INTO high_score_deals
  FROM deals 
  WHERE organization_id = org_id 
    AND lead_score >= 70
    AND stage NOT IN ('closed', 'lost');
  
  SELECT COUNT(*) INTO overdue_followups
  FROM tasks 
  WHERE organization_id = org_id 
    AND status = 'pending'
    AND due_date < CURRENT_DATE;
  
  SELECT COUNT(*) INTO metro_manila_deals
  FROM deals d
  JOIN companies c ON d.company_id = c.id
  WHERE d.organization_id = org_id 
    AND c.city IN ('Manila', 'Quezon City', 'Makati', 'Taguig', 'Pasig', 'Mandaluyong');
  
  SELECT COUNT(*) INTO enterprise_deals
  FROM deals d
  JOIN companies c ON d.company_id = c.id
  WHERE d.organization_id = org_id 
    AND c.size_category = 'enterprise'
    AND d.stage NOT IN ('closed', 'lost');
  
  result := jsonb_build_object(
    'total_deals', total_deals,
    'high_score_deals', high_score_deals,
    'overdue_followups', overdue_followups,
    'metro_manila_percentage', CASE 
      WHEN total_deals > 0 THEN ROUND((metro_manila_deals::DECIMAL / total_deals * 100), 1)
      ELSE 0 
    END,
    'enterprise_deals', enterprise_deals,
    'insights', ARRAY[
      CASE 
        WHEN overdue_followups > 0 THEN 'You have ' || overdue_followups || ' overdue follow-ups - Filipino business culture values timely communication'
        ELSE 'Great job staying on top of follow-ups!'
      END,
      CASE 
        WHEN high_score_deals > 0 THEN 'You have ' || high_score_deals || ' high-potential deals - focus your energy here'
        ELSE 'Consider improving lead qualification to identify high-potential opportunities'
      END,
      CASE 
        WHEN metro_manila_deals > total_deals * 0.6 THEN 'Strong Metro Manila presence - consider expanding to other regions'
        ELSE 'Opportunity to grow in Metro Manila market'
      END
    ]
  );
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create indexes for performance
CREATE INDEX idx_lead_scoring_rules_org ON lead_scoring_rules(organization_id) WHERE is_active = TRUE;
CREATE INDEX idx_deals_lead_score ON deals(lead_score) WHERE lead_score IS NOT NULL;
CREATE INDEX idx_deals_stage_org ON deals(organization_id, stage);
CREATE INDEX idx_tasks_due_date ON tasks(due_date) WHERE status = 'pending';
CREATE INDEX idx_activities_recent ON activities(organization_id, activity_date) WHERE activity_date > NOW() - INTERVAL '30 days';