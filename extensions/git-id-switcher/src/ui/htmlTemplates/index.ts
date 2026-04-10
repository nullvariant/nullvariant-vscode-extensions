/**
 * HTML Templates Public Barrel
 *
 * Re-exports the surface previously offered by the monolithic
 * htmlTemplates.ts so existing imports (`./htmlTemplates`) continue to
 * resolve unchanged after the directory split. The per-template
 * files (shell/document/loading/error) are the authoritative sources;
 * this file MUST NOT add behaviour, only re-export.
 *
 * @author Null;Variant
 * @license MIT
 */

export { type BodyClass, type SanitizedHtml } from './types';
export {
  CspValidationError,
  assertValidLang,
  assertValidNonce,
  buildCspString,
} from './csp';
export { getBaseStyles } from './baseStyles';
export { buildHtmlShell } from './shell';
export { buildDocumentHtml } from './document';
export { buildLoadingHtml } from './loading';
export { type ErrorType, buildErrorHtml } from './error';
