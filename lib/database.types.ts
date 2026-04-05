export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      organizations: {
        Row: {
          id: string
          user_id: string
          inn: string
          name: string
          org_type: 'МКК' | 'МФК'
          address: string | null
          sdl_name: string | null
          sdl_position: string | null
          pvk_updated_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          inn: string
          name: string
          org_type: 'МКК' | 'МФК'
          address?: string | null
          sdl_name?: string | null
          sdl_position?: string | null
          pvk_updated_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          inn?: string
          name?: string
          org_type?: 'МКК' | 'МФК'
          address?: string | null
          sdl_name?: string | null
          sdl_position?: string | null
          pvk_updated_at?: string | null
          created_at?: string
        }
      }
      clients: {
        Row: {
          id: string
          org_id: string
          last_name: string
          first_name: string
          middle_name: string | null
          birthday: string
          citizenship: string
          passport_series: string
          passport_number: string
          passport_issued_by: string
          passport_issued_date: string
          passport_division_code: string | null
          reg_address: string
          live_address: string | null
          snils: string | null
          inn: string | null
          loan_purpose: string | null
          income_source: string | null
          is_pep: boolean
          pep_description: string | null
          risk_level: 'low' | 'medium' | 'high'
          risk_reason: string | null
          status: 'draft' | 'checking' | 'approved' | 'rejected'
          reject_reason: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          org_id: string
          last_name: string
          first_name: string
          middle_name?: string | null
          birthday: string
          citizenship?: string
          passport_series: string
          passport_number: string
          passport_issued_by: string
          passport_issued_date: string
          passport_division_code?: string | null
          reg_address: string
          live_address?: string | null
          snils?: string | null
          inn?: string | null
          loan_purpose?: string | null
          income_source?: string | null
          is_pep?: boolean
          pep_description?: string | null
          risk_level?: 'low' | 'medium' | 'high'
          risk_reason?: string | null
          status?: 'draft' | 'checking' | 'approved' | 'rejected'
          reject_reason?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          org_id?: string
          last_name?: string
          first_name?: string
          middle_name?: string | null
          birthday?: string
          citizenship?: string
          passport_series?: string
          passport_number?: string
          passport_issued_by?: string
          passport_issued_date?: string
          passport_division_code?: string | null
          reg_address?: string
          live_address?: string | null
          snils?: string | null
          inn?: string | null
          loan_purpose?: string | null
          income_source?: string | null
          is_pep?: boolean
          pep_description?: string | null
          risk_level?: 'low' | 'medium' | 'high'
          risk_reason?: string | null
          status?: 'draft' | 'checking' | 'approved' | 'rejected'
          reject_reason?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      client_checks: {
        Row: {
          id: string
          client_id: string
          check_type: 'rfm' | 'passport'
          result: 'clear' | 'found' | 'error' | 'manual_required'
          details: Json | null
          checked_at: string
        }
        Insert: {
          id?: string
          client_id: string
          check_type: 'rfm' | 'passport'
          result: 'clear' | 'found' | 'error' | 'manual_required'
          details?: Json | null
          checked_at?: string
        }
        Update: {
          id?: string
          client_id?: string
          check_type?: 'rfm' | 'passport'
          result?: 'clear' | 'found' | 'error' | 'manual_required'
          details?: Json | null
          checked_at?: string
        }
      }
      client_history: {
        Row: {
          id: string
          client_id: string
          snapshot: Json
          changed_at: string
        }
        Insert: {
          id?: string
          client_id: string
          snapshot: Json
          changed_at?: string
        }
        Update: {
          id?: string
          client_id?: string
          snapshot?: Json
          changed_at?: string
        }
      }
    }
  }
}
