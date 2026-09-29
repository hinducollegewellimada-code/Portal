# B/Hindu College Welimada – Portal

Upload the contents of this folder to the root of your GitHub Pages repo (`Portal`). Keep the folder names unchanged (`Ai Assitant`, `Thubnail`).

## One-time Firebase setup (project `whc-full-data`)

1. **Authentication → Sign-in method**: enable **Anonymous** and **Email/Password**.
2. **Authentication → Users → Add user**
   - Email: `whc.admin@hinducollege.lk`
   - Password: the password you want for the `WHC@Admin` login (the old default was `WHC@Admin`, min. 6 characters – choose a stronger one).
   The password is checked by Firebase; it is no longer stored in the HTML.
3. **Firestore → Rules**: paste the contents of `FireStore.rules` and **Publish**.
4. **Firestore → Indexes** (optional): the Attendance history query needs a composite index on `daily_counts` (`classId` ascending, `date` descending). Firestore shows a one-click link in the browser console the first time if it is missing; `firestore.indexes.json` contains the same definition.
5. **Authentication → Settings → Authorized domains**: make sure `hinducollegewellimada-code.github.io` is listed.

## Logins
- **WHC@Admin** – works in Attendance, Schedule and Teacher Management (Firebase account above).
- **Teacher / principal accounts** created in Teacher Management (`whc_staff`) – work in Attendance and Schedule.
- Teacher Management and Backup.html are for WHC@Admin only (Backup.html: sign in with whc.admin@hinducollege.lk and the Firebase password).

## Security notes
- `whc_staff` cannot be listed or edited by the public; anonymous visitors can only do a single-record login lookup. Only the admin account can list, add, edit or delete staff (so the Attendance "Users" page needs WHC@Admin).
- Attendance/Schedule data is writable by any signed-in visitor (anonymous sign-in), because teachers there are not Firebase users. Per-role enforcement would need Firebase Authentication accounts (or Cloud Functions) for every staff member.
- Staff passwords are still stored in plain text in `whc_staff` (existing design). Consider hashing them later.
