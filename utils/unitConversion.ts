export const mlToOz = (ml: number): number => {
  return Math.round((ml * 0.033814) * 10) / 10;
};

export const ozToMl = (oz: number): number => {
  return Math.round((oz * 29.5735) * 10) / 10;
};

export const formatAmount = (amount: number, unit: 'ml' | 'oz'): string => {
  if (unit === 'ml') {
    return amount >= 1000 ? `${(amount / 1000).toFixed(1)}L` : `${amount}ml`;
  } else {
    return `${amount}oz`;
  }
};

export const convertAmount = (amount: number, fromUnit: 'ml' | 'oz', toUnit: 'ml' | 'oz'): number => {
  if (fromUnit === toUnit) return amount;
  return fromUnit === 'ml' ? mlToOz(amount) : ozToMl(amount);
};

export const getRecommendedDailyIntake = (
  weight?: number,
  activityLevel?: 'low' | 'moderate' | 'high',
  age?: number
): number => {
  if (!weight) return 2000; // Default 2L
  
  let baseAmount = weight * 35; // 35ml per kg
  
  // Adjust for activity level
  if (activityLevel === 'moderate') baseAmount *= 1.2;
  if (activityLevel === 'high') baseAmount *= 1.4;
  
  // Adjust for age (older adults may need slightly less)
  if (age && age > 65) baseAmount *= 0.9;
  
  return Math.round(baseAmount);
};