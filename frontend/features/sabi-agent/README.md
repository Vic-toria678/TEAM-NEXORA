# Sabi Agent

Sabi Agent is a client-side teaser editor for the transcript workspace. It maps the existing `TranscriptSegment` model into story segments, asks the mock service for candidate moments, and stores the editable brief and clip sequence in Zustand.

## Architecture

- `types.ts` defines the brief, moments, storyboard clips, chat messages, and service contract.
- `service.ts` is the deterministic mock adapter. It simulates a short delay and produces candidates from the supplied timestamped transcript; `mock-data.ts` also includes a 45-minute Nigerian podcast sample for development.
- `store.ts` owns suggestions, storyboard edits, chat state, preview selection, and bounded undo/redo history.
- `components/` contains the brief, moment list, storyboard, chat, and workspace panel.
- `utils.ts` contains transcript mapping, timecodes, reorder/trim logic, and pure JSON/CSV/SRT/cut-list exporters.
- The panel saves the active brief and storyboard to local storage using the media file name, size, and last-modified time as the project key.

## Replacing the mock service

Implement `SabiAgentService` in a new adapter and change the adapter imported by `sabi-agent-panel.tsx`. Keep the method inputs and outputs typed:

- `findMoments({ brief, segments })` returns moments with source timestamps, transcript text, type, strength, and an explanation.
- `reply({ message, brief, moments, storyboard })` returns a short response and, optionally, one of the supported actionable suggestions.

The UI and Zustand store do not need to change when the service implementation is swapped. This feature currently makes no network or AI requests.

## Validation

Run `npm test` for exporter, timecode, trim/reorder, and component interaction tests. Run `npm run typecheck` and `npm run build` for static and production validation.
