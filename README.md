# 🚀 CortexAI – Enterprise Knowledge Management & Workflow Automation Platform

An AI-powered Enterprise Knowledge Management & Workflow Automation Platform built using **Java, Spring Boot, React.js, PostgreSQL, Spring Security, Docker, Redis, Elasticsearch, and Google Gemini AI**.

CortexAI centralizes organizational knowledge, automates business workflows, enables intelligent document search, and provides an AI-powered assistant for employees.

---

## 📌 Problem Statement

Modern organizations use multiple disconnected systems such as emails, document repositories, HR portals, and project management tools. Employees spend significant time searching for information, managing documents, and completing repetitive workflows.

CortexAI addresses these challenges by providing an intelligent enterprise platform that integrates AI-powered document understanding, workflow automation, role-based access control, and analytics into a single system.

---

# ✨ Features

## 🔐 Authentication & Security

- JWT Authentication
- Role-Based Access Control (RBAC)
- Spring Security
- Secure Password Encryption
- Protected REST APIs

---

## 📂 Knowledge Management

- Document Upload
- Document Versioning
- AI Document Summarization
- Semantic Search
- Document Categorization
- File Management

---

## 🤖 AI Assistant

- Google Gemini AI Integration
- Enterprise Knowledge Chatbot
- Intelligent Question Answering
- Context-Aware Responses
- AI Document Summaries

---

## ⚙ Workflow Automation

- Task Management
- Approval Workflows
- Employee Dashboard
- Manager Dashboard
- Admin Dashboard
- Notification System

---

## 📊 Analytics Dashboard

- User Analytics
- Workflow Analytics
- System Reports
- Activity Monitoring
- Real-Time Dashboard

---

# 🏗 Architecture

```
                +----------------+
                |   React Frontend|
                +-------+--------+
                        |
                    REST APIs
                        |
        +---------------+----------------+
        |       Spring Boot Backend      |
        +---------------+----------------+
                |      |        |
          PostgreSQL  Redis  Elasticsearch
                |
         Google Gemini AI
```

---

# 🛠 Tech Stack

## Frontend

- React.js
- HTML5
- CSS3
- JavaScript
- Axios
- React Router

## Backend

- Java 21
- Spring Boot
- Spring Security
- Hibernate
- Spring Data JPA
- REST APIs
- Maven

## Database

- PostgreSQL

## AI

- Google Gemini AI

## Search

- Elasticsearch

## Cache

- Redis

## DevOps

- Docker
- Git
- GitHub

---

# 📁 Project Structure

```
cortexai-enterprise-os
│
├── backend
│   ├── controller
│   ├── service
│   ├── repository
│   ├── entity
│   ├── dto
│   ├── config
│   ├── security
│   └── util
│
├── frontend
│   ├── src
│   ├── components
│   ├── pages
│   ├── services
│   └── assets
│
├── database
│
├── docs
│
├── screenshots
│
└── README.md
```

---

# 🚀 Installation

### Clone Repository

```bash
git clone https://github.com/Shreyayadav05/cortexai-enterprise-os.git
```

### Backend

```bash
cd backend

mvn clean install

mvn spring-boot:run
```

### Frontend

```bash
cd frontend

npm install

npm run dev
```

---

# 🔑 Environment Variables

Create `.env`

```
DATABASE_URL=
DATABASE_USERNAME=
DATABASE_PASSWORD=

JWT_SECRET=

GEMINI_API_KEY=

REDIS_HOST=

ELASTICSEARCH_URL=
```

---

# 📸 Screenshots

<img width="1534" height="721" alt="image" src="https://github.com/user-attachments/assets/5370b007-159c-4b30-84e0-2b0a874e51b1" />
<img width="1536" height="727" alt="image" src="https://github.com/user-attachments/assets/2b9ade24-417d-4519-acbe-e25ae17404c9" />
<img width="1532" height="726" alt="image" src="https://github.com/user-attachments/assets/081090e5-281b-4f9f-a36f-436e06fe3837" />
<img width="1518" height="733" alt="image" src="https://github.com/user-attachments/assets/d730fdbe-d75c-42e3-8f9f-c44d4aaa9809" />
<img width="1536" height="758" alt="image" src="https://github.com/user-attachments/assets/b0b7a023-f569-4563-b07a-c769cd0fe642" />
<img width="1535" height="744" alt="image" src="https://github.com/user-attachments/assets/e8eeeee2-1fb1-411a-9eea-e7e8558fa58a" />
<img width="1536" height="733" alt="image" src="https://github.com/user-attachments/assets/bc435643-1012-4db0-9c9f-0b63e5ace477" />






# 🔮 Future Enhancements

- Voice Assistant
- OCR Support
- AI Meeting Notes
- Mobile Application
- Multi-language Support
- Cloud Deployment
- Kubernetes Support
- Real-Time Collaboration
- Email Automation

---

# 👩‍💻 Author

**Shreya B Yadav**

- GitHub: https://github.com/Shreyayadav05
- LinkedIn: *((https://github.com/Shreyayadav05))*

---

# ⭐ Support

If you find this project useful, consider giving it a ⭐ on GitHub.

---

## 📄 License

This project is licensed under the MIT License.
