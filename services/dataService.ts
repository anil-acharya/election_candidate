
import { createClient } from '@supabase/supabase-js';
import { Candidate } from '../types';

// IMPORTANT: Replace these with your actual Supabase URL and Key from supabase.com
const SUPABASE_URL = 'https://iwloeyzxjdtqsdqsygzf.supabase.co'; 
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml3bG9leXp4amR0cXNkcXN5Z3pmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkyNjc3NDYsImV4cCI6MjA4NDg0Mzc0Nn0.6NM2UE6U9Ze-AF30r2fgg1bGF4xR5xq-Fy1p_ALMu-c';

const supabase = (SUPABASE_URL && SUPABASE_ANON_KEY) 
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY) 
  : null;

const STORAGE_KEY = 'nepal_election_candidates';

export const isGlobalEnabled = () => !!supabase;

const mapDbToCandidate = (dbRow: any): Candidate => ({
  id: String(dbRow.id || ''),
  name: String(dbRow.name || ''),
  party: String(dbRow.party || ''),
  provinceId: String(dbRow.province_id || ''),
  districtId: String(dbRow.district_id || ''),
  constituency: String(dbRow.constituency || ''),
  photoUrl: String(dbRow.photo_url || ''),
  symbolUrl: String(dbRow.symbol_url || '')
});

export const getCandidates = async (): Promise<Candidate[]> => {
  if (supabase) {
    const { data, error } = await supabase.from('candidates').select('*');
    if (error) {
      console.error('Error fetching from Supabase:', error);
      return getLocalCandidates();
    }
    if (data) return data.map(mapDbToCandidate);
  }
  return getLocalCandidates();
};

const getLocalCandidates = (): Candidate[] => {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) return [];
  return JSON.parse(data);
};

export const saveCandidate = async (candidate: Candidate) => {
  if (supabase) {
    const { error } = await supabase.from('candidates').upsert({
      id: candidate.id,
      name: candidate.name,
      party: candidate.party,
      province_id: String(candidate.provinceId),
      district_id: String(candidate.districtId),
      constituency: String(candidate.constituency),
      photo_url: candidate.photoUrl,
      symbol_url: candidate.symbolUrl
    });
    if (error) console.error('Supabase Save Error:', error);
  }
  
  const candidates = getLocalCandidates();
  const index = candidates.findIndex(c => c.id === candidate.id);
  if (index !== -1) {
    candidates[index] = candidate;
  } else {
    candidates.push(candidate);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(candidates));
};

export const deleteCandidate = async (id: string) => {
  if (supabase) {
    const { error } = await supabase.from('candidates').delete().eq('id', id);
    if (error) console.error('Supabase Delete Error:', error);
  }
  
  const candidates = getLocalCandidates();
  const filtered = candidates.filter(c => c.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
};
