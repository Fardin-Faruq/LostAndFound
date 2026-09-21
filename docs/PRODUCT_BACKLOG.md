# Product Backlog - Lost2Found

## Epic 1: User Authentication & Profiles
- **US-1.1**: As a student, I want to register for an account using my university email so that I can report and claim items. (Sprint 1)
- **US-1.2**: As a student, I want to log into my account securely so that I can manage my reports. (Sprint 1)
- **US-1.3**: As an admin, I want to log in with an admin role so that I can verify and manage claims. (Sprint 3)
- **US-1.4**: As a student, I want to view my profile and past reports so that I can track my activity. (Sprint 2)

## Epic 2: Item Reporting (Core)
- **US-2.1**: As a student who lost an item, I want to submit a lost report with details (category, date, location, description) so that others can help find it. (Sprint 1)
- **US-2.2**: As a student who found an item, I want to submit a found report with details so that the owner can be located. (Sprint 1)
- **US-2.3**: As a student, I want to upload an image of the lost/found item so that it is easily identifiable. (Sprint 4)

## Epic 3: Item Discovery & Browsing
- **US-3.1**: As a student, I want to view a list of all active lost and found reports so that I can check if my item was found or if I found someone else's item. (Sprint 1)
- **US-3.2**: As a student, I want to search and filter reports by keyword, category, and date so that I can quickly find relevant items. (Sprint 2)
- **US-3.3**: As a student, I want to view the details of a specific report so that I can determine if it's the item I'm looking for. (Sprint 2)

## Epic 4: Physical Office Workflow & Admin Operations
- **US-4.1**: As an admin, I want to confirm physical receipt of a found item so that the system accurately reflects the physical office inventory. (Sprint 3)
- **US-4.2**: As an admin, I want to view a dashboard with statistics (total lost/found, pending claims) so that I can monitor office activity. (Sprint 3)
- **US-4.3**: As an admin, I want to assign a physical storage location to an item so that it can be easily retrieved. (Sprint 3)
- **US-4.4**: As an admin, I want to mark an item as "Returned" upon handover so that the report is closed. (Sprint 3)

## Epic 5: Claims & Verification
- **US-5.1**: As a student, I want to submit a claim for a found item by providing private verification details so that I can prove ownership. (Sprint 3)
- **US-5.2**: As an admin, I want to review submitted claims and their verification answers so that I can approve or reject them. (Sprint 3)

## Epic 6: Intelligent Matching & Notifications
- **US-6.1**: As the system, I want to calculate a match score between lost and found items based on category, color, and location so that possible matches are surfaced. (Sprint 4)
- **US-6.2**: As a student, I want to receive an in-app notification when a possible match is found for my lost item so that I can submit a claim. (Sprint 4)
- **US-6.3**: As a student, I want to receive notifications about the status of my claims so that I know when to pick up my item. (Sprint 4)

## Epic 7: System Infrastructure & DevOps
- **US-7.1**: As a developer, I want to containerize the application using Docker so that it runs consistently across environments. (Sprint 5)
- **US-7.2**: As a developer, I want a CI/CD pipeline to automatically lint and test code on every pull request so that code quality is maintained. (Sprint 1)
