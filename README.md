<div align="center">
  <img src="https://github.com/user-attachments/assets/86889416-b02b-4944-a04f-7b9e9f5c8f8d"
       style="width: 100%; max-width: 100%;" />
</div>


# Zone
[![Made with Love and Caffeine](https://img.shields.io/badge/Made%20with%20Love%20and%20Caffeine-9b59b6?style=for-the-badge&logo=coffeescript&logoColor=white)]() 
<p align="left">By <a href="https://github.com/annasuzan">Anna Susan Cherian</a> & <a href="https://github.com/Pavithra-Rajan">Pavithra Rajan</a></p>

Welcome! This repository is created as part of ODSC AI Hackathon 2025.

## Problem Statement
We’ve all been there. Packed with ambition, yet stuck wondering how to plan the day. Parkinson’s Law says that work expands to fill the time we give it. If you give yourself a week to write a paper, it magically takes a week. But shrink that window to just two days? Suddenly, you get it done in two.

Even high-performers like Elon Musk use this to their advantage, setting ultra-tight deadlines to rocket their progress forward.

### Time-blocking is powerful
But let’s be honest, manually planning your calendar can eat up 30 precious minutes every morning. That’s where Zone steps in.

### Why Zone?
With Zone, you simply type your to-dos in natural language, add constraints if needed, and let the magic happen. Zone reads your Google Calendar, understands your existing events, intelligently estimates how long your tasks should take, and auto-creates optimized time blocks around your schedule.

#### Preview it. Approve it. And boom, your entire day is planned in under two minutes.
That’s 28 minutes saved, ready to spend on actually doing the work or, you know, grabbing a coffee.

### Ready to be in the zone?
<img width="1901" height="1050" alt="image" src="https://github.com/user-attachments/assets/7194252f-9ec6-412b-9adb-fd8e9bc5a372" />
<img width="1901" height="1050" alt="image" src="https://github.com/user-attachments/assets/6d85adeb-bec0-42f4-9e28-557dc713d4b1" />

#### Zone: Because your time deserves better than planning it.
## Submission Checklist

- [x] All code in `src/` runs without errors  
- [x] `ARCHITECTURE.md` contains a clear diagram sketch and explanation  
- [x] `EXPLANATION.md` covers planning, tool use, memory, and limitations  
- [ ] `DEMO.md` links to a 3–5 min video with timestamped highlights  


## Getting Started
1. Clone the repository
2. Start the frontend:
```
cd src/frontend
npm i
npm run dev
```
3. Start the backend FastAPI server
```
# create a virtual environment
python3 -m venv venv
# install the python packages
pip install -r requirements.txt
# start the server
python -m uvicorn executor:app --reload --port 8000
```

## Folder Layout

```
tree -I "node_modules|__pycache__|venv"  

.
├── ARCHITECTURE.md
├── DEMO.md
├── EXPLANATION.md
├── images
│   └── folder-githb.png
├── LICENSE
├── logs
├── README.md
└── src
    ├── client_secret_588465002822-qd2mph5ci7utptfs4073p9vc0sldihqm.apps.googleusercontent.com.json
    ├── executor.log
    ├── executor.py
    ├── frontend
    │   ├── bun.lockb
    │   ├── components.json
    │   ├── eslint.config.js
    │   ├── index.html
    │   ├── package.json
    │   ├── package-lock.json
    │   ├── postcss.config.js
    │   ├── public
    │   │   ├── favicon.ico
    │   │   ├── placeholder.svg
    │   │   └── robots.txt
    │   ├── README.md
    │   ├── src
    │   │   ├── App.css
    │   │   ├── App.tsx
    │   │   ├── components
    │   │   │   ├── chronos
    │   │   │   │   ├── ActionBar.tsx
    │   │   │   │   ├── AgentStatus.tsx
    │   │   │   │   ├── BrainDumpInput.tsx
    │   │   │   │   ├── Header.tsx
    │   │   │   │   ├── TaskCard.tsx
    │   │   │   │   ├── TaskList.tsx
    │   │   │   │   └── Timeline.tsx
    │   │   │   ├── NavLink.tsx
    │   │   │   └── ui
    │   │   │       ├── accordion.tsx
    │   │   │       ├── alert-dialog.tsx
    │   │   │       ├── alert.tsx
    │   │   │       ├── aspect-ratio.tsx
    │   │   │       ├── avatar.tsx
    │   │   │       ├── badge.tsx
    │   │   │       ├── breadcrumb.tsx
    │   │   │       ├── button.tsx
    │   │   │       ├── calendar.tsx
    │   │   │       ├── card.tsx
    │   │   │       ├── carousel.tsx
    │   │   │       ├── chart.tsx
    │   │   │       ├── checkbox.tsx
    │   │   │       ├── collapsible.tsx
    │   │   │       ├── command.tsx
    │   │   │       ├── context-menu.tsx
    │   │   │       ├── dialog.tsx
    │   │   │       ├── drawer.tsx
    │   │   │       ├── dropdown-menu.tsx
    │   │   │       ├── form.tsx
    │   │   │       ├── hover-card.tsx
    │   │   │       ├── input-otp.tsx
    │   │   │       ├── input.tsx
    │   │   │       ├── label.tsx
    │   │   │       ├── menubar.tsx
    │   │   │       ├── navigation-menu.tsx
    │   │   │       ├── pagination.tsx
    │   │   │       ├── popover.tsx
    │   │   │       ├── progress.tsx
    │   │   │       ├── radio-group.tsx
    │   │   │       ├── resizable.tsx
    │   │   │       ├── scroll-area.tsx
    │   │   │       ├── select.tsx
    │   │   │       ├── separator.tsx
    │   │   │       ├── sheet.tsx
    │   │   │       ├── sidebar.tsx
    │   │   │       ├── skeleton.tsx
    │   │   │       ├── slider.tsx
    │   │   │       ├── sonner.tsx
    │   │   │       ├── switch.tsx
    │   │   │       ├── table.tsx
    │   │   │       ├── tabs.tsx
    │   │   │       ├── textarea.tsx
    │   │   │       ├── toaster.tsx
    │   │   │       ├── toast.tsx
    │   │   │       ├── toggle-group.tsx
    │   │   │       ├── toggle.tsx
    │   │   │       ├── tooltip.tsx
    │   │   │       └── use-toast.ts
    │   │   ├── hooks
    │   │   │   ├── use-mobile.tsx
    │   │   │   └── use-toast.ts
    │   │   ├── index.css
    │   │   ├── lib
    │   │   │   └── utils.ts
    │   │   ├── main.tsx
    │   │   ├── pages
    │   │   │   ├── Index.tsx
    │   │   │   └── NotFound.tsx
    │   │   └── vite-env.d.ts
    │   ├── tailwind.config.ts
    │   ├── tsconfig.app.json
    │   ├── tsconfig.json
    │   ├── tsconfig.node.json
    │   └── vite.config.ts
    ├── google_calendar_api.py
    ├── llm.py
    ├── memories.jsonl
    ├── memory.py
    ├── planner.py
    ├── requirements.txt
    └── token.json
```
## Judging Criteria

- **Technical Excellence**  
  This criterion evaluates the robustness, functionality, and overall quality of the technical implementation. Judges will assess the code's efficiency, the absence of critical bugs, and the successful execution of the project's core features.

- **Solution Architecture & Documentation**  
  This focuses on the clarity, maintainability, and thoughtful design of the project's architecture. This includes assessing the organization and readability of the codebase, as well as the comprehensiveness and conciseness of documentation (e.g., GitHub README, inline comments) that enables others to understand and potentially reproduce or extend the solution.

- **Innovative Gemini Integration**  
  This criterion specifically assesses how effectively and creatively the Google Gemini API has been incorporated into the solution. Judges will look for novel applications, efficient use of Gemini's capabilities, and the impact it has on the project's functionality or user experience. You are welcome to use additional Google products.

- **Societal Impact & Novelty**  
  This evaluates the project's potential to address a meaningful problem, contribute positively to society, or offer a genuinely innovative and unique solution. Judges will consider the originality of the idea, its potential real‑world applicability, and its ability to solve a challenge in a new or impactful way.


