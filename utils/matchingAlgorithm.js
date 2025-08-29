const matchShiftsToDSPs = (shifts, dsps) => {
  return shifts.map(shift => {
    const matchedDSPs = dsps.filter(dsp => 
      dsp.credentials.some(c => shift.requirements.includes(c.type)) &&
      dsp.availability.includes(shift.dayOfWeek)
    );
    return { ...shift.toObject(), matchedDSPs };
  });
};

module.exports = { matchShiftsToDSPs };