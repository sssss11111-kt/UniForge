export interface NewsClaimCitation {
  newsEventId: string;
  quote: string;
}
export interface NewsClaim {
  id: string;
  newsEventId: string;
  text: string;
  citations: readonly NewsClaimCitation[];
  generatedBy: 'USER' | 'AI';
  label: 'AI Generated' | 'User Authored';
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}
export interface CreateNewsClaimInput {
  claim: NewsClaim;
  permissions: readonly string[];
}
