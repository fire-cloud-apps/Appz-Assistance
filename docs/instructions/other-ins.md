## Start (Vibe Code)
    1. Start : " Read the @docs/README.md, file and understand completely and let me know once you are ready. "
    2. Close: " I am good to close the session, initiate the close actions. "
    3. Other Close: 'As per the closing plan give me the release-notes and store release notes under the folder
@docs/release-notes/ with defined naming.'


## Other Commands for flexibility
Hope you understood? If yes, Create a task plan and proceed accord


--- 

### All Instructions to follow
Module: 'Task Manager' 
Screen: 'Task'
Route: '/tasks/' 

Feature to Implement:  
Repeat task: I expect that for a 'Repeat Task', once it’s created with repeat enabled, marking it as completed should 
only apply to the current instance, and it should still repeat. For example, if a weekly task is set up on Monday 
with repeat enabled, completing it that week should count only for that week. When the next Monday comes, a new task 
should appear with the same title and other fields filled in—a copy of the completed task—while the original parent 
task remains open and not fully marked completed. 


---

### CLI Coder used
1. QWEN (Monday)
2. OpenCode (Tuesday)
3. Codex (Wednesday)
4. GEMINI (Thursday)
5. Copilot (Friday)

---



---
## New Module Development - (Creation of Technical Specifications)
"
Feature Description:
Overview: This document outlines the technical specifications for a React-based web application inspired by BreakTimer.  The application aims to help users maintain focus and prevent strain by providing configurable break reminders during their working hours.

Core Features: The application will include the following core features:
-   Configurable Break Schedules: Users will be able to define different types of breaks (e.g., micro-breaks, longer breaks) with customizable durations and intervals. This includes setting the frequency and length of each break type.
-   Customizable Appearance and Messages: Users will have options to personalize the visual theme of the application and the content of the messages displayed during break notifications.
-   Working Hours Configuration--: Users can specify their daily working hours. Break reminders will only be active within these defined periods.
-   Smart Notifications: The system will provide intelligent, non-intrusive break reminders. Users will have the option to skip a current break or snooze it for a short, configurable duration.
-   Responsive Design: The application's user interface will be designed to be fully responsive, ensuring optimal usability and appearance across various devices and screen sizes (desktop, tablet, mobile).
    "
    Based on the above feature, understand the existing technical specifications of ('TaskManager.md') understand the structure of the application and the flow of the application, then create the tech specification document for the mentioned modules and with its feature.