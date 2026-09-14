import { describe, expect, it } from 'vitest';
import { ExtractionService } from './extraction-service.js';
describe('ExtractionService', () => {
  it('requires citations and approval for AI proposals', () => {
    const s = new ExtractionService();
    const p = s.create({
      proposal: {
        id: 'p',
        targetType: 'SUMMARY',
        body: 'summary',
        citations: [{ contentId: 'c', quote: 'quote' }],
        generatedBy: 'AI',
        label: 'AI Generated',
        approval: 'PENDING',
      },
      permissions: ['knowledge:propose'],
    });
    expect(p.approval).toBe('PENDING');
    expect(s.approve({ proposalId: 'p', permissions: ['knowledge:write'] }).approval).toBe(
      'APPROVED',
    );
  });
  it('fails closed and enforces label', () => {
    const s = new ExtractionService();
    expect(() =>
      s.create({
        proposal: {
          id: 'p',
          targetType: 'FACT',
          body: 'x',
          citations: [],
          generatedBy: 'AI',
          label: 'User Authored',
          approval: 'PENDING',
        },
        permissions: ['knowledge:propose'],
      }),
    ).toThrow('Citation');
    expect(() =>
      s.create({
        proposal: {
          id: 'p',
          targetType: 'FACT',
          body: 'x',
          citations: [{ contentId: 'c', quote: 'q' }],
          generatedBy: 'AI',
          label: 'User Authored',
          approval: 'PENDING',
        },
        permissions: ['knowledge:propose'],
      }),
    ).toThrow('label');
  });

  it('keeps rejected proposals visible without persisting domain truth', () => {
    const s = new ExtractionService();
    s.create({
      proposal: {
        id: 'rejected',
        targetType: 'FACT',
        body: 'unverified fact',
        citations: [{ contentId: 'content-1', quote: 'source quote', locator: 'page:2' }],
        generatedBy: 'AI',
        label: 'AI Generated',
        approval: 'PENDING',
        confidence: 0.72,
        evidenceIds: ['content-1'],
      },
      permissions: ['knowledge:propose'],
    });

    const rejected = s.reject({ proposalId: 'rejected', permissions: ['knowledge:write'] });
    expect(rejected.approval).toBe('REJECTED');
    expect(s.get('rejected', ['knowledge:read'])?.approval).toBe('REJECTED');
    expect(s.listPersisted(['knowledge:read'])).toEqual([]);
  });

  it('persists a cited extraction only after approval and retains evidence metadata', () => {
    const s = new ExtractionService();
    s.create({
      proposal: {
        id: 'approved',
        targetType: 'SUMMARY',
        body: 'approved summary',
        citations: [{ contentId: 'content-1', quote: 'source quote' }],
        generatedBy: 'AI',
        label: 'AI Generated',
        approval: 'PENDING',
        confidence: 0.91,
        evidenceIds: ['evidence-1'],
      },
      permissions: ['knowledge:propose'],
    });

    expect(s.listPersisted(['knowledge:read'])).toEqual([]);
    const approved = s.approve({ proposalId: 'approved', permissions: ['knowledge:write'] });
    expect(approved.approval).toBe('APPROVED');
    expect(s.getPersisted('approved', ['knowledge:read'])).toMatchObject({
      proposalId: 'approved',
      body: 'approved summary',
      confidence: 0.91,
      evidenceIds: ['evidence-1'],
    });
  });

  it('rejects confidence outside the valid range', () => {
    const s = new ExtractionService();
    expect(() =>
      s.create({
        proposal: {
          id: 'invalid-confidence',
          targetType: 'FACT',
          body: 'x',
          citations: [{ contentId: 'c', quote: 'q' }],
          generatedBy: 'USER',
          label: 'User Authored',
          approval: 'PENDING',
          confidence: 1.1,
        },
        permissions: ['knowledge:propose'],
      }),
    ).toThrow('Confidence');
  });

  it('fails closed when proposal, approval, or reads lack their permission', () => {
    const s = new ExtractionService();
    const proposal = {
      id: 'permission-check',
      targetType: 'FACT' as const,
      body: 'fact',
      citations: [{ contentId: 'content-1', quote: 'quote' }],
      generatedBy: 'USER' as const,
      label: 'User Authored' as const,
      approval: 'PENDING' as const,
    };
    expect(() => s.create({ proposal, permissions: [] })).toThrow('knowledge:propose');
    s.create({ proposal, permissions: ['knowledge:propose'] });
    expect(() => s.approve({ proposalId: proposal.id, permissions: [] })).toThrow(
      'knowledge:write',
    );
    expect(() => s.get(proposal.id, [])).toThrow('knowledge:read');
  });
});
