# XSS Security Test

This file tests XSS protection in the Webview. None of the payloads below should execute.

---

## Test 1: Script Tag

<script>alert('XSS1-script-tag')</script>

If you see an alert, CSP or sanitization failed.

---

## Test 2: Event Handlers

### onerror
<img src="x" onerror="alert('XSS2-onerror')">

### onload
<svg onload="alert('XSS3-onload')"></svg>

### onclick
<button onclick="alert('XSS4-onclick')">Click me (should do nothing)</button>

### onmouseover
<div onmouseover="alert('XSS5-onmouseover')">Hover me (should do nothing)</div>

---

## Test 3: JavaScript URL

<a href="javascript:alert('XSS6-javascript-url')">JavaScript URL Link</a>

---

## Test 4: Data URL

<a href="data:text/html,<script>alert('XSS7-data-url')</script>">Data URL Link</a>

---

## Test 5: VBScript URL (IE only)

<a href="vbscript:msgbox('XSS8-vbscript')">VBScript URL Link</a>

---

## Test 6: Encoded Payloads

### HTML Entity Encoded
<a href="&#106;&#97;&#118;&#97;&#115;&#99;&#114;&#105;&#112;&#116;&#58;&#97;&#108;&#101;&#114;&#116;&#40;&#39;&#88;&#83;&#83;&#57;&#39;&#41;">HTML Entity Encoded</a>

### URL Encoded
<a href="javascript%3Aalert('XSS10')">URL Encoded</a>

---

## Test 7: SVG with Script

<svg><script>alert('XSS11-svg-script')</script></svg>

---

## Test 8: Iframe (should be blocked by CSP)

<iframe src="javascript:alert('XSS12-iframe')"></iframe>

---

## Test 9: Object/Embed (should be blocked by CSP)

<object data="javascript:alert('XSS13-object')"></object>
<embed src="javascript:alert('XSS14-embed')">

---

## Test 10: Style-based XSS

<div style="background:url('javascript:alert(XSS15)')">Style XSS</div>

---

## Expected Results

If XSS protection is working correctly:
- No alert dialogs should appear
- Dangerous links should be neutralized (href="#")
- Script tags should be removed
- Event handlers should be stripped
- Console should show CSP violation errors

---

## Navigation Test

[Back to English README](../en/README.md)
