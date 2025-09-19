# Implementation Plan for Web Search Modes and Deep Thinking Integration

## Information Gathered
- main.py contains backend Flask app with /search endpoint using DuckDuckGo API.
- advanced-ai.js manages AI models, currently supports GPT-4, Claude-3, Gemini-Pro.
- script.js handles chat UI and message sending, includes web_search toggle.
- web_search.md outlines web search feature with backend and frontend components.
- No existing UI for selecting web search mode; only a toggle for web_search.

## Plan
- Modify advanced-ai.js to include selectable web search modes (e.g., DuckDuckGo, Google, Bing).
- Add UI dropdown in frontend (likely in script.js and index.html) for selecting web search mode.
- Update backend /search endpoint to accept a mode parameter and route requests accordingly.
- Update chat message sending in script.js to send selected web search mode to backend.
- Integrate deep thinking toggle with web search mode selection.
- Test integration end-to-end.

## Dependent Files to Edit
- src/advanced-ai.js
- web/static/script.js
- main.py
- web/index.html (or relevant HTML for chat UI)

## Follow-up Steps
- Implement code changes as per plan.
- Test UI for mode selection and toggle.
- Test backend search routing.
- Verify chat integration with web search and deep thinking.
