# Release Feature Summary

## Agile Portal
- Development of the Agile Portal has been completed.
- Implemented Single Sign-On (SSO) for the Agile Sourcing Portal.
- Implemented SSO in the AATMa Portal and enabled integration with the Agile Sourcing Portal for seamless access.

## Recruiters Home Screen Module
- Corrected the Today's Interviews panel to display accurate interview data.
- Fixed the Upcoming Interviews details panel.
- Resolved issues in the Awaiting Feedback panel.
- Updated the Requirements to Focus section to correctly highlight candidates progressing through the recruitment cycle.
- Fixed Good Pipeline Count calculation discrepancies.
- Resolved UI issues in the Fulfilments bar chart displaying average processing time per requirement.
- Fixed the Send Reminder functionality in the Recruiter Dashboard that previously caused exceptions while sending interview reminders.

## Dashboard Module
- Deleted recruiters are now hidden in the following tables:
  - Candidates Added by Recruiter
  - Hired by Recruiter
  - Recruiter Wise Requirements
  - Recruiter Wise Closed by Others
  - Profiles Submitted
- Added an option to view soft-deleted employees in dashboard recruiter tables based on date filters.
- Updated tables to display monthly, quarterly, and yearly data.
- Introduced a dropdown to select month and dynamically show counts for In Progress, Hold, Joined, and Total, along with UI improvements.
- Added a world geographical map to visualize candidate counts country-wise in the dashboard graphs.
- Introduced a new Quarterly Reports Screen.

## Requirements Module
- Enabled navigation from Requirement Module to Fulfilment Module with auto-population of related fields.
- Optimized performance by reducing record loading time in the Requirement view page.
- Added a default Screening Level in the Requirement Add module.

## Talent Module

### Add Screen
- Added resume view and download options in both Talent and Fulfilment modules.
- Enhanced resume parsing logic to extract more accurate and detailed information from uploaded resumes.
- Implemented automated referral emails sent to employees every Tuesday and Thursday based on selected requirements.
- Added country-wise currency support for CTC and ECTC based on city and country selection.
- Implemented USD equivalent calculation for CTC and ECTC based on selected currency.

### View & Search Screen
- Added City, State, and Country fields in Talent View for improved location visibility.
- Enhanced Talent Search to filter candidates using City / State / Country, instead of City only.

## Fulfilment Module – View Screen
- Added resume view and download options.
- Fixed Panel Name display to correctly show the panel providing feedback under candidate fulfilment.
- Resolved duplicate panel feedback issue caused by repeated entries from Talent History.
- Updated email functionality so that Job Description emails are sent only after user confirmation, instead of auto-triggering on icon click.

## User Module – Add User
- Fixed duplicate email and phone number validation while creating users.

## Security & Role Management
- Resolved multi-role access issues introduced after Keycloak integration.
- Ensured users with multiple roles are now correctly assigned and recognized with all roles.
- Fixed additional backend issues related to post-Keycloak integration.

---

**Release Date:** July 2024  
**Version:** 1.0.0  
**Prepared by:** Shravya Parnandi