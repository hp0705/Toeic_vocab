import { describe, it, expect } from 'vitest';
import { createInitialCard, schedule, getNextIntervalEstimate } from './sm2';

describe('SM-2 SRS Algorithm', () => {
  const now = 1700000000000;

  it('initializes a new card correctly', () => {
    const card = createInitialCard('w_shipment_1', now);
    expect(card.status).toBe('new');
    expect(card.interval).toBe(0);
    expect(card.ease).toBe(2.5);
    expect(card.lapses).toBe(0);
    expect(card.reps).toBe(0);
  });

  it('handles "Again" (Grade 1) with 10-minute retry and lapse tracking', () => {
    const card = createInitialCard('w_shipment_1', now);
    const updated = schedule(card, 1, now);
    expect(updated.status).toBe('learning');
    expect(updated.lapses).toBe(1);
    expect(updated.interval).toBe(0);
    expect(updated.due).toBe(now + 10 * 60 * 1000);
    expect(updated.ease).toBeLessThan(2.5);
  });

  it('marks card as weak if lapses >= 4', () => {
    let card = createInitialCard('w_shipment_1', now);
    for (let i = 0; i < 4; i++) {
      card = schedule(card, 1, now);
    }
    expect(card.lapses).toBe(4);
    expect(card.isWeak).toBe(true);
  });

  it('progresses card from new to review when rated "Good" or "Easy"', () => {
    const card = createInitialCard('w_shipment_1', now);
    const good = schedule(card, 3, now);
    expect(good.status).toBe('review');
    expect(good.interval).toBe(1);
    expect(good.reps).toBe(1);

    const easy = schedule(card, 4, now);
    expect(easy.status).toBe('review');
    expect(easy.interval).toBe(3);
  });

  it('scales intervals properly for mature cards', () => {
    let card = createInitialCard('w_shipment_1', now);
    card = schedule(card, 3, now); // day 1
    card = schedule(card, 3, now); // day 3
    card = schedule(card, 3, now); // day 8
    expect(card.interval).toBeGreaterThan(5);
    expect(card.reps).toBe(3);
  });

  it('generates human-readable labels for next interval buttons', () => {
    const card = createInitialCard('w_shipment_1', now);
    expect(getNextIntervalEstimate(card, 1, now)).toBe('10 phút');
    expect(getNextIntervalEstimate(card, 2, now)).toBe('12 giờ');
    expect(getNextIntervalEstimate(card, 3, now)).toBe('1 ngày');
    expect(getNextIntervalEstimate(card, 4, now)).toBe('3 ngày');
  });
});
