import {
  parseTimeHHMM,
  formatTimeHHMM,
  formatTimeLabel,
  nextPreset,
  REMINDER_PRESETS,
} from '../reminderTime';

describe('reminderTime', () => {
  it('parses valid times', () => {
    expect(parseTimeHHMM('08:00')).toEqual({ hour: 8, minute: 0 });
    expect(parseTimeHHMM('21:30')).toEqual({ hour: 21, minute: 30 });
  });

  it('falls back on invalid input', () => {
    expect(parseTimeHHMM(null)).toEqual({ hour: 8, minute: 0 });
    expect(parseTimeHHMM('nonsense')).toEqual({ hour: 8, minute: 0 });
    expect(parseTimeHHMM('99:99')).toEqual({ hour: 23, minute: 59 });
  });

  it('formats 24h', () => {
    expect(formatTimeHHMM({ hour: 8, minute: 5 })).toBe('08:05');
  });

  it('formats a 12h label', () => {
    expect(formatTimeLabel('08:00')).toBe('8:00 AM');
    expect(formatTimeLabel('00:00')).toBe('12:00 AM');
    expect(formatTimeLabel('12:00')).toBe('12:00 PM');
    expect(formatTimeLabel('21:30')).toBe('9:30 PM');
  });

  it('cycles presets', () => {
    expect(REMINDER_PRESETS).toContain(nextPreset('06:00'));
    expect(nextPreset('06:00')).toBe('08:00');
    expect(nextPreset('21:00')).toBe('06:00');
    // Unknown time isn't in the preset list (indexOf -1) -> wraps to first preset
    expect(nextPreset('07:13')).toBe('06:00');
  });
});
