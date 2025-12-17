# Phone Reservation Flow Stabilization - Implementation Notes

## Targeted Repositories
- `ailuna-web`: (Current Workspace)
- `ailuna-call-engine`: (To be located/accessed)

## Discovery & Risk Assessment
- **Schema Drift**: `supabase/schema.sql` in `ailuna-web` is missing `reservation_requests` and `store_notification_settings`.
- **Logic Gaps**: 
  - SMS is sent in `actions.ts` but `sms_body_sent` and `sms_sent_at` are not recorded in DB.
  - `answers` field handling in `ReservationSection.tsx` assumes object but may receive array/mixed types.
  - Date/Time formatting relies on string splitting, which is fragile if DB format changes.
- **Constraints**: No unique constraint on `call_sid` found in visible schema/code (likely needs DB migration).

## Acceptance Criteria
1. **Uniqueness**: 1 call (`call_sid`) = Max 1 `reservation_requests` record.
2. **Data Integrity**: `answers` is ALWAYS an object `{}` (Array `[]` prohibited).
3. **Date/Time**: `requested_date` (Date YYYY-MM-DD), `requested_time` (Time HH:mm:ss).
4. **Notification**: Store notification (Email/LINE) sent max ONCE per request.
5. **SMS Logging**: When Approve/Reject triggers SMS, `sms_body_sent` and `sms_sent_at` MUST be updated in `reservation_requests`.

## Planned Modifications (Web)
### `src/app/dashboard/actions.ts`
- Update `approveReservationRequest` to write `sms_body_sent` / `sms_sent_at`.
- Update `rejectReservationRequest` to write `sms_body_sent` / `sms_sent_at`.
- Update `fetchReservationRequestsPaginated` to potentially handle or cleanup bad data (if needed for display).

### `src/app/dashboard/sections/ReservationSection.tsx`
- Harden `getAnswerPreview` and `formatReservationDateTime` against malformed data.
- Ensure `answers` is treated safely even if array comes in (temporary fix until backend is strict).

### Database (Migration)
- Add UNIQUE index on `reservation_requests (call_sid)`.
- Enforce `answers` Type or Check constraint constraint (if possible in Postgres, `jsonb_typeof(answers) = 'object'`).

## Planned Modifications (Call Engine)
- *Pending access to repository*
- Likely need to fix INSERT logic to respect uniqueness and correct data types.
