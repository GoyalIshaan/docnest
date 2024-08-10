# DocNest: Real-Time Collaborative Text Editor

DocNest is a real-time text editing collaboration platform. This project showcases the implementation of a distributed system for concurrent editing, addressing challenges such as conflict resolution and eventual consistency.

## Tech Stack

### Frontend

- ![Vite](https://img.shields.io/badge/-Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white) Vite
- ![React](https://img.shields.io/badge/-React-61DAFB?style=for-the-badge&logo=react&logoColor=black) React
- ![TypeScript](https://img.shields.io/badge/-TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white) TypeScript
- ![Framer Motion](https://img.shields.io/badge/-Framer_Motion-0055FF?style=for-the-badge&logo=framer&logoColor=white) Framer Motion
- ![Tailwind CSS](https://img.shields.io/badge/-Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white) Tailwind CSS

### Backend

- ![Node.js](https://img.shields.io/badge/-Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white) Node.js
- ![TypeScript](https://img.shields.io/badge/-TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white) TypeScript
- ![Express](https://img.shields.io/badge/-Express-000000?style=for-the-badge&logo=express&logoColor=white) Express
- ![WebSocket](https://img.shields.io/badge/-WebSocket-010101?style=for-the-badge&logo=socketdotio&logoColor=white) WebSocket

### Database

- ![PostgreSQL](https://img.shields.io/badge/-PostgreSQL-336791?style=for-the-badge&logo=postgresql&logoColor=white) PostgreSQL
- ![Prisma](https://img.shields.io/badge/-Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white) Prisma

### External Libraries

- ![Yjs](https://img.shields.io/badge/-Yjs-FFCB2D?style=for-the-badge) Yjs
- ![Quill](https://img.shields.io/badge/-Quill-1D1E30?style=for-the-badge) Quill

## Key Learning Points

### Conflict-free Replicated Data Types (CRDTs)

In developing DocNest, I gained a deep understanding of CRDTs and their crucial role in enabling real-time collaboration. CRDTs provide a mathematical foundation for managing concurrent updates without conflicts, ensuring that all users converge to the same final state regardless of the order in which they receive updates.

### Race Conditions in Text Editing

I learned to identify and mitigate race conditions that can occur in collaborative text editing. These situations arise when multiple users attempt to modify the same part of a document simultaneously. By implementing proper synchronization mechanisms and leveraging the CRDT properties of Yjs, I ensured that such race conditions are handled gracefully, maintaining document integrity.

### Achieving Eventual Consistency

One of the core challenges in distributed systems is achieving eventual consistency. Through this project, I learned how to design and implement a system that guarantees all replicas of the shared document will eventually reach the same state, even in the face of network delays, disconnections, and out-of-order message delivery.

### Other Challenges and Learning Opportunities

1. **Real-time Synchronization**: Implementing efficient real-time synchronization between multiple clients and the server using WebSockets and Yjs.

2. **Operational Transformation vs. CRDTs**: Understanding the trade-offs between Operational Transformation (OT) and CRDTs, and why CRDTs were chosen for this project.

3. **Scalability Considerations**: Designing the system to handle a growing number of concurrent users and larger documents.

4. **Offline Support**: Implementing offline editing capabilities and seamless synchronization upon reconnection.

5. **Version History and Time Travel**: Developing a system for maintaining document version history and allowing users to revert to previous states.

6. **Performance Optimization**: Optimizing the performance of real-time updates, especially for large documents with many concurrent editors.

7. **Security and Access Control**: Implementing secure authentication and fine-grained access control for collaborative editing.

8. **UI/UX for Collaborative Editing**: Designing an intuitive user interface that provides real-time feedback on other users' actions and presence.
