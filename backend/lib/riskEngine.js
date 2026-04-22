/**
 * Local fraud / risk scoring (used when Python AI service is unavailable).
 * Mirrors signals described in product spec.
 */
function evaluateLocalRisk(body = {}) {
  const {
    action_type = 'UNKNOWN',
    amount = 0,
    avg_amount,
    is_new_device,
    seconds_since_login = 9999,
    is_first_investment_type,
    otp_retry_count = 0,
  } = body;

  let score = 0;
  const signals = [];

  if (is_new_device) { score += 25; signals.push('new_device_detected'); }
  if (seconds_since_login < 60) { score += 20; signals.push('rapid_action_after_login'); }
  if (avg_amount && amount > avg_amount * 2.5) { score += 20; signals.push('amount_exceeds_2.5x_average'); }
  if (otp_retry_count > 1) { score += 15; signals.push('multiple_otp_retries'); }
  if (is_first_investment_type) { score += 10; signals.push('new_investment_type'); }
  if (amount > 200000) { score += 10; signals.push('large_transaction'); }

  const level = score < 35 ? 'LOW' : score < 65 ? 'MEDIUM' : 'HIGH';
  const decision = score < 35 ? 'ALLOW' : score < 65 ? 'WARN' : 'BLOCK';

  const reasons = {
    ALLOW: 'Activity matches your normal usage pattern. All signals are clean.',
    WARN: [
      is_new_device && 'Login from unrecognized device detected.',
      seconds_since_login < 60 && 'Action initiated within 60 seconds of login.',
      amount > (avg_amount || 0) * 2.5 && `Amount is ${Math.round(amount / (avg_amount || amount))}x your usual pattern.`,
    ].filter(Boolean).join(' ') || 'Moderate risk signals detected. Please verify.',
    BLOCK: 'High-risk transaction blocked. Multiple fraud signals detected simultaneously. Please contact support.',
  };

  return {
    action_type,
    amount,
    risk_score: Math.min(100, score),
    level,
    decision,
    reason: reasons[decision],
    signals,
  };
}

module.exports = { evaluateLocalRisk };
