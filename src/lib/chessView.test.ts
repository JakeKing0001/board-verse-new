import { describe, expect, it } from 'vitest';
import { getLegalMoveTargets } from './chessView';
import { STANDARD_START_FEN } from './chessState';

describe('chess board views', () => {
  it('shares the same legal targets between renderers', () => {
    expect(getLegalMoveTargets(STANDARD_START_FEN, 'e2')).toEqual([
      { square: 'e3', highlight: 'quiet' },
      { square: 'e4', highlight: 'quiet' },
    ]);
  });

  it('describes captures, castling and en passant for visual feedback', () => {
    expect(getLegalMoveTargets('4k3/8/8/3pP3/8/8/8/4K3 w - d6 0 1', 'e5')).toContainEqual({
      square: 'd6',
      highlight: 'en-passant',
    });

    expect(getLegalMoveTargets('4k3/8/8/8/8/8/8/4K2R w K - 0 1', 'e1')).toContainEqual({
      square: 'g1',
      highlight: 'castle',
    });

    expect(getLegalMoveTargets('4k3/8/8/8/8/8/3p4/4K3 w - - 0 1', 'e1')).toContainEqual({
      square: 'd2',
      highlight: 'capture',
    });
  });

  it('returns no targets for invalid input', () => {
    expect(getLegalMoveTargets('invalid fen', 'e2')).toEqual([]);
  });
});
