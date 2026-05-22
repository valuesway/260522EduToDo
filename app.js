/* ==========================================================================
   EduTodo: 스마트 교무 수첩 - Core JavaScript Logic
   ========================================================================== */

// 1. Initial Default State (Pre-populated if LocalStorage is empty)
const DEFAULT_CATEGORIES = [
  { name: '행정업무', color: 'violet' },
  { name: '수업준비', color: 'emerald' },
  { name: '학생상담', color: 'amber' }
];

const DEFAULT_TIMETABLE = [
  { period: 1, subject: '수학', memo: '교과서 45~50p 및 형성평가 학습지 인쇄물 분배' },
  { period: 2, subject: '국어', memo: 'PPT 2단원 본문 읽기 및 발표 조 편성 완료' },
  { period: 3, subject: '과학', memo: '과학실 기자재 확인 및 모둠 실험 준비' },
  { period: 4, subject: '행정실무', memo: '학교운영위원회 안건 기안문 작성 및 내부결재 상신' },
  { period: 5, subject: '창체', memo: '방송 교육 자료(학교 폭력 예방) 확인' },
  { period: 6, subject: '동아리', memo: '체육관 동아리 일지 작성 및 인원 확인' }
];

const DEFAULT_TASKS = [
  {
    id: 'task-1',
    title: '3학년 1학기 수학 기말고사 평가 문제 출제 완료 및 인쇄소 제출',
    category: '수업준비',
    priority: 'high',
    dueDate: getRelativeDate(2), // 2 days later
    completed: false,
    createdAt: Date.now() - 86400000
  },
  {
    id: 'task-2',
    title: '교육청 주관 창의 융합 캠프 지원 예산안 품의 작성 (내부결재)',
    category: '행정업무',
    priority: 'medium',
    dueDate: getRelativeDate(5), // 5 days later
    completed: false,
    createdAt: Date.now() - 43200000
  },
  {
    id: 'task-3',
    title: '미술 동아리 부원 개인별 활동 내역 나이스 입력 및 확인',
    category: '행정업무',
    priority: 'low',
    dueDate: getRelativeDate(-1), // 1 day ago (Overdue)
    completed: false,
    createdAt: Date.now() - 172800000
  },
  {
    id: 'task-4',
    title: '학생 진로 탐색을 위한 진로 상담 일지 및 나이스 기록 작성',
    category: '학생상담',
    priority: 'medium',
    dueDate: getRelativeDate(1), // Tomorrow
    completed: true,
    createdAt: Date.now() - 259200000
  }
];

const DEFAULT_STUDENT_NOTES = [
  {
    id: 'note-1',
    name: '김철수',
    content: '수업 도중 최근 며칠 동안 졸음이 잦음. 가정통신문 확인 시 학원 스케줄이 너무 늦게 끝나는 것으로 파악됨. 학부모님과 유선상으로 가벼운 생활 면담 진행 완료 (규칙적인 수면 권장).',
    date: '2026-05-21 14:30'
  },
  {
    id: 'note-2',
    name: '이영희',
    content: '교내 수학 경시대회 참가 관련하여 심화 문항 풀이에 질문이 많음. 쉬는 시간 틈틈이 피드백 제공함. 대회 준비 집중력이 매우 높고 동기부여가 강하게 되어 있음.',
    date: '2026-05-22 10:15'
  }
];

// Helper to get relative date strings (YYYY-MM-DD)
function getRelativeDate(offsetDays) {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  return date.toISOString().split('T')[0];
}

// 2. Global State Setup
let state = {
  categories: JSON.parse(localStorage.getItem('edu_categories')) || DEFAULT_CATEGORIES,
  timetable: JSON.parse(localStorage.getItem('edu_timetable')) || DEFAULT_TIMETABLE,
  tasks: JSON.parse(localStorage.getItem('edu_tasks')) || DEFAULT_TASKS,
  studentNotes: JSON.parse(localStorage.getItem('edu_student_notes')) || DEFAULT_STUDENT_NOTES,
  activeFilter: 'all', // category filter
  activeTab: 'active', // 'active' or 'completed'
  currentSort: 'created-desc',
  searchQuery: ''
};

// Colors mapping for dynamically created categories
const CATEGORY_COLORS = {
  blue: '#3b82f6',
  emerald: '#10b981',
  violet: '#8b5cf6',
  amber: '#f59e0b',
  rose: '#ef4444',
  cyan: '#06b6d4'
};

// 3. App Initialization
document.addEventListener('DOMContentLoaded', () => {
  initClock();
  initTheme();
  renderAll();
  setupEventListeners();
  feather.replace();
});

// Save all states to LocalStorage
function saveStateToStorage() {
  localStorage.setItem('edu_categories', JSON.stringify(state.categories));
  localStorage.setItem('edu_timetable', JSON.stringify(state.timetable));
  localStorage.setItem('edu_tasks', JSON.stringify(state.tasks));
  localStorage.setItem('edu_student_notes', JSON.stringify(state.studentNotes));
}

// 4. Clock and Time Handler
function initClock() {
  const dateEl = document.getElementById('current-date');
  const timeEl = document.getElementById('current-time');
  
  function updateTime() {
    const now = new Date();
    
    // Formatting date
    const days = ['일', '월', '화', '수', '목', '금', '토'];
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const date = String(now.getDate()).padStart(2, '0');
    const day = days[now.getDay()];
    
    dateEl.innerText = `${year}년 ${month}월 ${date}일 (${day})`;
    
    // Formatting time
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    
    timeEl.innerText = `${hours}:${minutes}:${seconds}`;
  }
  
  updateTime();
  setInterval(updateTime, 1000);
}

// 5. Theme Toggle Logic (Light / Dark)
function initTheme() {
  const savedTheme = localStorage.getItem('edu_theme') || 'light';
  applyTheme(savedTheme);
  
  const themeBtn = document.getElementById('theme-toggle-btn');
  themeBtn.addEventListener('click', () => {
    const currentTheme = document.body.classList.contains('dark-theme') ? 'light' : 'dark';
    applyTheme(currentTheme);
  });
}

function applyTheme(theme) {
  const darkIcon = document.querySelector('.theme-icon-dark');
  const lightIcon = document.querySelector('.theme-icon-light');
  
  if (theme === 'dark') {
    document.body.classList.remove('light-theme');
    document.body.classList.add('dark-theme');
    darkIcon.style.display = 'none';
    lightIcon.style.display = 'block';
  } else {
    document.body.classList.remove('dark-theme');
    document.body.classList.add('light-theme');
    darkIcon.style.display = 'block';
    lightIcon.style.display = 'none';
  }
  localStorage.setItem('edu_theme', theme);
}

// 6. Confetti Particle Engine for Completing Task Celebration
class ConfettiParticle {
  constructor(canvas) {
    this.canvas = canvas;
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height - canvas.height;
    this.r = Math.random() * 6 + 4;
    this.d = Math.random() * canvas.height;
    this.color = `hsl(${Math.random() * 360}, 80%, 60%)`;
    this.tilt = Math.random() * 10 - 5;
    this.tiltAngleIncremental = Math.random() * 0.07 + 0.02;
    this.tiltAngle = 0;
    this.vx = Math.random() * 4 - 2;
    this.vy = Math.random() * 5 + 3;
  }
  
  update() {
    this.y += this.vy;
    this.x += this.vx;
    this.tiltAngle += this.tiltAngleIncremental;
    this.tilt = Math.sin(this.tiltAngle) * 12;
  }
}

let confettiActive = false;
let confettiParticles = [];
const confettiCanvas = document.getElementById('confetti-canvas');
const ctx = confettiCanvas.getContext('2d');

function resizeConfettiCanvas() {
  confettiCanvas.width = window.innerWidth;
  confettiCanvas.height = window.innerHeight;
}

window.addEventListener('resize', resizeConfettiCanvas);

function triggerConfetti() {
  resizeConfettiCanvas();
  confettiParticles = [];
  for (let i = 0; i < 150; i++) {
    confettiParticles.push(new ConfettiParticle(confettiCanvas));
  }
  
  if (!confettiActive) {
    confettiActive = true;
    animateConfetti();
  }
}

function animateConfetti() {
  if (confettiParticles.length === 0) {
    confettiActive = false;
    ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    return;
  }
  
  ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
  
  for (let i = 0; i < confettiParticles.length; i++) {
    const p = confettiParticles[i];
    p.update();
    
    ctx.beginPath();
    ctx.lineWidth = p.r;
    ctx.strokeStyle = p.color;
    ctx.moveTo(p.x + p.tilt + p.r / 2, p.y);
    ctx.lineTo(p.x + p.tilt, p.y + p.tilt + p.r / 2);
    ctx.stroke();
  }
  
  // Filter out particles that fell off the screen
  confettiParticles = confettiParticles.filter(p => p.y < confettiCanvas.height && p.x > -50 && p.x < confettiCanvas.width + 50);
  
  if (confettiActive) {
    requestAnimationFrame(animateConfetti);
  }
}

// 7. Core Rendering Functions
function renderAll() {
  renderCategories();
  renderTimetable();
  renderStats();
  renderTasks();
  renderStudentNotes();
  updateCategoryDropdown();
  saveStateToStorage();
}

// Render Categories in Left Sidebar Filters
function renderCategories() {
  const filterList = document.getElementById('category-filter-list');
  const activeCat = state.activeFilter;
  
  // Keep first "All" chip, remove others to rebuild
  const allChip = filterList.querySelector('[data-category="all"]');
  allChip.className = `category-chip ${activeCat === 'all' ? 'active' : ''}`;
  allChip.querySelector('#count-all').innerText = state.tasks.filter(t => !t.completed).length;
  
  // Remove siblings
  while (filterList.children.length > 1) {
    filterList.removeChild(filterList.lastChild);
  }
  
  state.categories.forEach(cat => {
    const activeTasksCount = state.tasks.filter(t => t.category === cat.name && !t.completed).length;
    const isSystemCat = ['행정업무', '수업준비', '학생상담'].includes(cat.name);
    
    const chip = document.createElement('button');
    chip.className = `category-chip ${activeCat === cat.name ? 'active' : ''}`;
    chip.setAttribute('data-category', cat.name);
    
    const dot = document.createElement('span');
    dot.className = 'dot';
    dot.style.backgroundColor = `var(--${cat.color}, ${CATEGORY_COLORS[cat.color]})`;
    
    const nameSpan = document.createElement('span');
    nameSpan.className = 'category-name';
    nameSpan.innerText = cat.name;
    
    const countSpan = document.createElement('span');
    countSpan.className = 'count';
    countSpan.innerText = activeTasksCount;
    
    chip.appendChild(dot);
    chip.appendChild(nameSpan);
    chip.appendChild(countSpan);
    
    // Add delete button for user-custom categories
    if (!isSystemCat) {
      const delBtn = document.createElement('button');
      delBtn.className = 'delete-cat-btn';
      delBtn.innerHTML = '×';
      delBtn.title = '분류 삭제';
      delBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        deleteCategory(cat.name);
      });
      chip.appendChild(delBtn);
    }
    
    chip.addEventListener('click', () => {
      selectCategoryFilter(cat.name);
    });
    
    filterList.appendChild(chip);
  });
}

// Render Timetable Widget & Populates placeholders
function renderTimetable() {
  const timetableSlots = document.getElementById('timetable-slots');
  timetableSlots.innerHTML = '';
  
  state.timetable.forEach(slot => {
    const periodDiv = document.createElement('div');
    periodDiv.className = 'timetable-period';
    periodDiv.setAttribute('data-period', slot.period);
    
    const numSpan = document.createElement('span');
    numSpan.className = 'period-num';
    numSpan.innerText = slot.period;
    
    const detailsDiv = document.createElement('div');
    detailsDiv.className = 'period-details';
    
    const subjSpan = document.createElement('span');
    subjSpan.className = 'period-subject';
    subjSpan.setAttribute('data-placeholder', `${slot.period}교시 수업 입력`);
    subjSpan.innerText = slot.subject || '';
    
    const memoSpan = document.createElement('span');
    memoSpan.className = 'period-memo';
    memoSpan.setAttribute('data-placeholder', '준비물/과제 메모');
    memoSpan.innerText = slot.memo || '';
    
    detailsDiv.appendChild(subjSpan);
    detailsDiv.appendChild(memoSpan);
    
    periodDiv.appendChild(numSpan);
    periodDiv.appendChild(detailsDiv);
    
    timetableSlots.appendChild(periodDiv);
  });
}

// Render Header Stats Bar
function renderStats() {
  const totalTasksCount = state.tasks.length;
  const activeTasks = state.tasks.filter(t => !t.completed);
  const completedTasks = state.tasks.filter(t => t.completed);
  
  // Calculate completion percentage
  const percent = totalTasksCount > 0 ? Math.round((completedTasks.length / totalTasksCount) * 100) : 0;
  
  document.getElementById('overall-progress-bar').style.width = `${percent}%`;
  document.getElementById('overall-progress-text').innerText = `${percent}%`;
  
  document.getElementById('stat-completed-count').innerHTML = `${completedTasks.length}<span class="unit">건</span>`;
  document.getElementById('stat-pending-count').innerHTML = `${activeTasks.length}<span class="unit">건</span>`;
  
  // Urgent counts (D-Day or D-3)
  const urgentCount = activeTasks.filter(t => {
    if (!t.dueDate) return false;
    const diff = getDDayValue(t.dueDate);
    return diff <= 3; // include past-due and within 3 days
  }).length;
  
  document.getElementById('stat-urgent-count').innerHTML = `${urgentCount}<span class="unit">건</span>`;
  
  // Render tabs badges
  document.getElementById('active-tasks-count').innerText = activeTasks.length;
  document.getElementById('completed-tasks-count').innerText = completedTasks.length;
}

// Render Tasks Cards dynamically
function renderTasks() {
  const container = document.getElementById('tasks-list');
  container.innerHTML = '';
  
  // 1. Filter Tasks
  let filtered = state.tasks.filter(task => {
    // Tab Filter
    const tabMatch = state.activeTab === 'completed' ? task.completed : !task.completed;
    
    // Category Filter
    const catMatch = state.activeFilter === 'all' || task.category === state.activeFilter;
    
    // Search Query
    const searchMatch = state.searchQuery === '' || 
      task.title.toLowerCase().includes(state.searchQuery.toLowerCase()) || 
      task.category.toLowerCase().includes(state.searchQuery.toLowerCase());
      
    return tabMatch && catMatch && searchMatch;
  });
  
  // 2. Sort Tasks
  filtered.sort((a, b) => {
    switch (state.currentSort) {
      case 'date-asc':
        // Handle tasks without due date (push them to end)
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate) - new Date(b.dueDate);
      case 'priority-desc':
        const prioWeight = { high: 3, medium: 2, low: 1 };
        return prioWeight[b.priority] - prioWeight[a.priority];
      case 'alphabetical':
        return a.title.localeCompare(b.title, 'ko');
      case 'created-desc':
      default:
        return b.createdAt - a.createdAt;
    }
  });
  
  // Render Badge description
  const activeCatObj = state.categories.find(c => c.name === state.activeFilter);
  const badgeText = state.activeFilter === 'all' ? '전체보기' : activeCatObj ? activeCatObj.name : state.activeFilter;
  document.getElementById('current-filter-badge').innerText = badgeText;
  
  // Render Empty State if no results
  if (filtered.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'empty-state';
    empty.innerHTML = `
      <div class="empty-illustration">🗂️</div>
      <p class="empty-text">해당하는 조건의 할 일이 없습니다.<br>오늘의 새로운 업무를 계획하고 추가해 보세요!</p>
    `;
    container.appendChild(empty);
    return;
  }
  
  filtered.forEach(task => {
    const card = document.createElement('div');
    card.className = `task-card ${task.completed ? 'completed' : ''}`;
    card.setAttribute('data-id', task.id);
    
    // Left: Custom Checkbox
    const chkContainer = document.createElement('div');
    chkContainer.className = 'task-checkbox-container';
    
    const input = document.createElement('input');
    input.type = 'checkbox';
    input.checked = task.completed;
    input.addEventListener('change', () => {
      toggleTaskCompletion(task.id);
    });
    
    const customSpan = document.createElement('span');
    customSpan.className = 'custom-checkbox';
    
    chkContainer.appendChild(input);
    chkContainer.appendChild(customSpan);
    
    // Middle: Task Content Body
    const body = document.createElement('div');
    body.className = 'task-body';
    
    const titleRow = document.createElement('div');
    titleRow.className = 'task-title-row';
    
    const title = document.createElement('span');
    title.className = 'task-title';
    title.innerText = task.title;
    title.title = task.title;
    
    const priorityText = { high: '높음 🔥', medium: '중간', low: '낮음' };
    const prioBadge = document.createElement('span');
    prioBadge.className = `priority-badge ${task.priority}`;
    prioBadge.innerText = priorityText[task.priority];
    
    titleRow.appendChild(prioBadge);
    titleRow.appendChild(title);
    
    const metaRow = document.createElement('div');
    metaRow.className = 'task-meta-row';
    
    // Category pill
    const catObj = state.categories.find(c => c.name === task.category);
    const catColor = catObj ? catObj.color : 'violet';
    const catPill = document.createElement('span');
    catPill.className = 'cat-pill';
    catPill.style.backgroundColor = `var(--${catColor}, ${CATEGORY_COLORS[catColor]})`;
    catPill.innerText = task.category;
    
    metaRow.appendChild(catPill);
    
    // Due Date & D-Day
    if (task.dueDate) {
      const dateMeta = document.createElement('span');
      dateMeta.className = 'task-meta-item';
      dateMeta.innerHTML = `<i data-feather="calendar"></i> ${task.dueDate}`;
      
      const dday = document.createElement('span');
      const dValue = getDDayValue(task.dueDate);
      
      if (dValue === 0) {
        dday.className = 'dday-badge urgent';
        dday.innerText = 'D-Day';
      } else if (dValue > 0 && dValue <= 3) {
        dday.className = 'dday-badge urgent';
        dday.innerText = `D-${dValue}`;
      } else if (dValue > 3) {
        dday.className = 'dday-badge safe';
        dday.innerText = `D-${dValue}`;
      } else {
        dday.className = 'dday-badge overdue';
        dday.innerText = `기한 지남 (D+${Math.abs(dValue)})`;
      }
      
      metaRow.appendChild(dateMeta);
      metaRow.appendChild(dday);
    }
    
    body.appendChild(titleRow);
    body.appendChild(metaRow);
    
    // Right: Actions (Edit & Delete)
    const actions = document.createElement('div');
    actions.className = 'task-actions';
    
    const editBtn = document.createElement('button');
    editBtn.className = 'action-btn edit-task';
    editBtn.title = '할 일 수정';
    editBtn.innerHTML = '<i data-feather="edit-2"></i>';
    editBtn.addEventListener('click', () => {
      startEditTask(task);
    });
    
    const delBtn = document.createElement('button');
    delBtn.className = 'action-btn delete-task';
    delBtn.title = '할 일 삭제';
    delBtn.innerHTML = '<i data-feather="trash-2"></i>';
    delBtn.addEventListener('click', () => {
      deleteTask(task.id);
    });
    
    actions.appendChild(editBtn);
    actions.appendChild(delBtn);
    
    card.appendChild(chkContainer);
    card.appendChild(body);
    card.appendChild(actions);
    
    container.appendChild(card);
  });
  
  feather.replace();
}

// Render Student Counsel Quick Notes
function renderStudentNotes() {
  const container = document.getElementById('student-notes-container');
  container.innerHTML = '';
  
  // Search query filter for student notes as well
  let filteredNotes = state.studentNotes.filter(note => {
    return state.searchQuery === '' ||
      note.name.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(state.searchQuery.toLowerCase());
  });
  
  if (filteredNotes.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'empty-note-state';
    empty.innerHTML = `
      <div class="empty-illustration">🗒️</div>
      <p class="empty-text">검색 결과 또는 저장된 상담 기록이 없습니다.<br>새로운 상담 일지를 추가해 보세요.</p>
    `;
    container.appendChild(empty);
    return;
  }
  
  filteredNotes.forEach(note => {
    const card = document.createElement('div');
    card.className = 'student-note-card';
    
    const header = document.createElement('div');
    header.className = 'note-card-header';
    
    const badge = document.createElement('div');
    badge.className = 'student-info-badge';
    
    const avatar = document.createElement('span');
    avatar.className = 'student-avatar';
    avatar.innerText = note.name.charAt(0);
    
    const name = document.createElement('span');
    name.className = 'student-name';
    name.innerText = `${note.name} 학생`;
    
    badge.appendChild(avatar);
    badge.appendChild(name);
    
    const actions = document.createElement('div');
    actions.className = 'note-actions';
    
    const editBtn = document.createElement('button');
    editBtn.className = 'action-btn edit-note';
    editBtn.title = '메모 수정';
    editBtn.innerHTML = '<i data-feather="edit-2"></i>';
    editBtn.addEventListener('click', () => {
      startEditStudentNote(note);
    });
    
    const delBtn = document.createElement('button');
    delBtn.className = 'action-btn delete-note';
    delBtn.title = '메모 삭제';
    delBtn.innerHTML = '<i data-feather="trash-2"></i>';
    delBtn.addEventListener('click', () => {
      deleteStudentNote(note.id);
    });
    
    actions.appendChild(editBtn);
    actions.appendChild(delBtn);
    
    header.appendChild(badge);
    header.appendChild(actions);
    
    const content = document.createElement('p');
    content.className = 'note-content';
    content.innerText = note.content;
    
    const date = document.createElement('span');
    date.className = 'note-date';
    date.innerText = note.date;
    
    card.appendChild(header);
    card.appendChild(content);
    card.appendChild(date);
    
    container.appendChild(card);
  });
  
  feather.replace();
}

// 8. Event Listeners Setup
function setupEventListeners() {
  // New Task submission
  const newTaskForm = document.getElementById('new-task-form');
  newTaskForm.addEventListener('submit', (e) => {
    e.preventDefault();
    addNewTask();
  });
  
  // Sort selector
  document.getElementById('task-sort-select').addEventListener('change', (e) => {
    state.currentSort = e.target.value;
    renderTasks();
  });
  
  // Tabs switching
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      state.activeTab = e.target.getAttribute('data-tab');
      renderTasks();
    });
  });
  
  // Quick Search Box
  document.getElementById('task-search').addEventListener('input', (e) => {
    state.searchQuery = e.target.value;
    renderTasks();
    renderStudentNotes();
  });
  
  // Template Tags clicks
  document.querySelectorAll('.template-tag').forEach(tag => {
    tag.addEventListener('click', (e) => {
      e.preventDefault();
      const title = e.target.getAttribute('data-title');
      const category = e.target.getAttribute('data-category');
      const priority = e.target.getAttribute('data-priority');
      
      // Auto fill form
      document.getElementById('task-title-input').value = title;
      document.getElementById('task-category-select').value = category;
      document.getElementById('task-priority-select').value = priority;
      document.getElementById('task-date-input').value = getRelativeDate(3); // Default D+3
      
      // Scroll to form smoothly
      document.querySelector('.task-creator-section').scrollIntoView({ behavior: 'smooth' });
    });
  });
  
  // Student Note Expand Form
  const addStudentNoteBtn = document.getElementById('add-student-note-btn');
  const studentFormContainer = document.getElementById('student-note-form-container');
  const cancelNoteBtn = document.getElementById('cancel-note-btn');
  
  addStudentNoteBtn.addEventListener('click', () => {
    // Reset form values & show
    resetStudentNoteForm();
    studentFormContainer.classList.remove('hidden');
    document.getElementById('student-name-input').focus();
  });
  
  cancelNoteBtn.addEventListener('click', () => {
    studentFormContainer.classList.add('hidden');
    resetStudentNoteForm();
  });
  
  const studentForm = document.getElementById('student-note-form');
  studentForm.addEventListener('submit', (e) => {
    e.preventDefault();
    saveStudentNote();
  });
  
  // Create Custom Category Modals
  const addCategoryBtn = document.getElementById('add-category-btn');
  const categoryModal = document.getElementById('category-modal');
  const closeCategoryModal = document.getElementById('close-category-modal');
  const saveCategoryBtn = document.getElementById('save-category-btn');
  
  addCategoryBtn.addEventListener('click', () => {
    categoryModal.classList.remove('hidden');
    document.getElementById('new-category-name').value = '';
    document.getElementById('new-category-name').focus();
  });
  
  closeCategoryModal.addEventListener('click', () => {
    categoryModal.classList.add('hidden');
  });
  
  // Swatches active state
  document.querySelectorAll('.color-swatch').forEach(swatch => {
    swatch.addEventListener('click', (e) => {
      document.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('active'));
      e.target.classList.add('active');
    });
  });
  
  saveCategoryBtn.addEventListener('click', () => {
    addNewCategory();
  });
  
  // Timetable Edit Modals
  const editTimetableBtn = document.getElementById('edit-timetable-btn');
  const timetableModal = document.getElementById('timetable-modal');
  const closeTimetableModal = document.getElementById('close-timetable-modal');
  const saveTimetableBtn = document.getElementById('save-timetable-btn');
  
  editTimetableBtn.addEventListener('click', () => {
    openTimetableModal();
  });
  
  closeTimetableModal.addEventListener('click', () => {
    timetableModal.classList.add('hidden');
  });
  
  saveTimetableBtn.addEventListener('click', () => {
    saveTimetableData();
  });

  // Backup & Restore
  document.getElementById('export-btn').addEventListener('click', exportData);
  document.getElementById('import-btn').addEventListener('click', () => {
    document.getElementById('import-file').click();
  });
  document.getElementById('import-file').addEventListener('change', importData);
}

// 9. CRUD Operations & State Logic

// Calculate D-Day difference value
function getDDayValue(dateStr) {
  const today = new Date();
  today.setHours(0,0,0,0);
  const target = new Date(dateStr);
  target.setHours(0,0,0,0);
  
  const diffTime = target - today;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

// Handle dynamic dropdown categories
function updateCategoryDropdown() {
  const select = document.getElementById('task-category-select');
  const currentValue = select.value;
  select.innerHTML = '';
  
  state.categories.forEach(cat => {
    const opt = document.createElement('option');
    opt.value = cat.name;
    opt.innerText = cat.name;
    select.appendChild(opt);
  });
  
  // Keep previous select if still exists
  if (state.categories.some(c => c.name === currentValue)) {
    select.value = currentValue;
  }
}

// Create Task
let editingTaskId = null; // tracking edit task status

function addNewTask() {
  const title = document.getElementById('task-title-input').value.trim();
  const category = document.getElementById('task-category-select').value;
  const priority = document.getElementById('task-priority-select').value;
  let dueDate = document.getElementById('task-date-input').value;
  
  if (!title) return;
  if (!dueDate) dueDate = null; // Optional
  
  if (editingTaskId) {
    // Editing Mode
    state.tasks = state.tasks.map(t => {
      if (t.id === editingTaskId) {
        return { ...t, title, category, priority, dueDate };
      }
      return t;
    });
    
    // Reset form states
    editingTaskId = null;
    document.querySelector('.submit-task-btn span').innerText = '업무 추가';
    document.querySelector('.panel-title').innerHTML = '<i data-feather="plus-circle" class="panel-icon"></i> 할 일 계획하기';
  } else {
    // Creation Mode
    const newTask = {
      id: 'task-' + Date.now(),
      title,
      category,
      priority,
      dueDate,
      completed: false,
      createdAt: Date.now()
    };
    
    state.tasks.unshift(newTask);
  }
  
  // Clean inputs
  document.getElementById('task-title-input').value = '';
  document.getElementById('task-date-input').value = '';
  
  renderAll();
}

function toggleTaskCompletion(id) {
  state.tasks = state.tasks.map(t => {
    if (t.id === id) {
      const nextState = !t.completed;
      if (nextState) {
        // Celebrating complete tasks!
        setTimeout(triggerConfetti, 100);
      }
      return { ...t, completed: nextState };
    }
    return t;
  });
  
  renderAll();
}

function startEditTask(task) {
  editingTaskId = task.id;
  
  document.getElementById('task-title-input').value = task.title;
  document.getElementById('task-category-select').value = task.category;
  document.getElementById('task-priority-select').value = task.priority;
  document.getElementById('task-date-input').value = task.dueDate || '';
  
  document.querySelector('.submit-task-btn span').innerText = '저장하기';
  document.querySelector('.panel-title').innerHTML = '<i data-feather="edit-2" class="panel-icon"></i> 할 일 수정하기';
  feather.replace();
  
  document.querySelector('.task-creator-section').scrollIntoView({ behavior: 'smooth' });
  document.getElementById('task-title-input').focus();
}

function deleteTask(id) {
  if (confirm('이 할 일을 리스트에서 정말 삭제하시겠습니까?')) {
    state.tasks = state.tasks.filter(t => t.id !== id);
    renderAll();
  }
}

// Category Actions
function selectCategoryFilter(catName) {
  state.activeFilter = catName;
  renderCategories();
  renderTasks();
}

function addNewCategory() {
  const name = document.getElementById('new-category-name').value.trim();
  const activeSwatch = document.querySelector('.color-swatch.active');
  const color = activeSwatch ? activeSwatch.getAttribute('data-color') : 'blue';
  
  if (!name) return;
  
  // Check duplication
  if (state.categories.some(c => c.name.toLowerCase() === name.toLowerCase()) || name === '전체보기') {
    alert('이미 존재하는 분류 이름입니다.');
    return;
  }
  
  state.categories.push({ name, color });
  document.getElementById('category-modal').classList.add('hidden');
  
  renderAll();
}

function deleteCategory(catName) {
  if (confirm(`'${catName}' 분류를 정말 삭제하시겠습니까?\n해당 분류로 지정된 할 일은 '수업준비' 분류로 자동 병합됩니다.`)) {
    // Backup tasks belonging to this category to '수업준비' or first existing
    const backupCat = state.categories.find(c => c.name !== catName)?.name || '수업준비';
    
    state.tasks = state.tasks.map(t => {
      if (t.category === catName) {
        return { ...t, category: backupCat };
      }
      return t;
    });
    
    state.categories = state.categories.filter(c => c.name !== catName);
    
    if (state.activeFilter === catName) {
      state.activeFilter = 'all';
    }
    
    renderAll();
  }
}

// Timetable Operations
function openTimetableModal() {
  const grid = document.getElementById('timetable-edit-form-slots');
  grid.innerHTML = '';
  
  state.timetable.forEach(slot => {
    const row = document.createElement('div');
    row.className = 'timetable-edit-row';
    row.setAttribute('data-period', slot.period);
    
    const num = document.createElement('span');
    num.className = 'row-num';
    num.innerText = `${slot.period}교시`;
    
    const subjInput = document.createElement('input');
    subjInput.type = 'text';
    subjInput.className = 'edit-subj';
    subjInput.placeholder = '과목명 입력';
    subjInput.value = slot.subject || '';
    
    const memoInput = document.createElement('input');
    memoInput.type = 'text';
    memoInput.className = 'edit-memo';
    memoInput.placeholder = '준비물/과제 메모 입력';
    memoInput.value = slot.memo || '';
    
    row.appendChild(num);
    row.appendChild(subjInput);
    row.appendChild(memoInput);
    
    grid.appendChild(row);
  });
  
  document.getElementById('timetable-modal').classList.remove('hidden');
}

function saveTimetableData() {
  const newTimetable = [];
  const rows = document.querySelectorAll('.timetable-edit-row');
  
  rows.forEach(row => {
    const period = parseInt(row.getAttribute('data-period'));
    const subject = row.querySelector('.edit-subj').value.trim();
    const memo = row.querySelector('.edit-memo').value.trim();
    
    newTimetable.push({ period, subject, memo });
  });
  
  state.timetable = newTimetable;
  document.getElementById('timetable-modal').classList.add('hidden');
  renderAll();
}

// Student Notes CRUD
let editingStudentNoteId = null;

function resetStudentNoteForm() {
  document.getElementById('student-name-input').value = '';
  document.getElementById('student-memo-input').value = '';
  editingStudentNoteId = null;
  
  const submitBtn = document.querySelector('#student-note-form button[type="submit"]');
  submitBtn.innerText = '저장';
}

function saveStudentNote() {
  const name = document.getElementById('student-name-input').value.trim();
  const content = document.getElementById('student-memo-input').value.trim();
  
  if (!name || !content) return;
  
  // Format current date
  const now = new Date();
  const dateStr = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')} ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
  
  if (editingStudentNoteId) {
    // Edit Mode
    state.studentNotes = state.studentNotes.map(n => {
      if (n.id === editingStudentNoteId) {
        return { ...n, name, content, date: dateStr };
      }
      return n;
    });
  } else {
    // Create Mode
    const newNote = {
      id: 'note-' + Date.now(),
      name,
      content,
      date: dateStr
    };
    state.studentNotes.unshift(newNote);
  }
  
  document.getElementById('student-note-form-container').classList.add('hidden');
  resetStudentNoteForm();
  renderAll();
}

function startEditStudentNote(note) {
  editingStudentNoteId = note.id;
  
  document.getElementById('student-name-input').value = note.name;
  document.getElementById('student-memo-input').value = note.content;
  
  const submitBtn = document.querySelector('#student-note-form button[type="submit"]');
  submitBtn.innerText = '수정 완료';
  
  document.getElementById('student-note-form-container').classList.remove('hidden');
  document.getElementById('student-name-input').focus();
}

function deleteStudentNote(id) {
  if (confirm('이 학생 상담 기록을 삭제하시겠습니까?')) {
    state.studentNotes = state.studentNotes.filter(n => n.id !== id);
    renderAll();
  }
}

// 10. Backup and Restore (JSON Handling)
function exportData() {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state, null, 2));
  const downloadAnchor = document.createElement('a');
  
  const now = new Date();
  const fileName = `edutodo_backup_${now.getFullYear()}${String(now.getMonth()+1).padStart(2,'0')}${String(now.getDate()).padStart(2,'0')}.json`;
  
  downloadAnchor.setAttribute("href", dataStr);
  downloadAnchor.setAttribute("download", fileName);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

function importData(e) {
  const fileReader = new FileReader();
  const files = e.target.files;
  
  if (files.length === 0) return;
  
  fileReader.onload = function(event) {
    try {
      const importedState = JSON.parse(event.target.result);
      
      // Simple validation of JSON structure
      if (importedState.tasks && importedState.categories && importedState.timetable && importedState.studentNotes) {
        state = {
          ...state,
          categories: importedState.categories,
          timetable: importedState.timetable,
          tasks: importedState.tasks,
          studentNotes: importedState.studentNotes
        };
        
        renderAll();
        alert('백업 데이터가 성공적으로 복원되었습니다!');
      } else {
        alert('유효하지 않은 백업 파일 형식입니다. 올바른 에듀투두 백업 파일(.json)을 업로드해 주세요.');
      }
    } catch (err) {
      alert('백업 데이터를 불러오는 중 오류가 발생했습니다: ' + err.message);
    }
  };
  
  fileReader.readAsText(files[0]);
  // Reset file selector so same file can be selected again
  e.target.value = '';
}
