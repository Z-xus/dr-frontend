// Language options for all pages
export const LANGUAGE_OPTIONS = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Spanish' },
  { value: 'mr', label: 'Marathi' },
  { value: 'hi', label: 'Hindi' },
  { value: 'ka', label: 'Kannada' }
] as const;

// Entity types for PII detection
export const ENTITY_TYPES = [
  'PERSON',
  'ORGANIZATION',
  'LOCATION',
  'DATE',
  'TIME',
  'MONEY',
  'PERCENT',
  'EMAIL',
  'PHONE',
  'URL'
] as const;

// API endpoints
export const API_ENDPOINTS = {
  ANALYZE: '/analyze',
  REDACT: '/redact',
  SUPPORTED_ENTITIES: '/supportedentities',
  RECOGNIZERS: '/recognizers',
  HEALTH: '/health'
} as const;

// File types
export const FILE_TYPES = {
  PDF: 'application/pdf',
  IMAGE: 'image/*'
} as const;

// Common error messages
export const ERROR_MESSAGES = {
  NO_TEXT: 'Please enter some text to analyze',
  NO_FILE: 'Please select a file',
  INVALID_FILE_TYPE: 'Please select a valid file type',
  ANALYSIS_FAILED: 'Failed to analyze content',
  PROCESSING_FAILED: 'Failed to process content',
  API_ERROR: 'An error occurred while communicating with the server'
} as const;
