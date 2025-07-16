# CodeViz Research Context

> **Note**: This file contains research context from CodeViz. Most recent contexts are at the bottom.

---

## Research Query

What is the route scheme?

*Session: 85bfcf943ad628f147e0abf300e5ecbe | Generated: 7/14/2025, 5:04:31 PM*

### Analysis Summary

# Route Scheme Analysis

The application utilizes **React Router DOM** for its client-side routing, defining a hierarchical route scheme. The primary routing configuration is established within the main application component, [App.tsx](src/App.tsx), which then delegates to a nested routing structure within the [Dashboard](src/pages/pages/dashboard.tsx) component.

## High-Level Routing

The top-level routing is managed by the [App](src/App.tsx) component. This component acts as the entry point for the application's routing, rendering different components based on the URL path.

*   **Purpose:** Defines the main entry points and global routes for the application.
*   **Internal Parts:** It likely contains a `<Routes>` component that encapsulates various `<Route>` definitions.
*   **External Relationships:** It serves as the parent for all other routed components, including the [Dashboard](src/pages/pages/dashboard.tsx).

## Mid-Level Routing: Dashboard

The [Dashboard](src/pages/pages/dashboard.tsx) component is a significant part of the application's routing scheme, handling a large set of nested routes related to various dashboard functionalities.

*   **Purpose:** Manages the routing for all features accessible within the authenticated dashboard area, such as assessments, configurations, courses, instructors, students, and tests.
*   **Internal Parts:**
    *   It uses `react-router-dom`'s `<Routes>` and `<Route>` components to define nested routes.
    *   It imports and renders various components for each specific route, such as:
        *   [CSA_PDF](src/pages/pages/dashboard/assessment/CSA_PDF.tsx)
        *   [CSAD_form](src/pages/pages/dashboard/assessment/CSAD_form.tsx)
        *   [detailAssessment](src/pages/pages/dashboard/assessment/detailAssessment.tsx)
        *   [generalAssessment](src/pages/pages/dashboard/assessment/generalAssessment.tsx)
        *   [lessonDetails](src/pages/pages/dashboard/assessment/lessonDetails.tsx)
        *   [newAssessment](src/pages/pages/dashboard/assessment/newAssessment.tsx)
        *   [scoreDetail](src/pages/pages/dashboard/assessment/scoreDetail.tsx)
        *   [courseDetail](src/pages/pages/dashboard/config/courseDetail.tsx)
        *   [generalConfig](src/pages/pages/dashboard/config/generalConfig.tsx)
        *   [lessonDetail](src/pages/pages/dashboard/config/lessonDetail.tsx)
        *   [modalFormCourse](src/pages/pages/dashboard/config/modalFormCourse.tsx)
        *   [modalFormSubject](src/pages/pages/dashboard/config/modalFormSubject.tsx)
        *   [newAnswerQuestionTest](src/pages/pages/dashboard/config/newAnswerQuestionTest.tsx)
        *   [newQuestionTest](src/pages/pages/dashboard/config/newQuestionTest.tsx)
        *   [newTestModal](src/pages/pages/dashboard/config/newTestModal.tsx)
        *   [questionTest](src/pages/pages/dashboard/config/questionTest.tsx)
        *   [questionTestList](src/pages/pages/dashboard/config/questionTestList.tsx)
        *   [questionType](src/pages/pages/dashboard/config/questionType.tsx)
        *   [testList](src/pages/pages/dashboard/config/testList.tsx)
        *   [testParams](src/pages/pages/dashboard/config/testParams.tsx)
        *   [Check](src/pages/pages/dashboard/config/questionTypeTest/Check.tsx)
        *   [Completion](src/pages/pages/dashboard/config/questionTypeTest/Completion.tsx)
        *   [Input](src/pages/pages/dashboard/config/questionTypeTest/Input.tsx)
        *   [Radio](src/pages/pages/dashboard/config/questionTypeTest/Radio.tsx)
        *   [generalCourses](src/pages/pages/dashboard/courses/generalCourses.tsx)
        *   [newCourseStudentSchedule](src/pages/pages/dashboard/courses/newCourseStudentSchedule.tsx)
        *   [newCourseStudentScheduleSubject](src/pages/pages/dashboard/courses/newCourseStudentScheduleSubject.tsx)
        *   [pdfCourseSchedule](src/pages/pages/dashboard/courses/pdfCourseSchedule.tsx)
        *   [tableInstructors](src/pages/pages/dashboard/instructors/tableInstructors.tsx)
        *   [tableStudents](src/pages/pages/dashboard/students/tableStudents.tsx)
        *   [generalTest](src/pages/pages/dashboard/test/generalTest.tsx)
        *   [newTest](src/pages/pages/dashboard/test/newTest.tsx)
        *   [questionTypeCheck](src/pages/pages/dashboard/test/questionTypeCheck.tsx)
        *   [questionTypeCompletion](src/pages/pages/dashboard/test/questionTypeCompletion.tsx)
        *   [questionTypeInput](src/pages/pages/dashboard/test/questionTypeInput.tsx)
        *   [questionTypeRadio](src/pages/pages/dashboard/test/questionTypeRadio.tsx)
        *   [resultsTestPdf](src/pages/pages/dashboard/test/resultsTestPdf.tsx)
        *   [reviewItemList](src/pages/pages/dashboard/test/reviewItemList.tsx)
        *   [reviewTest](src/pages/pages/dashboard/test/reviewTest.tsx)
        *   [modalFormUser](src/pages/pages/dashboard/users/modalFormUser.tsx)
        *   [usersTable](src/pages/pages/dashboard/users/usersTable.tsx)
*   **External Relationships:** It is rendered by the main [App](src/App.tsx) component when the path matches the dashboard route. It uses `useNavigate` from `react-router-dom` for programmatic navigation.

## Low-Level Routing Details

Individual components within the application use `useNavigate` and `useParams` hooks from `react-router-dom` to handle navigation and extract route parameters.

*   **`useNavigate`**: Used for imperative navigation, such as redirecting after a successful login ([login.tsx](src/pages/login.tsx:11), [HomePage.tsx](src/pages/HomePage.tsx:3)) or navigating between dashboard sections ([generalAssessment.tsx](src/pages/pages/dashboard/assessment/generalAssessment.tsx:7), [generalConfig.tsx](src/pages/pages/dashboard/config/generalConfig.tsx:10)).
*   **`useParams`**: Used to extract dynamic segments from the URL, such as IDs for specific courses ([courseDetail.tsx](src/pages/pages/dashboard/config/courseDetail.tsx:18)) or tests ([testList.tsx](src/pages/pages/dashboard/config/testList.tsx:1)).

The overall route scheme is defined by the combination of these components and their respective route definitions, creating a clear and navigable structure for the application.

