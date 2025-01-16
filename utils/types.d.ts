export interface SubStage {
  sub_stage_id: number;
  sub_stage_title: string;
  sub_stage_name: string;
  sub_stage_mapping: string;
  show_days_sub_stage_indicator: number;
  sub_stage_due_days: number;
  sub_stage_turn_amber: number;
  sub_stage_turn_red: number;
  sub_stage_add_stage_due_to_task: number;
  sub_stage_include_in_duration_metric: number;
}

export interface MainTask {
  main_task_id: number;
  task_name: string;
  stage_id: number;
  board_id: number;
  user_id: number;
  broker_id: number;
  team_role_id: number | null;
  team_id: number | null;
  solicitor_id: number | null;
  agent_id: number | null;
  referrer_id: number | null;
  financial_planner_id: number | null;
  accountant_id: number | null;
  third_party_id: number | null;
  buyers_agent_id: number | null;
  property_manager_id: number | null;
  building_pest_provider_id: number | null;
  lender_id: number | null;
  assigned_admin_id: number | null;
  stage_due_date: string | null;
  turn_amber_date: string | null;
  turn_red_date: string | null;
  finance_date: string | null;
  finance_turn_amber_date: string | null;
  finance_turn_red_date: string | null;
  settlement_date: string | null;
  settlement_turn_amber_date: string | null;
  settlement_turn_red_date: string | null;
  broker_handover_date: string | null;
  exp_lodged_date: string | null;
  pre_approved_date: string | null;
  formal_approved_date: string | null;
  exp_settlement_date: string | null;
  is_urgent: number;
  archive: number;
  created_at: string;
  broker_first_name: string;
  broker_last_name: string;
  activity_feed: ActivityFeed[];
}

export interface Stage {
  stage_id: number;
  board_title: String;
  stage_title: string;
  stage_name: string;
  stage_mapping: string;
  show_days_stage_indicator: number;
  stage_due_days: number;
  turn_amber: number;
  turn_red: number;
  add_stage_due_to_task: number;
  include_in_duration_metric: number;
  sub_stages: SubStage[];
  main_tasks: MainTask[];
}

export interface Stage2 {
  stage_id: number;
  title: string;
  stage_name: string;
  stage_mapping: string;
  show_days_stage_indicator: number;
  stage_due_days: number;
  turn_amber: number;
  turn_red: number;
  add_stage_due_to_task: number;
  include_in_duration_metric: number;
}

export interface Board {
  board_id: number;
  user_id: number;
  main_task_count: number;
  title: string;
  board_type_id: number;
}

export interface SingleMainTask {
  task_name: string;
  finance_date: string;
  finance_turn_amber_date: string;
  finance_turn_red_date: string;
  settlement_date: string;
  settlement_turn_amber_date: string;
  settlement_turn_red_date: string;
  stage_due_date: string;
  user_id: {
    user_id: number;
    email: string;
  };
  broker: {
    broker_id: number;
    first_name: string;
    last_name: string;
    phone: string;
    email: string;
  };
  team_role: {
    team_role_id: number | null;
    role_name: string | null;
    assignee_first_name: string | null;
    assignee_second_name: string | null;
  };
  contacts: Contact[];
  lender: {
    lender_id: number | null;
    lender_name: string | null;
    phone: string | null;
    email: string | null;
    broker: number;
    lender_legal: string | null;
  };
  assigned_admin: {
    assigned_admin_id: number | null;
    assigned_admin_email: string | null;
  };
  team: {
    team_id: number | null;
    team_name: string | null;
  };
  applicants: Applicant[];
  activity_feed: ActivityFeed[];
  stage: Stage2;
}

export interface Contact {
  contact_id: number;
  user_id: number;
  company_id: number | null;
  contact_type: string;
  role: string;
  title: string;
  first_name: string;
  middle_name: string;
  last_name: string;
  preferred_name: string;
  email: string;
  secondary_email: string;
  company: string;
  review_frequency: string;
  next_review: string | null;
  birth_date: string | null;
  gender: string;
  mobile_number: string;
  home_number: string;
  office_number: string;
  fax_number: string;
  home_address1: string;
  home_address2: string;
  home_city: string;
  home_postcode: string;
  home_state: string;
  home_country: string;
  postal_address1: string;
  postal_address2: string;
  postal_city: string;
  postal_postcode: string;
  postal_state: string;
  postal_country: string;
  office_address1: string;
  office_address2: string;
  office_city: string;
  office_postcode: string;
  office_state: string;
  office_country: string;
  photo: {
    type: string;
    data: number[];
  };
  citizenship: string;
  marital_status: string;
  lead_source: string;
  date_referred: string | null;
  notes: string;
}

export interface Applicant {
  applicant_id: number;
  role: string;
  first_name: string;
  last_name: string;
  email: string;
  mobile_number: string;
}

export interface ActivityFeed {
  activity_details: string;
  activity_id: number;
  activity_type: string;
  main_task_id: number;
  timestamp: string;
}

export interface Stage2 {
  stage_id: number;
  title: string;
  stage_name: string;
  stage_mapping: string;
  show_days_stage_indicator: number;
  stage_due_days: number;
  turn_amber: number;
  turn_red: number;
  add_stage_due_to_task: number;
  include_in_duration_metric: number;
}

export interface Pagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface Task {
  task_id: number;
  main_task_id: number;
  task_name: string;
  task_priority: string;
  task_description: string;
  due_date: string;
  is_complete: number;
  completed_by: string;
  date_completed: string | null;
  applicant: string | null;
  lender: string | null;
  broker: string | null;
  assignee: {
    assignee_id: number;
    assignee_first_name: string;
    assignee_last_name: string;
    assignee_email: string;
  };
  timestamp: string;
}

export interface TasksResponse {
  tasks: Task[];
  pagination: Pagination;
}

export interface User {
  id: number;
  isAdmin: number;
  first_name: string;
  last_name: string;
  email: string;
  iat: number;
  exp: number;
}

export interface Users {
  email: string;
  user_id: number;
  is_admin: number;
  first_name: string | null;
  last_name: string | null;
}

export interface Lender {
  lender_id: number;
  user_id: number;
  broker_id: number;
  lender_name: string;
  lender_notes: string;
  phone: string;
  email: string;
  internet_banking_website: string;
  clawback_period: string;
  assessor_name: string;
  assessor_phone: string;
  assessor_email: string;
  assessor_url: string;
  lender_bdm_name: string;
  lender_bdm_phone: string;
  lender_bdm_email: string;
  lender_legal_company: string;
  lender_legal_phone: string;
  lender_legal_email: string;
  lender_linked_branch_name: string;
  lender_linked_branch_phone: string;
  lender_linked_branch_email: string;
  post_settlement_phone: string;
  business_banker_name: string;
  business_banker_phone: string;
  business_banker_email: string;
  web_tracking_url: string;
  web_tracking_name: string;
  policy_details_url: string;
  construction_phone: string;
  construction_email: string;
  valuations_url: string;
  valuation_usrname: string;
  variations_phone: string;
  variations_email: string;
  pricing_url: string;
  insurance_party: string;
  mortgage_docs_return_address1: string;
  mortgage_docs_return_address2: string;
  mortgage_docs_return_town: string;
  mortgage_docs_return_state: string;
  mortgage_docs_return_postcode: string;
  first_home_owner_grant_email: string;
  first_home_owner_grant_address1: string;
  first_home_owner_grant_address2: string;
  first_home_owner_grant_town: string;
  first_home_owner_grant_state: string;
  first_home_owner_grant_postcode: string;
  discharges_phone: string;
  discharges_email: string;
  discharges_fax: string;
  discharges_authority_url: string;
  discharges_authority: string;
  reports_internet_banking: string;
  reports_offset: string;
  reports_refinance_rebate: string;
  reports_construction: string;
  reports_reminders: string;
}

export interface TaskTemplate {
  task_template_id: number;
  user_id: number;
  template_name: string;
  assignee: {
    first_name: string;
    last_name: string;
  } | null;
  template_task_priority: 'critical' | 'high' | 'medium' | 'low';
  template_description: string;
  attachments: string | null; // Adjust the type as needed for your use case
}

export interface GetTaskTemplatesResponse {
  data: TaskTemplate[];
  pagination: Pagination;
}

export interface NoteTemplate {
  note_template_id: number;
  user_id: number;
  template_name: string;
  note: string;
  created_at: string; // Assuming it's a string in ISO 8601 format
}

export interface NoteTemplatesResponse {
  data: NoteTemplate[];
  pagination: Pagination;
}

export interface Brokers {
  brokers: Users[];
  pagination: Pagination;
}

export interface UserData {
  user_id: number;
  email: string;
  password: string;
  title: string;
  first_name: string;
  last_name: string;
  preferred_name: string;
  company: string;
  mobile: string;
  office_contact: string;
  fax_contact: string;
  is_admin: number; // Assuming 1 represents true, and 0 represents false
  is_broker: number; // Assuming 1 represents true, and 0 represents false
  report_signature: Buffer;
  email_signature: string;
  advice_signature: string;
  profile_photo: Buffer;
}

export interface AssignedAdmin {
  assigned_admin_id: number;
  assigned_admin_email: string;
}
