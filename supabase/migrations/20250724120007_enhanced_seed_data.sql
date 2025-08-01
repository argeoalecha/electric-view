-- supabase/migrations/20250724120007_enhanced_seed_data.sql
-- Enhanced seed data with Philippine market focus and lead scoring

-- Clear existing seed data to avoid conflicts
DELETE FROM activities;
DELETE FROM deals;
DELETE FROM contacts;
DELETE FROM companies;
DELETE FROM organizations WHERE name LIKE '%Demo%' OR name LIKE '%Sample%';

-- Create sample organization for testing
INSERT INTO organizations (id, name, slug, subscription_tier, billing_email, business_type, city, province, currency, timezone) VALUES
('demo-org-1111-1111-1111-111111111111', 'Demo CRM Company', 'demo-crm', 'basic', 'admin@democrm.ph', 'corporation', 'Makati', 'Metro Manila', 'PHP', 'Asia/Manila');

-- Create sample user profile
INSERT INTO profiles (id, organization_id, email, full_name, role, phone, position, preferred_language) VALUES
('demo-user-1111-1111-1111-111111111111', 'demo-org-1111-1111-1111-111111111111', 'demo@democrm.ph', 'Juan Dela Cruz', 'owner', '+639171234567', 'Sales Manager', 'en');

-- Enhanced Philippine companies with realistic data
INSERT INTO companies (id, organization_id, name, industry, size_category, business_type, address, city, province, website, annual_revenue_php, employee_count, main_products_services) VALUES
-- Metro Manila companies (higher lead scores)
('comp-1111-1111-1111-1111-111111111111', 'demo-org-1111-1111-1111-111111111111', 'Ayala Land Inc.', 'Real Estate', 'enterprise', 'corporation', '6750 Ayala Avenue', 'Makati', 'Metro Manila', 'www.ayalaland.com.ph', 50000000000.00, 8000, 'Real estate development, property management'),
('comp-2222-2222-2222-2222-222222222222', 'demo-org-1111-1111-1111-111111111111', 'TechStart Manila', 'Technology', 'startup', 'corporation', '123 BGC Central', 'Taguig', 'Metro Manila', 'www.techstartmla.ph', 5000000.00, 25, 'SaaS development, mobile apps'),
('comp-3333-3333-3333-3333-333333333333', 'demo-org-1111-1111-1111-111111111111', 'SM Retail Group', 'Retail', 'enterprise', 'corporation', 'Mall of Asia Complex', 'Pasay', 'Metro Manila', 'www.sminvestments.com', 25000000000.00, 15000, 'Retail, shopping malls'),
-- Regional companies (lower lead scores but good potential)
('comp-4444-4444-4444-4444-444444444444', 'demo-org-1111-1111-1111-111111111111', 'Cebu Manufacturing Corp', 'Manufacturing', 'medium', 'corporation', 'Lapu-Lapu Industrial Park', 'Lapu-Lapu', 'Cebu', 'www.cebumanuf.ph', 500000000.00, 200, 'Electronics manufacturing'),
('comp-5555-5555-5555-5555-555555555555', 'demo-org-1111-1111-1111-111111111111', 'Davao Agri Solutions', 'Agriculture', 'small', 'partnership', 'Davao City Proper', 'Davao City', 'Davao del Sur', NULL, 50000000.00, 50, 'Agricultural products, farming equipment');

-- Enhanced contacts with Philippine naming conventions and details
INSERT INTO contacts (id, organization_id, company_id, first_name, middle_name, last_name, preferred_name, email, mobile_number, landline, job_title, personal_notes, birthday, is_decision_maker, preferred_contact_method, tags, social_media) VALUES
-- High-value decision makers (higher lead scores)
('cont-1111-1111-1111-1111-111111111111', 'demo-org-1111-1111-1111-111111111111', 'comp-1111-1111-1111-1111-111111111111', 'Maria', 'Santos', 'Fernandez', 'Ria', 'maria.fernandez@ayalaland.com.ph', '+639171234567', '(02) 8845-1234', 'Vice President - Business Development', 'Very relationship-focused. Prefers face-to-face meetings. Has 2 kids in college.', '1975-06-15', TRUE, 'phone', ARRAY['decision_maker', 'high_value', 'relationship_builder'], '{"linkedin": "maria-fernandez-ayala", "facebook": "maria.santos.fernandez"}'),

('cont-2222-2222-2222-2222-222222222222', 'demo-org-1111-1111-1111-111111111111', 'comp-2222-2222-2222-2222-222222222222', 'Jose', 'Miguel', 'Reyes', 'Mike', 'jose.reyes@techstartmla.ph', '+639287654321', NULL, 'Chief Technology Officer', 'Tech-savvy, prefers email communication. Early adopter of new technologies.', '1988-03-22', TRUE, 'email', ARRAY['tech_savvy', 'startup', 'decision_maker'], '{"linkedin": "jose-reyes-cto", "github": "jmreyes"}'),

('cont-3333-3333-3333-3333-333333333333', 'demo-org-1111-1111-1111-111111111111', 'comp-3333-3333-3333-3333-333333333333', 'Carmen', 'Dela', 'Cruz', 'Car', 'carmen.delacruz@sm.com.ph', '+639456789012', '(02) 8123-4567', 'Senior Manager - Operations', 'Detail-oriented. Likes to involve team in decisions. Celebrates Christmas early.', '1980-12-03', FALSE, 'email', ARRAY['operations', 'team_player'], '{"facebook": "carmen.delacruz.sm"}'),

-- Regional contacts
('cont-4444-4444-4444-4444-444444444444', 'demo-org-1111-1111-1111-111111111111', 'comp-4444-4444-4444-4444-444444444444', 'Roberto', 'Lagman', 'Santos', 'Bert', 'roberto.santos@cebumanuf.ph', '+639321234567', '(032) 123-4567', 'Plant Manager', 'Prefers Cebuano in casual conversation. Very punctual with meetings.', '1972-08-18', TRUE, 'phone', ARRAY['regional', 'manufacturing', 'decision_maker'], '{"facebook": "bert.santos.cebu"}'),

('cont-5555-5555-5555-5555-555555555555', 'demo-org-1111-1111-1111-111111111111', 'comp-5555-5555-5555-5555-555555555555', 'Ana', 'Marie', 'Gonzales', 'Annie', 'ana.gonzales@davaoagri.ph', '+639876543210', NULL, 'Business Owner', 'Family business owner. Prefers personal relationships over formal presentations.', '1970-11-25', TRUE, 'sms', ARRAY['family_business', 'agriculture', 'decision_maker'], '{"facebook": "annie.gonzales.davao"}');

-- Realistic deals with Philippine market characteristics
INSERT INTO deals (id, organization_id, contact_id, company_id, title, value_php, stage, probability, lead_source, expected_close_date, relationship_strength, next_action, next_action_date, notes, urgency_level) VALUES
-- High-value Metro Manila deals
('deal-1111-1111-1111-1111-111111111111', 'demo-org-1111-1111-1111-111111111111', 'cont-1111-1111-1111-1111-111111111111', 'comp-1111-1111-1111-1111-111111111111', 'Ayala Land CRM Implementation', 2500000.00, 'proposal', 50, 'referral', '2024-03-15', 'developing', 'Follow up on proposal feedback', '2024-02-01', 'Large enterprise deal. Need to present to board of directors. Maria mentioned timeline is flexible but budget is confirmed.', 'high'),

('deal-2222-2222-2222-2222-222222222222', 'demo-org-1111-1111-1111-111111111111', 'cont-2222-2222-2222-2222-222222222222', 'comp-2222-2222-2222-2222-222222222222', 'TechStart Manila SaaS Integration', 750000.00, 'qualified', 25, 'website', '2024-02-28', 'strong', 'Schedule technical demo', '2024-01-30', 'Startup looking for scalable solution. Mike is very technical and wants to see API capabilities.', 'medium'),

('deal-3333-3333-3333-3333-333333333333', 'demo-org-1111-1111-1111-111111111111', 'cont-3333-3333-3333-3333-333333333333', 'comp-3333-3333-3333-3333-333333333333', 'SM Retail Multi-location CRM', 5000000.00, 'lead', 10, 'cold_outreach', '2024-04-30', 'new', 'Send case study materials', '2024-01-25', 'Massive potential but long sales cycle. Need to build relationship with operations team first.', 'low'),

-- Regional deals
('deal-4444-4444-4444-4444-444444444444', 'demo-org-1111-1111-1111-111111111111', 'cont-4444-4444-4444-4444-444444444444', 'comp-4444-4444-4444-4444-444444444444', 'Cebu Manufacturing Process Optimization', 1200000.00, 'proposal', 50, 'trade_show', '2024-02-15', 'strong', 'Present final proposal to management', '2024-01-28', 'Bert is convinced but needs to get approval from head office in Manila. Good relationship established.', 'high'),

('deal-5555-5555-5555-5555-555555555555', 'demo-org-1111-1111-1111-111111111111', 'cont-5555-5555-5555-5555-555555555555', 'comp-5555-5555-5555-5555-555555555555', 'Davao Agri Digital Transformation', 300000.00, 'qualified', 25, 'referral', '2024-03-01', 'developing', 'Visit farm operations next week', '2024-01-29', 'Family business wants to modernize. Annie is interested but husband needs to approve major decisions.', 'medium');

-- Realistic activities showing Philippine business culture
INSERT INTO activities (id, organization_id, deal_id, contact_id, created_by, type, description, activity_date, outcome, follow_up_required, follow_up_date, duration_minutes, location) VALUES
-- Relationship-building activities
('act-1111-1111-1111-1111-111111111111', 'demo-org-1111-1111-1111-111111111111', 'deal-1111-1111-1111-1111-111111111111', 'cont-1111-1111-1111-1111-111111111111', 'demo-user-1111-1111-1111-111111111111', 'meeting', 'Initial meeting at Ayala Tower. Discussed CRM needs over merienda. Maria mentioned their current system is outdated and causing inefficiencies across 15 locations.', '2024-01-10 14:00:00+08', 'Very positive. Maria is interested and has budget authority.', TRUE, '2024-01-12', 90, 'Ayala Tower, Makati'),

('act-2222-2222-2222-2222-222222222222', 'demo-org-1111-1111-1111-111111111111', 'deal-1111-1111-1111-1111-111111111111', 'cont-1111-1111-1111-1111-111111111111', 'demo-user-1111-1111-1111-111111111111', 'call', 'Follow-up call. Maria confirmed budget of ₱2.5M and shared technical requirements. She wants to see a demo with her IT team present.', '2024-01-12 10:30:00+08', 'Excellent progress. Moving to proposal stage.', TRUE, '2024-01-15', 45, NULL),

('act-3333-3333-3333-3333-333333333333', 'demo-org-1111-1111-1111-111111111111', 'deal-2222-2222-2222-2222-222222222222', 'cont-2222-2222-2222-2222-222222222222', 'demo-user-1111-1111-1111-111111111111', 'email', 'Sent technical documentation and API specs. Mike requested specific integration examples with their existing Laravel backend.', '2024-01-08 09:15:00+08', 'Good engagement. Mike is technically evaluating solution.', TRUE, '2024-01-11', NULL, NULL),

('act-4444-4444-4444-4444-444444444444', 'demo-org-1111-1111-1111-111111111111', 'deal-2222-2222-2222-2222-222222222222', 'cont-2222-2222-2222-2222-222222222222', 'demo-user-1111-1111-1111-111111111111', 'meeting', 'Technical demo at TechStart Manila office in BGC. Mike and his dev team were impressed with API capabilities and scalability features.', '2024-01-11 15:00:00+08', 'Very positive technical validation. Ready for business proposal.', TRUE, '2024-01-14', 120, 'BGC, Taguig'),

('act-5555-5555-5555-5555-555555555555', 'demo-org-1111-1111-1111-111111111111', 'deal-4444-4444-4444-4444-444444444444', 'cont-4444-4444-4444-4444-444444444444', 'demo-user-1111-1111-1111-111111111111', 'call', 'Bert called to discuss implementation timeline. He mentioned they need to coordinate with their Manila head office for final approval. Very positive about moving forward.', '2024-01-13 16:00:00+08', 'Strong interest confirmed. Need Manila office approval.', TRUE, '2024-01-16', 30, NULL),

('act-6666-6666-6666-6666-666666666666', 'demo-org-1111-1111-1111-111111111111', 'deal-5555-5555-5555-5555-555555555555', 'cont-5555-5555-5555-5555-555555555555', 'demo-user-1111-1111-1111-111111111111', 'meeting', 'Farm visit in Davao. Met Annie and her husband at their main facility. Discussed how CRM could help track distributors and seasonal sales patterns.', '2024-01-09 08:00:00+08', 'Good rapport established. Husband seems interested but cautious about technology adoption.', TRUE, '2024-01-12', 180, 'Davao City'),

('act-7777-7777-7777-7777-777777777777', 'demo-org-1111-1111-1111-111111111111', 'deal-3333-3333-3333-3333-333333333333', 'cont-3333-3333-3333-3333-333333333333', 'demo-user-1111-1111-1111-111111111111', 'email', 'Sent initial CRM overview and case studies from other retail clients. Carmen requested specific ROI data for multi-location retail operations.', '2024-01-14 11:00:00+08', 'Initial interest. Needs more concrete ROI information.', TRUE, '2024-01-17', NULL, NULL);

-- Sample tasks showing Philippine follow-up culture
INSERT INTO tasks (id, organization_id, deal_id, contact_id, assigned_to, created_by, title, description, priority, status, due_date, task_type) VALUES
('task-111-1111-1111-1111-111111111111', 'demo-org-1111-1111-1111-111111111111', 'deal-1111-1111-1111-1111-111111111111', 'cont-1111-1111-1111-1111-111111111111', 'demo-user-1111-1111-1111-111111111111', 'demo-user-1111-1111-1111-111111111111', 'Prepare customized proposal for Ayala Land', 'Create detailed proposal including multi-location setup, integration requirements, and training plan. Include ROI calculations based on their 15 locations.', 'high', 'in_progress', '2024-01-28', 'proposal'),

('task-222-2222-2222-2222-222222222222', 'demo-org-1111-1111-1111-111111111111', 'deal-2222-2222-2222-2222-222222222222', 'cont-2222-2222-2222-2222-222222222222', 'demo-user-1111-1111-1111-111111111111', 'demo-user-1111-1111-1111-111111111111', 'Schedule business proposal meeting with TechStart', 'Set up meeting to present business proposal and pricing. Mike wants to involve their operations manager in the discussion.', 'high', 'pending', '2024-01-30', 'meeting'),

('task-333-3333-3333-3333-333333333333', 'demo-org-1111-1111-1111-111111111111', 'deal-4444-4444-4444-4444-444444444444', 'cont-4444-4444-4444-4444-444444444444', 'demo-user-1111-1111-1111-111111111111', 'demo-user-1111-1111-1111-111111111111', 'Follow up with Bert on Manila office approval', 'Check status of proposal review with Cebu Manufacturing head office. Bert mentioned they need Manila approval for purchases over ₱1M.', 'medium', 'pending', '2024-01-29', 'follow_up'),

('task-444-4444-4444-4444-444444444444', 'demo-org-1111-1111-1111-111111111111', 'deal-5555-5555-5555-5555-555555555555', 'cont-5555-5555-5555-5555-555555555555', 'demo-user-1111-1111-1111-111111111111', 'demo-user-1111-1111-1111-111111111111', 'Send simplified proposal to Davao Agri', 'Create easy-to-understand proposal focused on practical benefits. Annie preferred simple explanations over technical details.', 'medium', 'pending', '2024-01-31', 'proposal'),

('task-555-5555-5555-5555-555555555555', 'demo-org-1111-1111-1111-111111111111', 'deal-3333-3333-3333-3333-333333333333', 'cont-3333-3333-3333-3333-333333333333', 'demo-user-1111-1111-1111-111111111111', 'demo-user-1111-1111-1111-111111111111', 'Research SM Retail competitors and case studies', 'Find relevant case studies from similar large retail chains. Carmen wants to see how other major retailers have implemented CRM systems.', 'low', 'pending', '2024-02-05', 'other');

-- Update deal lead scores (this will trigger the scoring function)
UPDATE deals SET stage = stage WHERE organization_id = 'demo-org-1111-1111-1111-111111111111';

-- Create sample subscription for the demo organization
INSERT INTO subscriptions (
  id,
  organization_id,
  payment_provider,
  plan_name,
  plan_price_php,
  billing_interval,
  user_limit,
  contact_limit,
  status,
  current_period_start,
  current_period_end,
  trial_start,
  trial_end,
  next_billing_date
) VALUES (
  'sub-demo-1111-1111-1111-111111111111',
  'demo-org-1111-1111-1111-111111111111',
  'paymongo',
  'Basic Monthly',
  499.00,
  'monthly',
  3,
  500,
  'trialing',
  NOW(),
  NOW() + INTERVAL '1 month',
  NOW(),
  NOW() + INTERVAL '14 days',
  NOW() + INTERVAL '14 days'
);

-- Create sample payment transaction
INSERT INTO payment_transactions (
  id,
  organization_id,
  subscription_id,
  external_transaction_id,
  payment_provider,
  amount_php,
  status,
  payment_method,
  transaction_date,
  description
) VALUES (
  'txn-demo-1111-1111-1111-111111111111',
  'demo-org-1111-1111-1111-111111111111',
  'sub-demo-1111-1111-1111-111111111111',
  'demo_transaction_001',
  'paymongo',
  499.00,
  'pending',
  'gcash',
  NOW(),
  'Trial subscription - Basic Monthly Plan'
);

-- Add some data processing logs for compliance demonstration
INSERT INTO data_processing_logs (
  organization_id,
  user_id,
  action_type,
  resource_type,
  resource_id,
  purpose,
  legal_basis
) VALUES 
(
  'demo-org-1111-1111-1111-111111111111',
  'demo-user-1111-1111-1111-111111111111',
  'create',
  'contact',
  'cont-1111-1111-1111-1111-111111111111',
  'crm_operations',
  'legitimate_interest'
),
(
  'demo-org-1111-1111-1111-111111111111',
  'demo-user-1111-1111-1111-111111111111',
  'update',
  'deal',
  'deal-1111-1111-1111-1111-111111111111',
  'sales_process',
  'legitimate_interest'
);

