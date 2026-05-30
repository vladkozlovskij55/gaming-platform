const API = "https://gaming-platform-tydb.onrender.com";
const ADMIN_CREDENTIALS = {
    login: "admin",
    password: "admin",
    email: "admin@gmail.com"
};
const FALLBACK_COURSES = [
    {
        id: 1,
        title: "CS2 Aim Training",
        description: "Прокачайте точність, реакцію та контроль віддачі у CS2.",
        image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=900&q=80"
    },
    {
        id: 2,
        title: "Dota 2 Basics",
        description: "Вивчіть ролі, фарм, предмети та командну взаємодію.",
        image: "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=900&q=80"
    },
    {
        id: 3,
        title: "Valorant Tactics",
        description: "Опануйте позиціонування, здібності агентів і контроль карти.",
        image: "https://images.unsplash.com/photo-1542751110-97427bbecf20?auto=format&fit=crop&w=900&q=80"
    },
    {
        id: 4,
        title: "League of Legends Basics",
        description: "Основи ролей, ліній, фарму, макро-гри та командної взаємодії.",
        image: "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=900&q=80"
    }
];
let loadedCourses = [];

function getStoredUsers() {
    return JSON.parse(localStorage.getItem("users")) || [];
}

function saveStoredUsers(users) {
    localStorage.setItem("users", JSON.stringify(users));
}

function normalizeUser(user, profile = {}) {
    if (!user) return null;

    const login = user.login || profile.login || "player";

    return {
        ...user,
        ...profile,
        login,
        role: profile.role || user.role || (login.toLowerCase() === "admin" ? "admin" : "user"),
        name: profile.name || user.name || login,
        email: profile.email || user.email || `${login}@gamestudy.local`,
        avatar: profile.avatar || user.avatar || "",
        completedLessons: user.completedLessons || profile.completedLessons || [],
        completedTests: user.completedTests || profile.completedTests || [],
        myCourses: user.myCourses || profile.myCourses || [],
        cs2_score: user.cs2_score || 0,
        dota2_score: user.dota2_score || 0,
        valorant_score: user.valorant_score || 0,
        lol_score: user.lol_score || 0,
        favoriteGame: user.favoriteGame || profile.favoriteGame || "cs2"
    };
}

function saveCurrentUser(user, profile = {}) {
    const normalizedUser = normalizeUser(user, profile);
    const users = getStoredUsers();
    const index = users.findIndex(item => item.login === normalizedUser.login);

    if (index !== -1) {
        users[index] = { ...users[index], ...normalizedUser };
    } else {
        users.push(normalizedUser);
    }

    saveStoredUsers(users);
    localStorage.setItem("currentUser", JSON.stringify(normalizedUser));
    return normalizedUser;
}

function saveLocalUserState(user) {
    const normalizedUser = normalizeUser(user);
    const users = getStoredUsers();
    const index = users.findIndex(item => item.login === normalizedUser.login);

    if (index !== -1) {
        users[index] = { ...users[index], ...normalizedUser };
    } else {
        users.push(normalizedUser);
    }

    saveStoredUsers(users);
    localStorage.setItem("currentUser", JSON.stringify(normalizedUser));
    return normalizedUser;
}

function saveAdminUser() {
    localStorage.setItem("token", "local-admin-token");
    return saveCurrentUser(
        {
            login: ADMIN_CREDENTIALS.login,
            role: "admin"
        },
        {
            name: "Admin",
            email: ADMIN_CREDENTIALS.email,
            login: ADMIN_CREDENTIALS.login,
            role: "admin"
        }
    );
}

function registerLocalUser(login, password) {
    const users = getStoredUsers();
    const exists = users.some(user => user.login === login);

    if (exists) {
        alert("Такий користувач вже існує");
        return false;
    }

    localStorage.setItem("token", "local-user-token");
    saveCurrentUser(
        {
            login,
            password,
            role: "user"
        },
        {
            login,
            role: "user"
        }
    );

    return true;
}

function loginLocalUser(login, password) {
    const localUser = getStoredUsers().find(user => user.login === login && user.password === password);

    if (!localUser) {
        return false;
    }

    localStorage.setItem("token", "local-user-token");
    saveCurrentUser(localUser, {
        login: localUser.login,
        role: localUser.role || "user"
    });

    return true;
}

function logout() {
    localStorage.removeItem("currentUser");
    localStorage.removeItem("token");
    window.location.href = "index.html";
}

function getCurrentUser() {
    return normalizeUser(JSON.parse(localStorage.getItem("currentUser")));
}

function openLoginModal() {
    document.getElementById("loginModal")?.classList.remove("hidden");
}

function closeLoginModal() {
    document.getElementById("loginModal")?.classList.add("hidden");
}

function openRegisterModal() {
    document.getElementById("registerModal")?.classList.remove("hidden");
}

function closeRegisterModal() {
    document.getElementById("registerModal")?.classList.add("hidden");
}

function toggleBurgerMenu() {
    const header = document.querySelector("header");
    const button = document.querySelector(".burger-menu");

    if (!header || !button) return;

    const isOpen = header.classList.toggle("menu-open");
    button.setAttribute("aria-expanded", String(isOpen));
}

function closeBurgerMenu() {
    const header = document.querySelector("header");
    const button = document.querySelector(".burger-menu");

    header?.classList.remove("menu-open");
    button?.setAttribute("aria-expanded", "false");
}

function getAvatarLabel(user) {
    return (user?.name || user?.login || "GS").trim().slice(0, 2).toUpperCase();
}

function isUsableAvatar(avatar) {
    if (!avatar) return false;

    const value = String(avatar).trim();
    return /^https?:\/\//i.test(value) || /^data:image\/[a-z0-9.+-]+;base64,.{80,}/i.test(value);
}

function escapeHtml(value) {
    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function toggleAccountMenu() {
    const menu = document.querySelector(".account-menu");
    const button = document.querySelector(".profile-nav-button");

    if (!menu || !button) return;

    const isOpen = menu.classList.toggle("open");
    button.setAttribute("aria-expanded", String(isOpen));
}

function closeAccountMenu() {
    document.querySelector(".account-menu")?.classList.remove("open");
    document.querySelector(".profile-nav-button")?.setAttribute("aria-expanded", "false");
}

function updateAdminNavVisibility() {
    document.querySelectorAll(".admin-nav-button").forEach(button => {
        button.classList.add("hidden");
    });
}

function updateAuthNavigation() {
    const currentUser = getCurrentUser();
    const nav = document.querySelector("header .nav-buttons");

    updateAdminNavVisibility();

    if (!nav) return;

    nav.querySelectorAll("button.logout").forEach(button => {
        if (!button.closest(".account-menu")) {
            button.remove();
        }
    });

    const buttons = [...nav.querySelectorAll("button")];
    let profileButton = buttons.find(button => (button.getAttribute("onclick") || "").includes("profile.html"));
    const ratingButton = buttons.find(button => (button.getAttribute("onclick") || "").includes("rating.html"));
    const loginButton = buttons.find(button => {
        const action = button.getAttribute("onclick") || "";
        return action.includes("login.html") || action.includes("openLoginModal");
    });
    const registerButton = buttons.find(button => {
        const action = button.getAttribute("onclick") || "";
        return action.includes("register.html") || action.includes("openRegisterModal");
    });

    document.querySelector(".account-menu")?.remove();

    if (profileButton && ratingButton && ratingButton.nextElementSibling !== profileButton) {
        nav.insertBefore(profileButton, ratingButton.nextElementSibling);
    }

    if (!currentUser) {
        if (profileButton) {
            profileButton.classList.remove("profile-nav-button");
            profileButton.innerHTML = "Профіль";
            profileButton.setAttribute("onclick", "window.location.href='profile.html'");
        }
        loginButton?.classList.remove("hidden");
        registerButton?.classList.remove("hidden");
        return;
    }

    loginButton?.classList.add("hidden");
    registerButton?.classList.add("hidden");

    if (!profileButton) {
        profileButton = document.createElement("button");
        profileButton.setAttribute("onclick", "window.location.href='profile.html'");
        profileButton.textContent = "Профіль";

        if (ratingButton) {
            nav.insertBefore(profileButton, ratingButton.nextElementSibling);
        } else {
            nav.appendChild(profileButton);
        }
    }

    const avatarFallback = `<span>${escapeHtml(getAvatarLabel(currentUser))}</span>`;
    const avatarContent = isUsableAvatar(currentUser.avatar)
        ? `<img src="${escapeHtml(currentUser.avatar)}" alt="${escapeHtml(currentUser.login)}" onerror="this.parentElement.innerHTML='${avatarFallback.replaceAll("'", "\\'")}'">`
        : `<span>${escapeHtml(getAvatarLabel(currentUser))}</span>`;

    profileButton.classList.add("profile-nav-button");
    profileButton.setAttribute("type", "button");
    profileButton.setAttribute("aria-label", "Меню профілю");
    profileButton.setAttribute("aria-expanded", "false");
    profileButton.setAttribute("onclick", "toggleAccountMenu()");
    profileButton.innerHTML = avatarContent;

    nav.insertAdjacentHTML("beforeend", `
        <div class="account-menu">
            <button onclick="window.location.href='profile.html'">Профіль</button>
            ${currentUser.role === "admin" ? "<button onclick=\"window.location.href='admin.html'\">Адмін</button>" : ""}
            <button class="logout" onclick="logout()">Вийти</button>
        </div>
    `);
}

async function registerUser() {
    const login = document.getElementById("registerLogin")?.value.trim() || "";
    const password = document.getElementById("registerPassword")?.value || "";

    if (!login || !password) {
        alert("Введіть логін і пароль");
        return;
    }

    if (login.length < 3 || password.length < 3) {
        alert("Логін і пароль мають містити щонайменше 3 символи");
        return;
    }

    if (login.toLowerCase() === ADMIN_CREDENTIALS.login) {
        if (password !== ADMIN_CREDENTIALS.password) {
            alert("Для admin використовуйте пароль admin");
            return;
        }

        saveAdminUser();
        window.location.href = "profile.html";
        return;
    }

    if (getStoredUsers().some(user => user.login === login)) {
        alert("Такий користувач вже існує. Увійдіть у свій акаунт.");
        return;
    }

    try {
        const registerResponse = await fetch(`${API}/auth/register`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ login, password })
        });

        if (!registerResponse.ok) {
            throw new Error("register-failed");
        }

        const registeredUser = await registerResponse.json();
        const loginResponse = await fetch(`${API}/auth/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ login, password })
        });

        if (!loginResponse.ok) {
            throw new Error("login-after-register-failed");
        }

        const loginData = await loginResponse.json();
        localStorage.setItem("token", loginData.token);
        saveCurrentUser(loginData.user || registeredUser, {
            login,
            role: login.toLowerCase() === "admin" ? "admin" : "user"
        });
        window.location.href = "profile.html";
    } catch (error) {
        if (registerLocalUser(login, password)) {
            alert("API тимчасово недоступний, акаунт створено локально.");
            window.location.href = "profile.html";
        }
    }
}

async function loginUser() {
    const login = document.getElementById("loginInput")?.value.trim() || "";
    const password = document.getElementById("passwordInput")?.value || "";

    if (!login || !password) {
        alert("Введіть логін і пароль");
        return;
    }

    if (login.toLowerCase() === ADMIN_CREDENTIALS.login && password === ADMIN_CREDENTIALS.password) {
        saveAdminUser();
        window.location.href = "profile.html";
        return;
    }

    try {
        const response = await fetch(`${API}/auth/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ login, password })
        });

        if (!response.ok) {
            throw new Error("login-failed");
        }

        const data = await response.json();
        const localProfile = getStoredUsers().find(user => user.login === data.user.login) || {};

        localStorage.setItem("token", data.token);
        saveCurrentUser(data.user, localProfile);
        window.location.href = "profile.html";
    } catch (error) {
        if (loginLocalUser(login, password)) {
            window.location.href = "profile.html";
            return;
        }

        alert("Помилка входу. Перевірте логін і пароль.");
    }
}

function getCourseTitle(course) {
    return course.title || course.name || "Course";
}

function renderCourses(courses) {
    const container = document.getElementById("courseContainer");
    if (!container) return;

    if (!courses || courses.length === 0) {
        const query = document.getElementById("searchInput")?.value.trim();
        container.innerHTML = `<p class='muted-text'>${query ? "Курсів за вашим запитом не знайдено" : "Курси поки недоступні"}</p>`;
        return;
    }

    container.innerHTML = courses.map(course => {
        const title = getCourseTitle(course);
        const image = course.image ? `<img src="${course.image}" alt="${title}">` : "";

        return `
            <div class="card">
                ${image}
                <h3>${title}</h3>
                <p>${course.description || ""}</p>
                <button onclick="enrollCourse(${course.id})">Записатися</button>
            </div>
        `;
    }).join("");
}

function normalizeLocalCourse(course, index = 0) {
    return {
        ...course,
        id: course.id || `local-${index + 1}-${Date.now()}`,
        title: course.title || course.name || "Course",
        description: course.description || "",
        image: course.image || ""
    };
}

async function loadCourses() {
    const container = document.getElementById("courseContainer");
    if (!container) return;

    const localCourses = (JSON.parse(localStorage.getItem("courses")) || []).map(normalizeLocalCourse);

    try {
        const response = await fetch(`${API}/courses`);

        if (!response.ok) {
            throw new Error("courses-failed");
        }

        const courses = await response.json();
        const apiCourses = Array.isArray(courses) ? courses : [];
        loadedCourses = [...localCourses, ...apiCourses];

        if (loadedCourses.length === 0) {
            loadedCourses = FALLBACK_COURSES;
        }

        const hasLeagueCourse = loadedCourses.some(course => getCourseTitle(course).toLowerCase().includes("league of legends"));

        if (!hasLeagueCourse) {
            loadedCourses.push(FALLBACK_COURSES.find(course => course.title === "League of Legends Basics"));
        }

        renderCourses(loadedCourses);
    } catch (error) {
        loadedCourses = localCourses.length ? localCourses : FALLBACK_COURSES;
        const hasLeagueCourse = loadedCourses.some(course => getCourseTitle(course).toLowerCase().includes("league of legends"));

        if (!hasLeagueCourse) {
            loadedCourses.push(FALLBACK_COURSES.find(course => course.title === "League of Legends Basics"));
        }

        renderCourses(loadedCourses);
    }
}

function searchCourses() {
    const query = document.getElementById("searchInput")?.value.toLowerCase().trim() || "";
    const container = document.getElementById("courseContainer");

    if (!container) return;

    if (loadedCourses.length > 0) {
        const filteredCourses = loadedCourses.filter(course => {
            const searchableText = `${getCourseTitle(course)} ${course.description || ""}`.toLowerCase();
            return searchableText.includes(query);
        });

        renderCourses(filteredCourses);
        return;
    }

    document.querySelectorAll("#courseContainer .card").forEach(card => {
        card.style.display = card.innerText.toLowerCase().includes(query) ? "" : "none";
    });
}

async function enrollCourse(courseId) {
    const user = getCurrentUser();

    if (!user) {
        alert("Увійдіть в акаунт");
        return;
    }

    if (!courseId) {
        alert("Оберіть курс");
        return;
    }

    if (!user.id) {
        const course = loadedCourses.find(item => Number(item.id) === Number(courseId));
        const title = course ? getCourseTitle(course) : `Course #${courseId}`;
        const myCourses = Array.isArray(user.myCourses) ? user.myCourses : [];

        if (!myCourses.some(item => Number(item.id) === Number(courseId))) {
            myCourses.push({
                id: courseId,
                title,
                description: course?.description || ""
            });
        }

        user.myCourses = myCourses;
        user.completedLessons = Array.from(new Set([...(user.completedLessons || []), String(courseId)]));
        saveLocalUserState(user);
        alert("Ви записані на курс!");
        return;
    }

    try {
        const response = await fetch(`${API}/courses/enroll`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + localStorage.getItem("token")
            },
            body: JSON.stringify({
                user_id: user.id,
                course_id: courseId
            })
        });

        if (!response.ok) {
            throw new Error("enroll-failed");
        }

        alert("Ви записані на курс!");
    } catch (error) {
        alert("Не вдалося записатися на курс");
    }
}

function loadMyCourses() {
    const container = document.getElementById("myCoursesContainer");
    const user = getCurrentUser();

    if (!container || !user) return;

    if (!user.id && Array.isArray(user.myCourses) && user.myCourses.length > 0) {
        document.getElementById("profileCoursesCount") && (document.getElementById("profileCoursesCount").innerText = user.myCourses.length);
        container.innerHTML = user.myCourses.map(course => `
            <div class="card">
                <h3>${escapeHtml(getCourseTitle(course))}</h3>
                <p>${escapeHtml(course.description || "")}</p>
            </div>
        `).join("");
        return;
    }

    if (!user.id) {
        container.innerHTML = "<p>У вас поки немає курсів</p>";
        document.getElementById("profileCoursesCount") && (document.getElementById("profileCoursesCount").innerText = (user.myCourses || []).length);
        return;
    }

    fetch(`${API}/courses/my/${user.id}`)
        .then(response => response.ok ? response.json() : Promise.reject())
        .then(courses => {
            if (!courses || courses.length === 0) {
                container.innerHTML = "<p>У вас поки немає курсів</p>";
                document.getElementById("profileCoursesCount") && (document.getElementById("profileCoursesCount").innerText = "0");
                return;
            }

            document.getElementById("profileCoursesCount") && (document.getElementById("profileCoursesCount").innerText = courses.length);

            container.innerHTML = courses.map(course => `
                <div class="card">
                    <h3>${getCourseTitle(course)}</h3>
                    <p>${course.description || ""}</p>
                </div>
            `).join("");
        })
        .catch(() => {
            container.innerHTML = "<p>У вас поки немає курсів</p>";
            document.getElementById("profileCoursesCount") && (document.getElementById("profileCoursesCount").innerText = "0");
        });
}

function saveResult(game, score) {
    const user = getCurrentUser();
    if (!user) return;

    if (!user.id) {
        const results = JSON.parse(localStorage.getItem("results")) || [];
        results.push({
            login: user.login,
            game,
            score,
            date: new Date().toISOString()
        });
        localStorage.setItem("results", JSON.stringify(results));
        return;
    }

    fetch(`${API}/results`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        body: JSON.stringify({
            user_id: user.id,
            game,
            score
        })
    });
}

function loadResults() {
    const container = document.getElementById("resultsContainer");
    const user = getCurrentUser();

    if (!container || !user) return;

    if (!user.id) {
        const localResults = [
            { game: "CS2", score: user.cs2_score || 0 },
            { game: "Dota 2", score: user.dota2_score || 0 },
            { game: "Valorant", score: user.valorant_score || 0 },
            { game: "League of Legends", score: user.lol_score || 0 }
        ].filter(result => Number(result.score) > 0);

        container.innerHTML = localResults.length ? localResults.map(result => `
            <div class="card">
                <h3>${result.game}</h3>
                <p>Результат: ${result.score} балів</p>
            </div>
        `).join("") : "<p>Немає результатів</p>";
        document.getElementById("profileResultsCount") && (document.getElementById("profileResultsCount").innerText = localResults.length);
        return;
    }

    fetch(`${API}/results/${user.id}`)
        .then(response => response.ok ? response.json() : Promise.reject())
        .then(results => {
            if (!results || results.length === 0) {
                container.innerHTML = "<p>Немає результатів</p>";
                document.getElementById("profileResultsCount") && (document.getElementById("profileResultsCount").innerText = "0");
                return;
            }

            document.getElementById("profileResultsCount") && (document.getElementById("profileResultsCount").innerText = results.length);

            container.innerHTML = results.map(result => `
                <div class="card">
                    <h3>${result.game}</h3>
                    <p>Результат: ${result.score} балів</p>
                </div>
            `).join("");
        })
        .catch(() => {
            container.innerHTML = "<p>Немає результатів</p>";
            document.getElementById("profileResultsCount") && (document.getElementById("profileResultsCount").innerText = "0");
        });
}
function closeModal() {
    document.getElementById("courseModal")?.classList.add("hidden");
}

function hideLoader() {
    const loader = document.getElementById("loader");

    if (loader) {
        setTimeout(() => {
            loader.classList.add("hide");
        }, 700);
    }
}

function animateCounters() {
    document.querySelectorAll(".counter").forEach(counter => {
        const target = Number(counter.dataset.target);
        let count = 0;
        const speed = target / 50;

        const updateCount = () => {
            count += speed;

            if (count < target) {
                counter.innerText = Math.floor(count);
                requestAnimationFrame(updateCount);
            } else {
                counter.innerText = target === 100 ? `${target}%` : `${target}+`;
            }
        };

        updateCount();
    });
}

let deferredInstallPrompt = null;

function setupPwaInstall() {
    const installButton = document.getElementById("installAppBtn");

    if (!installButton) {
        return;
    }

    installButton.addEventListener("click", async function () {
        if (!deferredInstallPrompt) {
            alert("Якщо встановлення недоступне, відкрийте меню браузера та оберіть встановлення застосунку.");
            return;
        }

        deferredInstallPrompt.prompt();
        await deferredInstallPrompt.userChoice;
        deferredInstallPrompt = null;
        installButton.classList.add("hidden");
    });
}

if ("serviceWorker" in navigator) {
    window.addEventListener("load", function () {
        navigator.serviceWorker.register("./service-worker.js").catch(function () {});
    });
}

window.addEventListener("beforeinstallprompt", function (event) {
    event.preventDefault();
    deferredInstallPrompt = event;
    document.getElementById("installAppBtn")?.classList.remove("hidden");
});

window.addEventListener("appinstalled", function () {
    deferredInstallPrompt = null;
    document.getElementById("installAppBtn")?.classList.add("hidden");
});

window.openLoginModal = openLoginModal;
window.closeLoginModal = closeLoginModal;
window.openRegisterModal = openRegisterModal;
window.closeRegisterModal = closeRegisterModal;
window.registerUser = registerUser;
window.loginUser = loginUser;
window.searchCourses = searchCourses;
window.enrollCourse = enrollCourse;
window.closeModal = closeModal;
window.toggleBurgerMenu = toggleBurgerMenu;
window.toggleAccountMenu = toggleAccountMenu;
window.closeAccountMenu = closeAccountMenu;
window.updateAdminNavVisibility = updateAdminNavVisibility;
window.updateAuthNavigation = updateAuthNavigation;
window.logout = logout;

window.addEventListener("load", function () {
    hideLoader();
    updateAuthNavigation();
    loadCourses();
    loadMyCourses();
    loadResults();
    setupPwaInstall();

    document.querySelector("header .nav-buttons")?.addEventListener("click", function (event) {
        if (event.target.closest("button")) {
            closeBurgerMenu();
        }
    });

    if (document.querySelector(".counter")) {
        animateCounters();
    }
});

document.addEventListener("click", function (event) {
    if (!event.target.closest(".profile-nav-button") && !event.target.closest(".account-menu")) {
        closeAccountMenu();
    }
});

window.addEventListener("resize", function () {
    if (window.innerWidth >= 768) {
        closeBurgerMenu();
    }
});
