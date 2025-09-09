# 🏥 LLM Performance Comparison in a Healthcare App

## 📌 Project Overview

This project compares the performance of various **Large Language Models (LLMs)** integrated into a healthcare-focused app. It applies **software engineering principles** to evaluate LLMs across multiple metrics and platforms.

---

## 🎯 Application Use Case

The app allows users to input **healthcare-related questions**, which are processed by both **cloud-based** and **local LLMs**, enabling a detailed **performance comparison**.

---

## 🚀 Objectives

### 1️⃣ Develop the App

- Build an interactive, secure app for healthcare-related chat with LLMs.
- Include **cloud-based APIs** (e.g., OpenAI, Gemini, Claude, Grok) and **local models**.

### 2️⃣ Integrate Multiple LLMs

- Compare models from:
  - **Cloud-based**: OpenAI (ChatGPT), Gemini, Claude, Grok.
  - **Local**: bioGPT, LLama-3.2 (1B).

### 3️⃣ Test Across Devices & Conditions

- Evaluate performance on **mobile**, **laptop**, **cloud VMs**, and **edge devices**.
- Simulate **varied network conditions** to test reliability and latency.

### 4️⃣ Measure Key Metrics

- ⏱ **Response Time**
- 🎯 **Accuracy & Relevance**
- 🧠 **Resource Usage** (CPU, RAM, GPU)
- 🚧 **Latency & Delay Analysis**

### 5️⃣ Visualize Data

- Collect and analyze results using **charts, graphs, and tables**.

---

## 🛠️ Technologies Used

### 🔹 Primary Language

- **TypeScript**

### 🔹 IDE

- **Visual Studio Code (VSCode)**

### 🔹 Frontend

- **React Native** – UI development
- **Zustand** – State management
- **Ky** – HTTP requests
- **Gluestick** – UI component library
- **Firebase Auth** – Authentication

### 🔹 Backend

- **Express.js** – API and service handling
- **Mongoose (ORM)** – MongoDB interaction
- **Axios** – Internal and external HTTP requests

### 🔹 Database

- **MongoDB**

### 🔹 Microservices

- **Express.js** – Microservice framework
- **LLM SDKs/APIs** – Official packages from OpenAI, Anthropic, Google, etc.

---

## 📲 How to Use the App

1. **Sign in** with your credentials via Firebase.
2. Fill in patient details (Name, Age, Height, Weight, Symptoms).
3. Tap **Start Chatting**.
4. Choose your preferred LLM from the dropdown.
5. Begin the conversation and **compare results** across models.

> 🔐 If a signed-out user tries to access any protected page (like the form or chat), the app **redirects them to the Sign-In screen**.

---

## 🧑‍💻 User Features

- 🧾 Fetch & **resume previous chat sessions**.
- 🧠 Compare different model responses on identical queries.
- 📈 View **performance stats** and **model efficiency** insights.

---

## 📊 Expected Outcomes

- In-depth analysis of **cloud vs. local LLMs** in a real-world app.
- Software engineering insights into **LLM integration**.
- Visualization dashboards to present the performance metrics.

---

## 🧱 Architecture Diagrams

> ✅ Updated versions of the following diagrams are required:

- Class Diagrams (Class & Class2)
- Activity Diagram
- State Diagram
- Network Architecture Diagram
- Sequence Diagram (with correct tools and tech stack)

### 🔁 Auth Flow (Activity/State Diagram)

1. User opens the app → lands on homepage.
2. Clicks button to go to form.
3. If **not signed in** → auto redirected to **Sign-In** page.

---

### 🔮 Future Enhancements

- Expand into other industries like education, finance, legal.

- Add support for new LLMs as they are released.

- Enhance the benchmarking engine for deeper analysis and automation.

### 📚 License

This project is licensed under the MIT License.

### 👥 Contributors

- Adheil Gupta (23BDS002)
- Arnav Gupta (23BDS009)
- Atharva Agrawal (23BDS010)
- Surya Narayana Rao (23BDS025)

# 🚀 Project Setup

Follow these steps to set up and run the project locally:

---

## 🖥️ Clone the Repository

```bash
git clone <repo-url>
cd <repo-directory>
```

---

## 🌐 Start Frontend

```bash
cd frontend
```

1. Replace `<your-IP>` in the project files with the **IP address of the backend server**.
2. Open the `firebaseConfig.js, GoogleService-Info.plist, google-services.json` file and populate it with your **Firebase project configuration**.

### 📦 Install Dependencies

```bash
npx install-expo-modules@latest
npm install
```

### ▶️ Start the Development Server

```bash
npx expo start
```

---

## 🧠 Start Microservice (Models)

```bash
cd models
```

1. Create a `.env` file.
2. Follow the format provided in `.env.example`.
3. Populate the keys using your **model files and credentials**.

### 📦 Install Dependencies

```bash
npm install
```

### ▶️ Start the Development Server

```bash
npm start
```

---

## 🛠️ Start Backend

```bash
cd backend
```

1. Create a `.env` file.
2. Follow the format provided in `.env.example`.
3. Populate the keys using your **own configuration values**.

### 📦 Install Dependencies

```bash
npm install
```

### ▶️ Start the Development Server

```bash
npm start
```
