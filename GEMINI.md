IMPORTANT PROJECT RULES



Project Name: NONIMSONG

Production Host: Vercel

Architecture: Static Frontend + Vercel Serverless Functions



CRITICAL:

\- Production deployment is more important than localhost.

\- Never break Vercel deployment to fix localhost.

\- Never delete working code without proving a replacement works on Vercel.



DO NOT:

\- Delete files inside /api unless explicitly instructed.

\- Replace Vercel Serverless Functions with a standalone Express server.

\- Move API logic from /api/\*.js into server/server.js.

\- Remove vercel.json configuration.

\- Assume localhost architecture is the same as Vercel production.

\- Remove files that are currently used by production deployment.



BEFORE ANY BACKEND CHANGE:

1\. Inspect vercel.json.

2\. Inspect the /api directory.

3\. Explain how the change affects Vercel production.

4\. Verify compatibility with existing frontend fetch requests.

5\. Verify deployment architecture before modifying APIs.



BEFORE DELETING FILES:

\- Explain why deletion is required.

\- Explain what replaces the deleted functionality.

\- Verify Vercel production will continue working.

\- Show impacted files.



PROTECTED FILES:

\- api/search.js

\- api/video.js

\- vercel.json



If deleting or modifying any protected file:

STOP and explain the consequences first.



OUTPUT RULES:

\- Never stop after finding one bug.

\- Continue until no actionable issues remain.

\- Verify fixes by running tests.

\- Report:

&#x20; - Files changed

&#x20; - Fixes applied

&#x20; - Remaining issues

&#x20; - Status: SUCCESS or FAILED

