# Project Context: Hive.tn Backend

## 1. Project Goal
Build the backend for a Tunisian crowdfunding platform named Hive.tn. [cite_start]The platform operates on a flexible "Gardez ce que vous récoltez" (Keep what you raise) financial model[cite: 893]. [cite_start]It integrates local payment gateways (such as Flouci or Konnect) confirmed exclusively via secure server-to-server Webhooks[cite: 897]. [cite_start]A major innovation of this platform is the "Jalons" (Milestones) system, which releases funds in tranches upon validation of project proofs by an administrator[cite: 900].

## 2. Tech Stack
* [cite_start]**Frontend:** Vite with React 18, React Router DOM (v7), and standard CSS[cite: 1031, 1032].
* **Backend:** Node.js with Express.js.
* **Database:** PostgreSQL (chosen for handling complex financial and relational data).
* [cite_start]**Security:** * Password hashing using BCrypt (cost ≥ 12)[cite: 957].
  * [cite_start]Session authentication using JWT (tokens expiring after 24h maximum)[cite: 957].

## 3. Design Patterns & Architecture
* **Architecture:** MVC (Model-View-Controller) to ensure a clean separation between data models, routing, and business logic.
* **API Style:** RESTful API returning standard JSON responses.
* **Separation of Concerns:** Strict separation between the front-end client and back-end server logic. The backend acts solely as an API and does not render views.