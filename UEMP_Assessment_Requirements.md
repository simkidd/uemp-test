# University Education Management Portal (UEMP)

## Practical Software Development Test --- Project Requirements

**Organisation:** Lead Web Praxis Media Limited\
**Project:** University Education Management Portal (UEMP)\
**Assessment type:** Practical Software Development Test\
**Duration stated in brief:** 24 hours\
**Department:** Technology & Engineering\
**Required submission:** Working application, source code, and technical
documentation\
**Deadline stated in brief:** 4 November 2026, 5:00 AM (Abuja/Lagos, WAT
/ GMT+1)

------------------------------------------------------------------------

## 1. Purpose and scope

Build a functional web-based university management system that supports
the four user roles below, with clearly defined permissions and
responsibilities.

The system must demonstrate:

-   Proper role-based access control.
-   Academic data management.
-   Course registration.
-   Result management and approval.
-   Administrative access and oversight.

The goal is a **functional MVP**, not a complete university ERP system.

### Agreed technology direction

-   **Frontend:** Next.js
-   **Backend:** Node.js
-   **Database:** MongoDB

The candidate may choose the preferred technology stack, but must be
able to explain the architecture and technical decisions. Keep the
implementation maintainable and focused on the requirements in this
document. Do not introduce additional product modules that are outside
the assessment scope.

------------------------------------------------------------------------

## 2. User roles, permissions and restrictions

The platform must support exactly these four application roles.

### A. Student

Students must be able to:

-   Log in securely to their student dashboard.
-   View and update permitted personal profile information.
-   View their department, faculty, programme, and matriculation number.
-   View available courses for their programme and academic level.
-   Register courses for the current semester.
-   View registered courses and course units.
-   View academic results and semester grades.
-   View academic history and cumulative GPA (CGPA).
-   Download or print their course registration summary and result
    statement.

**Student restrictions:**

-   Students cannot register other students for courses.
-   Students cannot upload or modify official examination results.
-   Students cannot access lecturer or administrative dashboards.
-   Students cannot modify their academic records or grades.

### B. Lecturer

Lecturers must be able to:

-   Log in to their lecturer dashboard.
-   View and manage their assigned courses.
-   View students registered for their assigned courses.
-   Access class lists.
-   Enter students' continuous assessment (CA) and examination scores.
-   Save results as drafts.
-   Submit completed results for departmental review.
-   View submission status and feedback.
-   View basic course and student performance summaries.

**Lecturer restrictions:**

-   Lecturers can only manage courses assigned to them.
-   Lecturers cannot modify courses or students outside their assigned
    department or teaching responsibilities.
-   Submitted results cannot be edited without an authorized reopening.
-   Lecturers cannot approve their own submitted results.

### C. Department Admin

Department administrators must be able to:

-   Access a departmental dashboard.
-   Register and manage students within their department.
-   Create and manage lecturer profiles.
-   Create and manage departmental courses.
-   Assign lecturers to courses.
-   Manage academic levels and programmes.
-   View student course registrations.
-   Review submitted examination results.
-   Approve or reject submitted results.
-   Return results to lecturers for correction.
-   Generate basic departmental reports.

**Department Admin restrictions:**

-   Department administrators can only manage records within their
    assigned department.
-   They cannot access Super Admin functions.
-   They cannot alter system-wide settings or manage other departments.

### D. Super Admin

The Super Admin has overall control of the platform.

The Super Admin must be able to:

-   View the university-wide dashboard.
-   Create and manage faculties and departments.
-   Create and manage academic programmes.
-   Manage student and lecturer accounts.
-   Create and manage academic sessions and semesters.
-   Manage courses and course allocations.
-   Activate, deactivate, and suspend user accounts.
-   Manage user roles and permissions.
-   View and monitor course registrations.
-   View and oversee departmental result approvals.
-   Access university-wide academic reports.
-   Monitor system activities and administrative actions.

------------------------------------------------------------------------

## 3. Core platform modules

Implement the following modules and functionality:

  -----------------------------------------------------------------------
  Module                              Required functionality
  ----------------------------------- -----------------------------------
  Authentication                      Secure login, logout, and
                                      role-based redirection

  Student Management                  Student profiles, matriculation
                                      numbers, departments, and academic
                                      levels

  Lecturer Management                 Lecturer profiles, departmental
                                      assignments, and course allocations

  Faculty & Department Management     Create and manage faculties and
                                      departments

  Course Management                   Course codes, titles, units,
                                      levels, and semester allocation

  Course Registration                 Students register available courses
                                      for a semester

  Result Management                   CA scores, examination scores,
                                      grades, and GPA calculations

  Result Approval                     Lecturer submission, departmental
                                      review, and approval

  Academic Session Management         Manage academic sessions and
                                      semesters

  Reports                             Student lists, course registration
                                      reports, and academic performance
                                      summaries

  Admin Dashboard                     University-wide monitoring and
                                      administrative management
  -----------------------------------------------------------------------

------------------------------------------------------------------------

## 4. Required system workflows

These workflows must function correctly in the application.

### Workflow 1: Student Course Registration

1.  Student logs in.
2.  System identifies the student's department, programme, and academic
    level.
3.  Student views available courses for the current semester.
4.  Student selects courses and submits registration.
5.  System validates course availability and prevents duplicate
    registration.
6.  Registered courses appear on the student's dashboard.
7.  Department administrators can view the registrations.

### Workflow 2: Lecturer Result Submission

1.  Lecturer logs in.
2.  Lecturer views assigned courses.
3.  Lecturer selects a course.
4.  System displays the registered students.
5.  Lecturer enters CA and examination scores.
6.  System calculates total scores and corresponding grades.
7.  Lecturer saves results as drafts or submits them for approval.
8.  Department administrator reviews the submitted results.
9.  Department administrator approves or rejects the submission.
10. Approved results become visible to students.

### Workflow 3: Departmental Result Approval

1.  Department administrator logs in.
2.  Administrator views pending result submissions.
3.  Administrator selects a course.
4.  Administrator reviews submitted results.
5.  Administrator approves or rejects the results.
6.  If rejected, the lecturer receives feedback and can make corrections
    through the authorized correction/reopening process.
7.  Approved results become available to students.

### Workflow 4: Super Admin Management

1.  Super Admin logs in.
2.  Super Admin accesses the university-wide dashboard.
3.  Super Admin creates faculties and departments.
4.  Super Admin creates academic sessions and semesters.
5.  Super Admin manages student and lecturer accounts.
6.  Super Admin assigns users to their respective roles and departments.
7.  Super Admin monitors academic activities across the university.

------------------------------------------------------------------------

## 5. Technical requirements

The application must demonstrate:

-   Proper role-based access control (RBAC).
-   Secure authentication and session management.
-   Backend validation of user permissions.
-   Database relationships between students, lecturers, courses,
    departments, and results.
-   Data validation and duplicate prevention.
-   Secure storage and handling of academic records.
-   Audit trails for result submissions and approvals.
-   Responsive user interfaces.
-   Proper error handling and user feedback.
-   Clean, maintainable, and well-structured code.

**Security requirement:** Permissions must be enforced by the
backend/API, not only by hiding frontend navigation or buttons. Users
must not be able to access another role's protected resources by
directly calling endpoints or changing identifiers.

Candidates may choose their preferred implementation approach, but must
explain the architecture and technical decisions.

------------------------------------------------------------------------

## 6. Important business rules

The following rules must be enforced:

1.  A student can only register courses available to their department,
    programme, academic level, and semester.
2.  Students cannot register for the same course twice within the same
    semester.
3.  Lecturers can only enter results for courses assigned to them.
4.  Results must be submitted before departmental approval.
5.  Only authorized departmental administrators can approve results for
    their department.
6.  Students can only view approved results.
7.  Super Admin has university-wide administrative access.
8.  Every important result submission, approval, rejection, or
    modification must be traceable.

### GPA and grading

-   Use a documented grading scale.
-   The grading scale must be configurable or clearly documented.
-   GPA must use a standard credit-unit-weighted calculation.
-   Document the grading scale and calculation method used by the
    application.
-   Ensure the same grading rules are applied consistently wherever
    results and GPA are displayed.

### Result status and editing

The result process must support drafts, submission for review, approval,
rejection/return for correction, and approved results.

Submitted results must not be freely editable. Any correction after
submission must follow an authorized reopening/correction process and
must be traceable. Lecturers must not approve their own submissions.

------------------------------------------------------------------------

## 7. Deliverables

The candidate must submit:

1.  A functional web-based university management portal.
2.  Working dashboards for all four user roles.
3.  Source code.
4.  Database schema or ER diagram.
5.  README containing installation and setup instructions.
6.  Test login credentials for each user role.
7.  Brief technical documentation explaining:
    -   System architecture.
    -   Database structure.
    -   Permission logic.
8.  A short demonstration of the completed application.

The application should include sample data so the evaluation team can
test the different workflows without manually creating every record.

------------------------------------------------------------------------

## 8. Acceptance criteria

The recruitment test will be considered successful when:

-   All four user roles can log in and access their respective
    dashboards.
-   Each role has the correct permissions and restrictions.
-   Students can register courses.
-   Lecturers can view assigned courses and submit examination results.
-   Department administrators can review and approve results.
-   Students can view approved results.
-   Super Admin can manage faculties, departments, users, sessions, and
    semesters.
-   Unauthorized users cannot access restricted pages or backend
    endpoints.
-   Academic records are properly linked and stored in the database.
-   The system demonstrates the complete course registration and result
    approval workflows.

------------------------------------------------------------------------

## 9. Explicitly outside the 24-hour scope

The assessment states that candidates are **not required** to implement:

-   Online school fee payment gateways.
-   Accommodation booking and allocation.
-   Admission application and screening.
-   Biometric attendance.
-   SMS and email gateway integrations.
-   Mobile applications.
-   Full transcript verification and document certification.
-   Live integration with external university systems.

Do not spend assessment time implementing these items. They are outside
the stated scope.

------------------------------------------------------------------------

## 10. Evaluation criteria

Use these weights to guide implementation and testing priorities.

  Assessment area                               Weight
  ----------------------------------------- ----------
  System architecture and database design          15%
  Role-based access control and security           20%
  Student and course management                    15%
  Course registration workflow                     10%
  Result entry and approval workflow               15%
  Super Admin functionality                        10%
  UI/UX and responsiveness                          5%
  Code quality and documentation                    5%
  Testing and problem-solving                       5%
  **Total**                                   **100%**

------------------------------------------------------------------------

## 11. Submission instructions

Candidates must submit:

-   **Live Application URL:** A link to the deployed and accessible
    application.
-   **Test Credentials:** Login URL, username/email, and password for
    the selected user roles.
-   **Source Code:** GitHub repository link containing the complete
    source code.
-   **Technical Documentation:** A Google Docs, Notion, PDF, or README
    link explaining the system architecture, database structure,
    technology stack, security implementation, and setup instructions.
-   **Database Design:** A short database schema or ER diagram.
-   **Demonstration:** A short video walkthrough or availability for a
    live demonstration.

**Deadline stated in the assessment:** 4 November 2026, 5:00 AM,
Abuja/Lagos time (WAT, GMT+1).

The candidate must be able to explain the architecture, database
relationships, security implementation, and major technical decisions
made during development.

------------------------------------------------------------------------

## 12. Instructions for the AI development assistant

Use this document as the requirements reference for the assessment.

1.  Implement the requirements stated here; do not invent additional
    modules or expand the product scope.
2.  Preserve the four specified roles and their responsibilities and
    restrictions.
3.  Preserve the four specified workflows and business rules.
4.  Do not omit requirements because they are inconvenient or require
    additional implementation work.
5.  Do not treat the out-of-scope items as features to build.
6.  Use the agreed technology direction: Next.js, Node.js, and MongoDB.
7.  Do not assume a project folder structure or impose an architecture
    before discussing it with the developer. The developer will decide
    the project structure and implementation organisation.
8.  Before implementing a feature, ensure its behaviour matches the
    requirements in this document.
9.  If a requirement is ambiguous, identify the ambiguity and ask the
    developer rather than silently inventing a business rule.
10. Keep a requirements checklist and update it as features are
    implemented and tested.
11. Prioritise backend-enforced security, correct academic data
    relationships, course registration integrity, and the result
    submission/approval workflow.
12. Ensure the final application is demonstrable using the supplied test
    accounts and sample data.

**The objective is to deliver the assessment that was assigned---not a
larger or different university management product.**
