# Security Specification for MediVault

## Data Invariants
1. A user profile (`/users/{uid}`) must only be created/updated by the user themselves.
2. A user cannot change their own `role` or `licenseNumber` once set (admin-only or creation-only).
3. Patients and Appointments are only accessible to authenticated users (doctors/admins).
4. Appointments must have a valid `patientId` and `doctorId`.
5. Status updates for appointments must follow logical transitions.

## The Dirty Dozen Payloads (Targeted Failures)
1. **Identity Spoofing**: Attempt to create a user profile with `uid` != `auth.uid`.
2. **Privilege Escalation**: Non-admin user attempting to change their `role` to 'admin'.
3. **Orphaned Record**: Creating an appointment for a `patientId` that doesn't exist.
4. **PII Leak**: Unauthenticated user attempting to list patients.
5. **Data Poisoning**: Injecting a 1MB string into the `notes` field of an appointment.
6. **State Skip**: Updating an appointment status from 'scheduled' directly to 'completed' without 'in-progress' (if enforced).
7. **Cross-Tenant Access**: Doctor A trying to delete Doctor B's patients (if isolation was per doctor, but here it's shared clinic).
8. **Shadow Field**: Adding `isVerified: true` to a patient document.
9. **Timestamp Manipulation**: Manually setting `createdAt` to a past date.
10. **ID Hijacking**: Using a long, junk-character string as a document ID.
11. **Blanket Query**: Requesting all appointments without filtering by doctor (if multi-tenant).
12. **Malicious Enum**: Setting appointment status to 'invalid-status'.
