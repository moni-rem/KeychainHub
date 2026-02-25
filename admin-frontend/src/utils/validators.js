// Email validation
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Password validation
export const isValidPassword = (password) => {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
};

// Phone number validation
export const isValidPhone = (phone) => {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone.replace(/\D/g, ""));
};

// URL validation
export const isValidUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// Required field validation
export const isRequired = (value) => {
  return (
    value !== undefined && value !== null && value.toString().trim() !== ""
  );
};

// Minimum length validation
export const minLength = (value, min) => {
  return value && value.length >= min;
};

// Maximum length validation
export const maxLength = (value, max) => {
  return value && value.length <= max;
};

// Number range validation
export const isInRange = (value, min, max) => {
  const num = Number(value);
  return !isNaN(num) && num >= min && num <= max;
};

// Date validation
export const isValidDate = (date) => {
  return date instanceof Date && !isNaN(date.getTime());
};

// Credit card validation (Luhn algorithm)
export const isValidCreditCard = (cardNumber) => {
  const cleaned = cardNumber.replace(/\D/g, "");

  let sum = 0;
  let shouldDouble = false;

  for (let i = cleaned.length - 1; i >= 0; i--) {
    let digit = parseInt(cleaned.charAt(i));

    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }

    sum += digit;
    shouldDouble = !shouldDouble;
  }

  return sum % 10 === 0;
};

// Form validation helper
export const validateForm = (formData, rules) => {
  const errors = {};

  Object.keys(rules).forEach((field) => {
    const value = formData[field];
    const fieldRules = rules[field];

    for (const rule of fieldRules) {
      if (rule.required && !isRequired(value)) {
        errors[field] = rule.message || `${field} is required`;
        break;
      }

      if (rule.minLength && !minLength(value, rule.minLength)) {
        errors[field] =
          rule.message ||
          `${field} must be at least ${rule.minLength} characters`;
        break;
      }

      if (rule.maxLength && !maxLength(value, rule.maxLength)) {
        errors[field] =
          rule.message ||
          `${field} must be at most ${rule.maxLength} characters`;
        break;
      }

      if (rule.email && !isValidEmail(value)) {
        errors[field] = rule.message || "Invalid email address";
        break;
      }

      if (rule.password && !isValidPassword(value)) {
        errors[field] =
          rule.message ||
          "Password must be at least 8 characters with uppercase, lowercase, and number";
        break;
      }

      if (rule.custom && !rule.validator(value)) {
        errors[field] = rule.message || `Invalid ${field}`;
        break;
      }
    }
  });

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

// Generate password strength score
export const getPasswordStrength = (password) => {
  if (!password) return 0;

  let score = 0;

  // Length check
  if (password.length >= 8) score += 25;
  if (password.length >= 12) score += 15;

  // Character variety
  if (/[a-z]/.test(password)) score += 10;
  if (/[A-Z]/.test(password)) score += 10;
  if (/\d/.test(password)) score += 10;
  if (/[^a-zA-Z\d]/.test(password)) score += 10;

  // No common patterns
  const commonPatterns = ["123456", "password", "qwerty", "admin"];
  if (
    !commonPatterns.some((pattern) => password.toLowerCase().includes(pattern))
  ) {
    score += 20;
  }

  return Math.min(score, 100);
};
// Validate password strength
