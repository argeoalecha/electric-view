-- supabase/migrations/20250724120005_philippines_business_functions.sql
-- Business logic functions for Philippine CRM market

-- Subscription tier limits configuration
CREATE TABLE public.subscription_plans (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  price_php DECIMAL(10,2) NOT NULL,
  billing_interval TEXT NOT NULL CHECK (billing_interval IN ('monthly', 'yearly')),
  user_limit INTEGER NOT NULL,
  contact_limit INTEGER NOT NULL,
  deal_limit INTEGER,
  storage_mb INTEGER DEFAULT 100,
  features JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT TRUE,
  trial_days INTEGER DEFAULT 14,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert Philippine market pricing plans
INSERT INTO subscription_plans (name, price_php, billing_interval, user_limit, contact_limit, deal_limit, features) VALUES
-- Free tier - for SME trial
('Free Forever', 0.00, 'monthly', 1, 20, 5, '{"features": ["basic_crm", "email_support"], "limitations": ["no_team_features", "basic_reporting"]}'),
-- Basic tier - affordable for Filipino SMEs  
('Basic Monthly', 499.00, 'monthly', 3, 500, 50, '{"features": ["team_collaboration", "basic_reports", "email_support", "mobile_app"], "integrations": ["basic"]}'),
('Basic Yearly', 4990.00, 'yearly', 3, 500, 50, '{"features": ["team_collaboration", "basic_reports", "priority_support", "mobile_app"], "integrations": ["basic"], "discount": "15%"}'),
-- Pro tier - for growing businesses
('Pro Monthly', 999.00, 'monthly', 10, 2000, 200, '{"features": ["advanced_reports", "automation", "api_access", "priority_support", "custom_fields"], "integrations": ["advanced", "paymongo", "gcash"]}'),
('Pro Yearly', 9990.00, 'yearly', 10, 2000, 200, '{"features": ["advanced_reports", "automation", "api_access", "priority_support", "custom_fields", "phone_support"], "integrations": ["advanced", "paymongo", "gcash"], "discount": "16%"}');

-- Function to check subscription limits
CREATE OR REPLACE FUNCTION check_subscription_limit(
  org_id UUID,
  resource_type TEXT,
  additional_count INTEGER DEFAULT 1
)
RETURNS BOOLEAN AS $$
DECLARE
  current_plan RECORD;
  current_usage INTEGER;
BEGIN
  -- Get current subscription plan
  SELECT sp.* INTO current_plan
  FROM subscription_plans sp
  JOIN subscriptions s ON sp.name = s.plan_name
  WHERE s.organization_id = org_id 
    AND s.status IN ('active', 'trialing')
  ORDER BY s.created_at DESC
  LIMIT 1;
  
  -- If no active subscription, use free plan limits
  IF current_plan IS NULL THEN
    SELECT * INTO current_plan FROM subscription_plans WHERE name = 'Free Forever';
  END IF;
  
  -- Check specific resource limits
  CASE resource_type
    WHEN 'users' THEN
      SELECT COUNT(*) INTO current_usage FROM profiles 
      WHERE organization_id = org_id AND is_active = TRUE;
      RETURN (current_usage + additional_count) <= current_plan.user_limit;
      
    WHEN 'contacts' THEN
      SELECT COUNT(*) INTO current_usage FROM contacts 
      WHERE organization_id = org_id;
      RETURN (current_usage + additional_count) <= current_plan.contact_limit;
      
    WHEN 'deals' THEN
      SELECT COUNT(*) INTO current_usage FROM deals 
      WHERE organization_id = org_id;
      RETURN current_plan.deal_limit IS NULL OR (current_usage + additional_count) <= current_plan.deal_limit;
      
    ELSE
      RETURN TRUE; -- Unknown resource type, allow by default
  END CASE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to handle Philippine payment webhook
CREATE OR REPLACE FUNCTION handle_payment_webhook(
  provider TEXT,
  webhook_data JSONB
)
RETURNS BOOLEAN AS $
DECLARE
  org_id UUID;
  transaction_id TEXT;
  amount DECIMAL;
  status TEXT;
  subscription_record RECORD;
  payment_method TEXT;
BEGIN
  -- Extract data based on provider
  CASE provider
    WHEN 'paymongo' THEN
      transaction_id := webhook_data->>'id';
      amount := (webhook_data->'data'->'attributes'->>'amount')::DECIMAL / 100; -- PayMongo uses cents
      status := webhook_data->'data'->'attributes'->>'status';
      payment_method := webhook_data->'data'->'attributes'->'source'->>'type';
      
    WHEN 'gcash' THEN
      -- GCash direct integration (if using GCash Business API)
      transaction_id := webhook_data->>'transactionId';
      amount := (webhook_data->>'amount')::DECIMAL;
-- Function to handle manual payment verification (for bank transfers, OTC)
CREATE OR REPLACE FUNCTION verify_manual_payment(
  org_id UUID,
  reference_number TEXT,
  amount_php DECIMAL,
  payment_method TEXT,
  payment_proof_url TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $
DECLARE
  subscription_record RECORD;
BEGIN
  -- Get active subscription
  SELECT * INTO subscription_record
  FROM subscriptions
  WHERE organization_id = org_id
    AND status IN ('trialing', 'past_due', 'active')
  ORDER BY created_at DESC
  LIMIT 1;
  
  -- Create payment transaction record
  INSERT INTO payment_transactions (
    organization_id,
    subscription_id,
    external_transaction_id,
    payment_provider,
    amount_php,
    status,
    payment_method,
    transaction_date,
    description,
    receipt_url,
    metadata
  ) VALUES (
    org_id,
    subscription_record.id,
    reference_number,
    'manual',
    amount_php,
    'pending_verification', -- Requires admin verification
    payment_method,
    NOW(),
    'Manual payment: ' || payment_method,
    payment_proof_url,
    jsonb_build_object(
      'requires_verification', true,
      'payment_method', payment_method,
      'reference_number', reference_number
    )
  );
  
  -- TODO: Send notification to admin for payment verification
  
  RETURN TRUE;
END;
$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to approve manual payment (admin only)
CREATE OR REPLACE FUNCTION approve_manual_payment(
  transaction_id UUID,
  admin_user_id UUID
)
RETURNS BOOLEAN AS $
DECLARE
  transaction_record RECORD;
  subscription_record RECORD;
BEGIN
  -- Get transaction details
  SELECT * INTO transaction_record
  FROM payment_transactions
  WHERE id = transaction_id AND status = 'pending_verification';
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Transaction not found or already processed';
  END IF;
  
  -- Verify admin has permission
  IF NOT EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = admin_user_id 
      AND organization_id = transaction_record.organization_id
      AND role IN ('owner', 'admin')
  ) THEN
    RAISE EXCEPTION 'Insufficient permissions to approve payment';
  END IF;
  
  -- Update transaction status
  UPDATE payment_transactions SET
    status = 'paid',
    paid_at = NOW(),
    metadata = metadata || jsonb_build_object('approved_by', admin_user_id, 'approved_at', NOW())
  WHERE id = transaction_id;
  
  -- Update subscription status
  SELECT * INTO subscription_record
  FROM subscriptions
  WHERE id = transaction_record.subscription_id;
  
  UPDATE subscriptions SET
    status = 'active',
    last_payment_at = NOW(),
    next_billing_date = CASE 
      WHEN billing_interval = 'monthly' THEN NOW() + INTERVAL '1 month'
      WHEN billing_interval = 'yearly' THEN NOW() + INTERVAL '1 year'
    END,
    updated_at = NOW()
  WHERE id = subscription_record.id;
  
  RETURN TRUE;
END;
$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get Philippine business insights
CREATE OR REPLACE FUNCTION get_philippines_business_insights(org_id UUID)
RETURNS JSONB AS $
DECLARE
  result JSONB;
  total_contacts INTEGER;
  metro_manila_contacts INTEGER;
  enterprise_deals INTEGER;
  sme_deals INTEGER;
  gcash_payments INTEGER;
  relationship_strength_stats JSONB;
BEGIN
  -- Count contacts by location
  SELECT COUNT(*) INTO total_contacts
  FROM contacts WHERE organization_id = org_id;
  
  SELECT COUNT(*) INTO metro_manila_contacts
  FROM contacts c
  JOIN companies comp ON c.company_id = comp.id
  WHERE c.organization_id = org_id 
    AND comp.city IN ('Manila', 'Quezon City', 'Makati', 'Taguig', 'Pasig', 'Mandaluyong', 'San Juan', 'Marikina', 'Pasay', 'Las Piñas', 'Muntinlupa', 'Parañaque', 'Caloocan', 'Malabon', 'Navotas', 'Valenzuela');
  
  -- Analyze deals by business size
  SELECT COUNT(*) INTO enterprise_deals
  FROM deals d
  JOIN companies c ON d.company_id = c.id
  WHERE d.organization_id = org_id 
    AND c.size_category = 'enterprise';
    
  SELECT COUNT(*) INTO sme_deals
  FROM deals d
  JOIN companies c ON d.company_id = c.id
  WHERE d.organization_id = org_id 
    AND c.size_category IN ('startup', 'small', 'medium');
  
  -- Count GCash payments
  SELECT COUNT(*) INTO gcash_payments
  FROM payment_transactions
  WHERE organization_id = org_id 
    AND payment_method = 'gcash'
    AND status = 'paid';
  
  -- Relationship strength analysis
  SELECT jsonb_build_object(
    'new', COUNT(*) FILTER (WHERE relationship_strength = 'new'),
    'developing', COUNT(*) FILTER (WHERE relationship_strength = 'developing'),
    'strong', COUNT(*) FILTER (WHERE relationship_strength = 'strong'),
    'champion', COUNT(*) FILTER (WHERE relationship_strength = 'champion')
  ) INTO relationship_strength_stats
  FROM deals WHERE organization_id = org_id;
  
  -- Compile insights
  result := jsonb_build_object(
    'geographic_insights', jsonb_build_object(
      'total_contacts', total_contacts,
      'metro_manila_percentage', CASE 
        WHEN total_contacts > 0 THEN ROUND((metro_manila_contacts::DECIMAL / total_contacts * 100), 1)
        ELSE 0 
      END,
      'regional_distribution', 'focused' -- Could be expanded with more analysis
    ),
    'business_insights', jsonb_build_object(
      'enterprise_deals', enterprise_deals,
      'sme_deals', sme_deals,
      'sme_focus_percentage', CASE 
        WHEN (enterprise_deals + sme_deals) > 0 THEN ROUND((sme_deals::DECIMAL / (enterprise_deals + sme_deals) * 100), 1)
        ELSE 0 
      END
    ),
    'payment_insights', jsonb_build_object(
      'gcash_adoption', gcash_payments,
      'preferred_local_methods', CASE 
        WHEN gcash_payments > 0 THEN 'gcash_popular'
        ELSE 'traditional_methods'
      END
    ),
    'relationship_insights', relationship_strength_stats,
    'recommendations', get_philippines_recommendations(org_id)
  );
  
  RETURN result;
END;
$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get business recommendations for Philippine market
CREATE OR REPLACE FUNCTION get_philippines_recommendations(org_id UUID)
RETURNS TEXT[] AS $
DECLARE
  recommendations TEXT[] := ARRAY[]::TEXT[];
  overdue_tasks INTEGER;
  low_relationship_deals INTEGER;
  high_value_deals INTEGER;
BEGIN
  -- Check for overdue follow-ups (critical in relationship-driven culture)
  SELECT COUNT(*) INTO overdue_tasks
  FROM tasks
  WHERE organization_id = org_id 
    AND status = 'pending'
    AND due_date < CURRENT_DATE;
  
  IF overdue_tasks > 0 THEN
    recommendations := recommendations || ARRAY['Filipino business culture values relationships - you have ' || overdue_tasks || ' overdue follow-ups that need immediate attention'];
  END IF;
  
  -- Check for deals with weak relationships
  SELECT COUNT(*) INTO low_relationship_deals
  FROM deals
  WHERE organization_id = org_id 
    AND relationship_strength = 'new'
    AND stage NOT IN ('closed', 'lost')
    AND created_at < NOW() - INTERVAL '7 days';
  
  IF low_relationship_deals > 0 THEN
    recommendations := recommendations || ARRAY['Consider scheduling personal meetings for ' || low_relationship_deals || ' deals - Filipino business culture values face-to-face relationships'];
  END IF;
  
  -- Check for high-value deals without recent activity
  SELECT COUNT(*) INTO high_value_deals
  FROM deals d
  WHERE d.organization_id = org_id 
    AND d.value_php > 50000
    AND d.stage NOT IN ('closed', 'lost')
    AND NOT EXISTS (
      SELECT 1 FROM activities a 
      WHERE a.deal_id = d.id 
        AND a.activity_date > NOW() - INTERVAL '5 days'
    );
  
  IF high_value_deals > 0 THEN
    recommendations := recommendations || ARRAY['High-value deals need regular attention - schedule follow-ups for ' || high_value_deals || ' deals worth over ₱50,000'];
  END IF;
  
  -- Always include cultural recommendations
  recommendations := recommendations || 
    ARRAY[
      'Schedule regular check-ins - Filipino business relationships thrive on consistent communication',
      'Consider personal occasions (birthdays, holidays) for stronger client relationships',
      'Document family and personal details in contact notes - relationship-building is key in PH business'
    ];
  
  RETURN recommendations;
END;
$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to format Philippine mobile numbers
CREATE OR REPLACE FUNCTION format_ph_mobile(phone_input TEXT)
RETURNS TEXT AS $
BEGIN
  -- Remove all non-digits
  phone_input := REGEXP_REPLACE(phone_input, '[^0-9]', '', 'g');
  
  -- Handle different Philippine mobile formats
  CASE 
    -- Globe/TM numbers starting with 09
    WHEN phone_input ~ '^09[0-9]{9}
      payment_method := 'gcash';
      
    WHEN 'manual' THEN
      -- Manual payment verification (bank transfer, over-the-counter)
      transaction_id := webhook_data->>'reference_number';
      amount := (webhook_data->>'amount')::DECIMAL;
      status := webhook_data->>'status';
      payment_method := webhook_data->>'payment_method';
      
    ELSE
      RAISE EXCEPTION 'Unsupported payment provider: %', provider;
  END CASE;
  
  -- Find organization by external customer ID or subscription ID
  SELECT s.organization_id, s.* INTO org_id, subscription_record
  FROM subscriptions s
  WHERE s.external_subscription_id = webhook_data->>'subscription_id'
     OR s.external_customer_id = webhook_data->>'customer_id'
  LIMIT 1;
  
  -- Log the payment transaction
  INSERT INTO payment_transactions (
    organization_id,
    subscription_id,
    external_transaction_id,
    payment_provider,
    amount_php,
    status,
    payment_method,
    transaction_date,
    paid_at,
    metadata
  ) VALUES (
    org_id,
    subscription_record.id,
    transaction_id,
    provider,
    amount,
    status,
    payment_method,
    NOW(),
    CASE WHEN status IN ('paid', 'successful', 'completed') THEN NOW() ELSE NULL END,
    webhook_data
  );
  
  -- Update subscription status based on payment
  IF status IN ('paid', 'successful', 'completed') THEN
    UPDATE subscriptions SET
      status = 'active',
      last_payment_at = NOW(),
      next_billing_date = CASE 
        WHEN billing_interval = 'monthly' THEN NOW() + INTERVAL '1 month'
        WHEN billing_interval = 'yearly' THEN NOW() + INTERVAL '1 year'
      END,
      updated_at = NOW()
    WHERE id = subscription_record.id;
    
  ELSIF status IN ('failed', 'cancelled', 'declined') THEN
    UPDATE subscriptions SET
      status = 'past_due',
      updated_at = NOW()
    WHERE id = subscription_record.id;
  END IF;
  
  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error for debugging but don't fail the webhook
    RAISE LOG 'Payment webhook error: %', SQLERRM;
    RETURN FALSE;
END;
$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create PayMongo payment intent
CREATE OR REPLACE FUNCTION create_paymongo_payment_intent(
  org_id UUID,
  plan_name TEXT,
  amount_php DECIMAL,
  payment_method_types TEXT[] DEFAULT ARRAY['card', 'gcash', 'maya']
)
RETURNS JSONB AS $
DECLARE
  org_record RECORD;
  intent_data JSONB;
BEGIN
  -- Get organization details
  SELECT * INTO org_record FROM organizations WHERE id = org_id;
  
  -- Prepare PayMongo payment intent data
  intent_data := jsonb_build_object(
    'data', jsonb_build_object(
      'attributes', jsonb_build_object(
        'amount', (amount_php * 100)::INTEGER, -- PayMongo expects cents
        'currency', 'PHP',
        'payment_method_allowed', payment_method_types,
        'capture_type', 'automatic',
        'description', 'CRM Subscription: ' || plan_name,
        'statement_descriptor', 'CRM-PH',
        'metadata', jsonb_build_object(
          'organization_id', org_id,
          'plan_name', plan_name,
          'billing_email', org_record.billing_email
        )
      )
    )
  );
  
  RETURN intent_data;
END;
$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to handle GCash payment flow
CREATE OR REPLACE FUNCTION create_gcash_payment_request(
  org_id UUID,
  plan_name TEXT,
  amount_php DECIMAL,
  gcash_number TEXT
)
RETURNS JSONB AS $
DECLARE
  org_record RECORD;
  payment_data JSONB;
  reference_number TEXT;
BEGIN
  -- Get organization details
  SELECT * INTO org_record FROM organizations WHERE id = org_id;
  
  -- Generate reference number
  reference_number := 'CRM-' || UPPER(SUBSTRING(org_id::TEXT, 1, 8)) || '-' || 
                     TO_CHAR(NOW(), 'YYYYMMDD') || '-' || 
                     LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
  
  -- Prepare GCash payment request data
  payment_data := jsonb_build_object(
    'reference_number', reference_number,
    'amount', amount_php,
    'currency', 'PHP',
    'description', 'CRM Subscription: ' || plan_name,
    'gcash_number', gcash_number,
    'organization_id', org_id,
    'plan_name', plan_name,
    'billing_email', org_record.billing_email,
    'payment_method', 'gcash',
    'status', 'pending',
    'expires_at', NOW() + INTERVAL '24 hours' -- GCash payments expire in 24 hours
  );
  
  -- Log the pending payment
  INSERT INTO payment_transactions (
    organization_id,
    external_transaction_id,
    payment_provider,
    amount_php,
    status,
    payment_method,
    transaction_date,
    description,
    metadata
  ) VALUES (
    org_id,
    reference_number,
    'gcash',
    amount_php,
    'pending',
    'gcash',
    NOW(),
    'CRM Subscription: ' || plan_name,
    payment_data
  );
  
  RETURN payment_data;
END;
$ LANGUAGE plpgsql SECURITY DEFINER; THEN
      RETURN '+63' || SUBSTRING(phone_input FROM 2);
    -- Already in +63 format
    WHEN phone_input ~ '^63[0-9]{10}
      payment_method := 'gcash';
      
    WHEN 'manual' THEN
      -- Manual payment verification (bank transfer, over-the-counter)
      transaction_id := webhook_data->>'reference_number';
      amount := (webhook_data->>'amount')::DECIMAL;
      status := webhook_data->>'status';
      payment_method := webhook_data->>'payment_method';
      
    ELSE
      RAISE EXCEPTION 'Unsupported payment provider: %', provider;
  END CASE;
  
  -- Find organization by external customer ID or subscription ID
  SELECT s.organization_id, s.* INTO org_id, subscription_record
  FROM subscriptions s
  WHERE s.external_subscription_id = webhook_data->>'subscription_id'
     OR s.external_customer_id = webhook_data->>'customer_id'
  LIMIT 1;
  
  -- Log the payment transaction
  INSERT INTO payment_transactions (
    organization_id,
    subscription_id,
    external_transaction_id,
    payment_provider,
    amount_php,
    status,
    payment_method,
    transaction_date,
    paid_at,
    metadata
  ) VALUES (
    org_id,
    subscription_record.id,
    transaction_id,
    provider,
    amount,
    status,
    payment_method,
    NOW(),
    CASE WHEN status IN ('paid', 'successful', 'completed') THEN NOW() ELSE NULL END,
    webhook_data
  );
  
  -- Update subscription status based on payment
  IF status IN ('paid', 'successful', 'completed') THEN
    UPDATE subscriptions SET
      status = 'active',
      last_payment_at = NOW(),
      next_billing_date = CASE 
        WHEN billing_interval = 'monthly' THEN NOW() + INTERVAL '1 month'
        WHEN billing_interval = 'yearly' THEN NOW() + INTERVAL '1 year'
      END,
      updated_at = NOW()
    WHERE id = subscription_record.id;
    
  ELSIF status IN ('failed', 'cancelled', 'declined') THEN
    UPDATE subscriptions SET
      status = 'past_due',
      updated_at = NOW()
    WHERE id = subscription_record.id;
  END IF;
  
  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error for debugging but don't fail the webhook
    RAISE LOG 'Payment webhook error: %', SQLERRM;
    RETURN FALSE;
END;
$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create PayMongo payment intent
CREATE OR REPLACE FUNCTION create_paymongo_payment_intent(
  org_id UUID,
  plan_name TEXT,
  amount_php DECIMAL,
  payment_method_types TEXT[] DEFAULT ARRAY['card', 'gcash', 'maya']
)
RETURNS JSONB AS $
DECLARE
  org_record RECORD;
  intent_data JSONB;
BEGIN
  -- Get organization details
  SELECT * INTO org_record FROM organizations WHERE id = org_id;
  
  -- Prepare PayMongo payment intent data
  intent_data := jsonb_build_object(
    'data', jsonb_build_object(
      'attributes', jsonb_build_object(
        'amount', (amount_php * 100)::INTEGER, -- PayMongo expects cents
        'currency', 'PHP',
        'payment_method_allowed', payment_method_types,
        'capture_type', 'automatic',
        'description', 'CRM Subscription: ' || plan_name,
        'statement_descriptor', 'CRM-PH',
        'metadata', jsonb_build_object(
          'organization_id', org_id,
          'plan_name', plan_name,
          'billing_email', org_record.billing_email
        )
      )
    )
  );
  
  RETURN intent_data;
END;
$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to handle GCash payment flow
CREATE OR REPLACE FUNCTION create_gcash_payment_request(
  org_id UUID,
  plan_name TEXT,
  amount_php DECIMAL,
  gcash_number TEXT
)
RETURNS JSONB AS $
DECLARE
  org_record RECORD;
  payment_data JSONB;
  reference_number TEXT;
BEGIN
  -- Get organization details
  SELECT * INTO org_record FROM organizations WHERE id = org_id;
  
  -- Generate reference number
  reference_number := 'CRM-' || UPPER(SUBSTRING(org_id::TEXT, 1, 8)) || '-' || 
                     TO_CHAR(NOW(), 'YYYYMMDD') || '-' || 
                     LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
  
  -- Prepare GCash payment request data
  payment_data := jsonb_build_object(
    'reference_number', reference_number,
    'amount', amount_php,
    'currency', 'PHP',
    'description', 'CRM Subscription: ' || plan_name,
    'gcash_number', gcash_number,
    'organization_id', org_id,
    'plan_name', plan_name,
    'billing_email', org_record.billing_email,
    'payment_method', 'gcash',
    'status', 'pending',
    'expires_at', NOW() + INTERVAL '24 hours' -- GCash payments expire in 24 hours
  );
  
  -- Log the pending payment
  INSERT INTO payment_transactions (
    organization_id,
    external_transaction_id,
    payment_provider,
    amount_php,
    status,
    payment_method,
    transaction_date,
    description,
    metadata
  ) VALUES (
    org_id,
    reference_number,
    'gcash',
    amount_php,
    'pending',
    'gcash',
    NOW(),
    'CRM Subscription: ' || plan_name,
    payment_data
  );
  
  RETURN payment_data;
END;
$ LANGUAGE plpgsql SECURITY DEFINER; THEN
      RETURN '+' || phone_input;
    -- International format without +
    WHEN phone_input ~ '^639[0-9]{9}
      payment_method := 'gcash';
      
    WHEN 'manual' THEN
      -- Manual payment verification (bank transfer, over-the-counter)
      transaction_id := webhook_data->>'reference_number';
      amount := (webhook_data->>'amount')::DECIMAL;
      status := webhook_data->>'status';
      payment_method := webhook_data->>'payment_method';
      
    ELSE
      RAISE EXCEPTION 'Unsupported payment provider: %', provider;
  END CASE;
  
  -- Find organization by external customer ID or subscription ID
  SELECT s.organization_id, s.* INTO org_id, subscription_record
  FROM subscriptions s
  WHERE s.external_subscription_id = webhook_data->>'subscription_id'
     OR s.external_customer_id = webhook_data->>'customer_id'
  LIMIT 1;
  
  -- Log the payment transaction
  INSERT INTO payment_transactions (
    organization_id,
    subscription_id,
    external_transaction_id,
    payment_provider,
    amount_php,
    status,
    payment_method,
    transaction_date,
    paid_at,
    metadata
  ) VALUES (
    org_id,
    subscription_record.id,
    transaction_id,
    provider,
    amount,
    status,
    payment_method,
    NOW(),
    CASE WHEN status IN ('paid', 'successful', 'completed') THEN NOW() ELSE NULL END,
    webhook_data
  );
  
  -- Update subscription status based on payment
  IF status IN ('paid', 'successful', 'completed') THEN
    UPDATE subscriptions SET
      status = 'active',
      last_payment_at = NOW(),
      next_billing_date = CASE 
        WHEN billing_interval = 'monthly' THEN NOW() + INTERVAL '1 month'
        WHEN billing_interval = 'yearly' THEN NOW() + INTERVAL '1 year'
      END,
      updated_at = NOW()
    WHERE id = subscription_record.id;
    
  ELSIF status IN ('failed', 'cancelled', 'declined') THEN
    UPDATE subscriptions SET
      status = 'past_due',
      updated_at = NOW()
    WHERE id = subscription_record.id;
  END IF;
  
  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error for debugging but don't fail the webhook
    RAISE LOG 'Payment webhook error: %', SQLERRM;
    RETURN FALSE;
END;
$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create PayMongo payment intent
CREATE OR REPLACE FUNCTION create_paymongo_payment_intent(
  org_id UUID,
  plan_name TEXT,
  amount_php DECIMAL,
  payment_method_types TEXT[] DEFAULT ARRAY['card', 'gcash', 'maya']
)
RETURNS JSONB AS $
DECLARE
  org_record RECORD;
  intent_data JSONB;
BEGIN
  -- Get organization details
  SELECT * INTO org_record FROM organizations WHERE id = org_id;
  
  -- Prepare PayMongo payment intent data
  intent_data := jsonb_build_object(
    'data', jsonb_build_object(
      'attributes', jsonb_build_object(
        'amount', (amount_php * 100)::INTEGER, -- PayMongo expects cents
        'currency', 'PHP',
        'payment_method_allowed', payment_method_types,
        'capture_type', 'automatic',
        'description', 'CRM Subscription: ' || plan_name,
        'statement_descriptor', 'CRM-PH',
        'metadata', jsonb_build_object(
          'organization_id', org_id,
          'plan_name', plan_name,
          'billing_email', org_record.billing_email
        )
      )
    )
  );
  
  RETURN intent_data;
END;
$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to handle GCash payment flow
CREATE OR REPLACE FUNCTION create_gcash_payment_request(
  org_id UUID,
  plan_name TEXT,
  amount_php DECIMAL,
  gcash_number TEXT
)
RETURNS JSONB AS $
DECLARE
  org_record RECORD;
  payment_data JSONB;
  reference_number TEXT;
BEGIN
  -- Get organization details
  SELECT * INTO org_record FROM organizations WHERE id = org_id;
  
  -- Generate reference number
  reference_number := 'CRM-' || UPPER(SUBSTRING(org_id::TEXT, 1, 8)) || '-' || 
                     TO_CHAR(NOW(), 'YYYYMMDD') || '-' || 
                     LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
  
  -- Prepare GCash payment request data
  payment_data := jsonb_build_object(
    'reference_number', reference_number,
    'amount', amount_php,
    'currency', 'PHP',
    'description', 'CRM Subscription: ' || plan_name,
    'gcash_number', gcash_number,
    'organization_id', org_id,
    'plan_name', plan_name,
    'billing_email', org_record.billing_email,
    'payment_method', 'gcash',
    'status', 'pending',
    'expires_at', NOW() + INTERVAL '24 hours' -- GCash payments expire in 24 hours
  );
  
  -- Log the pending payment
  INSERT INTO payment_transactions (
    organization_id,
    external_transaction_id,
    payment_provider,
    amount_php,
    status,
    payment_method,
    transaction_date,
    description,
    metadata
  ) VALUES (
    org_id,
    reference_number,
    'gcash',
    amount_php,
    'pending',
    'gcash',
    NOW(),
    'CRM Subscription: ' || plan_name,
    payment_data
  );
  
  RETURN payment_data;
END;
$ LANGUAGE plpgsql SECURITY DEFINER; THEN
      RETURN '+' || phone_input;
    -- Landline format (2-8 digits area code + 7 digits)
    WHEN phone_input ~ '^0[2-8][0-9]{6,8}
      payment_method := 'gcash';
      
    WHEN 'manual' THEN
      -- Manual payment verification (bank transfer, over-the-counter)
      transaction_id := webhook_data->>'reference_number';
      amount := (webhook_data->>'amount')::DECIMAL;
      status := webhook_data->>'status';
      payment_method := webhook_data->>'payment_method';
      
    ELSE
      RAISE EXCEPTION 'Unsupported payment provider: %', provider;
  END CASE;
  
  -- Find organization by external customer ID or subscription ID
  SELECT s.organization_id, s.* INTO org_id, subscription_record
  FROM subscriptions s
  WHERE s.external_subscription_id = webhook_data->>'subscription_id'
     OR s.external_customer_id = webhook_data->>'customer_id'
  LIMIT 1;
  
  -- Log the payment transaction
  INSERT INTO payment_transactions (
    organization_id,
    subscription_id,
    external_transaction_id,
    payment_provider,
    amount_php,
    status,
    payment_method,
    transaction_date,
    paid_at,
    metadata
  ) VALUES (
    org_id,
    subscription_record.id,
    transaction_id,
    provider,
    amount,
    status,
    payment_method,
    NOW(),
    CASE WHEN status IN ('paid', 'successful', 'completed') THEN NOW() ELSE NULL END,
    webhook_data
  );
  
  -- Update subscription status based on payment
  IF status IN ('paid', 'successful', 'completed') THEN
    UPDATE subscriptions SET
      status = 'active',
      last_payment_at = NOW(),
      next_billing_date = CASE 
        WHEN billing_interval = 'monthly' THEN NOW() + INTERVAL '1 month'
        WHEN billing_interval = 'yearly' THEN NOW() + INTERVAL '1 year'
      END,
      updated_at = NOW()
    WHERE id = subscription_record.id;
    
  ELSIF status IN ('failed', 'cancelled', 'declined') THEN
    UPDATE subscriptions SET
      status = 'past_due',
      updated_at = NOW()
    WHERE id = subscription_record.id;
  END IF;
  
  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error for debugging but don't fail the webhook
    RAISE LOG 'Payment webhook error: %', SQLERRM;
    RETURN FALSE;
END;
$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create PayMongo payment intent
CREATE OR REPLACE FUNCTION create_paymongo_payment_intent(
  org_id UUID,
  plan_name TEXT,
  amount_php DECIMAL,
  payment_method_types TEXT[] DEFAULT ARRAY['card', 'gcash', 'maya']
)
RETURNS JSONB AS $
DECLARE
  org_record RECORD;
  intent_data JSONB;
BEGIN
  -- Get organization details
  SELECT * INTO org_record FROM organizations WHERE id = org_id;
  
  -- Prepare PayMongo payment intent data
  intent_data := jsonb_build_object(
    'data', jsonb_build_object(
      'attributes', jsonb_build_object(
        'amount', (amount_php * 100)::INTEGER, -- PayMongo expects cents
        'currency', 'PHP',
        'payment_method_allowed', payment_method_types,
        'capture_type', 'automatic',
        'description', 'CRM Subscription: ' || plan_name,
        'statement_descriptor', 'CRM-PH',
        'metadata', jsonb_build_object(
          'organization_id', org_id,
          'plan_name', plan_name,
          'billing_email', org_record.billing_email
        )
      )
    )
  );
  
  RETURN intent_data;
END;
$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to handle GCash payment flow
CREATE OR REPLACE FUNCTION create_gcash_payment_request(
  org_id UUID,
  plan_name TEXT,
  amount_php DECIMAL,
  gcash_number TEXT
)
RETURNS JSONB AS $
DECLARE
  org_record RECORD;
  payment_data JSONB;
  reference_number TEXT;
BEGIN
  -- Get organization details
  SELECT * INTO org_record FROM organizations WHERE id = org_id;
  
  -- Generate reference number
  reference_number := 'CRM-' || UPPER(SUBSTRING(org_id::TEXT, 1, 8)) || '-' || 
                     TO_CHAR(NOW(), 'YYYYMMDD') || '-' || 
                     LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
  
  -- Prepare GCash payment request data
  payment_data := jsonb_build_object(
    'reference_number', reference_number,
    'amount', amount_php,
    'currency', 'PHP',
    'description', 'CRM Subscription: ' || plan_name,
    'gcash_number', gcash_number,
    'organization_id', org_id,
    'plan_name', plan_name,
    'billing_email', org_record.billing_email,
    'payment_method', 'gcash',
    'status', 'pending',
    'expires_at', NOW() + INTERVAL '24 hours' -- GCash payments expire in 24 hours
  );
  
  -- Log the pending payment
  INSERT INTO payment_transactions (
    organization_id,
    external_transaction_id,
    payment_provider,
    amount_php,
    status,
    payment_method,
    transaction_date,
    description,
    metadata
  ) VALUES (
    org_id,
    reference_number,
    'gcash',
    amount_php,
    'pending',
    'gcash',
    NOW(),
    'CRM Subscription: ' || plan_name,
    payment_data
  );
  
  RETURN payment_data;
END;
$ LANGUAGE plpgsql SECURITY DEFINER; THEN
      RETURN '+63' || SUBSTRING(phone_input FROM 2);
    ELSE
      RETURN phone_input; -- Return as-is if format not recognized
  END CASE;
END;
$ LANGUAGE plpgsql IMMUTABLE;

-- Trigger to auto-format Philippine phone numbers
CREATE OR REPLACE FUNCTION auto_format_ph_phones()
RETURNS TRIGGER AS $
BEGIN
  IF NEW.mobile_number IS NOT NULL THEN
    NEW.mobile_number := format_ph_mobile(NEW.mobile_number);
  END IF;
  
  IF NEW.phone IS NOT NULL THEN
    NEW.phone := format_ph_mobile(NEW.phone);
  END IF;
  
  RETURN NEW;
END;
$ LANGUAGE plpgsql;

CREATE TRIGGER format_contact_phones
  BEFORE INSERT OR UPDATE ON contacts
  FOR EACH ROW EXECUTE FUNCTION auto_format_ph_phones();
      payment_method := 'gcash';
      
    WHEN 'manual' THEN
      -- Manual payment verification (bank transfer, over-the-counter)
      transaction_id := webhook_data->>'reference_number';
      amount := (webhook_data->>'amount')::DECIMAL;
      status := webhook_data->>'status';
      payment_method := webhook_data->>'payment_method';
      
    ELSE
      RAISE EXCEPTION 'Unsupported payment provider: %', provider;
  END CASE;
  
  -- Find organization by external customer ID or subscription ID
  SELECT s.organization_id, s.* INTO org_id, subscription_record
  FROM subscriptions s
  WHERE s.external_subscription_id = webhook_data->>'subscription_id'
     OR s.external_customer_id = webhook_data->>'customer_id'
  LIMIT 1;
  
  -- Log the payment transaction
  INSERT INTO payment_transactions (
    organization_id,
    subscription_id,
    external_transaction_id,
    payment_provider,
    amount_php,
    status,
    payment_method,
    transaction_date,
    paid_at,
    metadata
  ) VALUES (
    org_id,
    subscription_record.id,
    transaction_id,
    provider,
    amount,
    status,
    payment_method,
    NOW(),
    CASE WHEN status IN ('paid', 'successful', 'completed') THEN NOW() ELSE NULL END,
    webhook_data
  );
  
  -- Update subscription status based on payment
  IF status IN ('paid', 'successful', 'completed') THEN
    UPDATE subscriptions SET
      status = 'active',
      last_payment_at = NOW(),
      next_billing_date = CASE 
        WHEN billing_interval = 'monthly' THEN NOW() + INTERVAL '1 month'
        WHEN billing_interval = 'yearly' THEN NOW() + INTERVAL '1 year'
      END,
      updated_at = NOW()
    WHERE id = subscription_record.id;
    
  ELSIF status IN ('failed', 'cancelled', 'declined') THEN
    UPDATE subscriptions SET
      status = 'past_due',
      updated_at = NOW()
    WHERE id = subscription_record.id;
  END IF;
  
  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error for debugging but don't fail the webhook
    RAISE LOG 'Payment webhook error: %', SQLERRM;
    RETURN FALSE;
END;
$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create PayMongo payment intent
CREATE OR REPLACE FUNCTION create_paymongo_payment_intent(
  org_id UUID,
  plan_name TEXT,
  amount_php DECIMAL,
  payment_method_types TEXT[] DEFAULT ARRAY['card', 'gcash', 'maya']
)
RETURNS JSONB AS $
DECLARE
  org_record RECORD;
  intent_data JSONB;
BEGIN
  -- Get organization details
  SELECT * INTO org_record FROM organizations WHERE id = org_id;
  
  -- Prepare PayMongo payment intent data
  intent_data := jsonb_build_object(
    'data', jsonb_build_object(
      'attributes', jsonb_build_object(
        'amount', (amount_php * 100)::INTEGER, -- PayMongo expects cents
        'currency', 'PHP',
        'payment_method_allowed', payment_method_types,
        'capture_type', 'automatic',
        'description', 'CRM Subscription: ' || plan_name,
        'statement_descriptor', 'CRM-PH',
        'metadata', jsonb_build_object(
          'organization_id', org_id,
          'plan_name', plan_name,
          'billing_email', org_record.billing_email
        )
      )
    )
  );
  
  RETURN intent_data;
END;
$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to handle GCash payment flow
CREATE OR REPLACE FUNCTION create_gcash_payment_request(
  org_id UUID,
  plan_name TEXT,
  amount_php DECIMAL,
  gcash_number TEXT
)
RETURNS JSONB AS $
DECLARE
  org_record RECORD;
  payment_data JSONB;
  reference_number TEXT;
BEGIN
  -- Get organization details
  SELECT * INTO org_record FROM organizations WHERE id = org_id;
  
  -- Generate reference number
  reference_number := 'CRM-' || UPPER(SUBSTRING(org_id::TEXT, 1, 8)) || '-' || 
                     TO_CHAR(NOW(), 'YYYYMMDD') || '-' || 
                     LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
  
  -- Prepare GCash payment request data
  payment_data := jsonb_build_object(
    'reference_number', reference_number,
    'amount', amount_php,
    'currency', 'PHP',
    'description', 'CRM Subscription: ' || plan_name,
    'gcash_number', gcash_number,
    'organization_id', org_id,
    'plan_name', plan_name,
    'billing_email', org_record.billing_email,
    'payment_method', 'gcash',
    'status', 'pending',
    'expires_at', NOW() + INTERVAL '24 hours' -- GCash payments expire in 24 hours
  );
  
  -- Log the pending payment
  INSERT INTO payment_transactions (
    organization_id,
    external_transaction_id,
    payment_provider,
    amount_php,
    status,
    payment_method,
    transaction_date,
    description,
    metadata
  ) VALUES (
    org_id,
    reference_number,
    'gcash',
    amount_php,
    'pending',
    'gcash',
    NOW(),
    'CRM Subscription: ' || plan_name,
    payment_data
  );
  
  RETURN payment_data;
END;
$ LANGUAGE plpgsql SECURITY DEFINER;