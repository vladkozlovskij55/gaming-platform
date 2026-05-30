const API = "https://gaming-platform-tydb.onrender.com";

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
        valorant_score: user.valorant_score || 0
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

function getCurrentUser() {
    return normalizeUser(JSON.parse(localStorage.getItem("currentUser")));
}

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
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

async function registerUser() {
    const name = document.getElementById("registerName")?.value.trim() || "";
    const email = document.getElementById("registerEmail")?.value.trim() || "";
    const avatar = document.getElementById("registerAvatar")?.value.trim() || "";
    const login = document.getElementById("registerLogin")?.value.trim() || "";
    const password = document.getElementById("registerPassword")?.value || "";

    if (!name || !email || !login || !password) {
        alert("Заповніть ім'я, email, логін і пароль");
        return;
    }

    if (!isValidEmail(email)) {
        alert("Введіть коректний email");
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
            name,
            email,
            avatar,
            login,
            role: login.toLowerCase() === "admin" ? "admin" : "user"
        });
        window.location.href = "profile.html";
    } catch (error) {
        alert("Не вдалося зареєструватися. Перевірте дані або спробуйте інший логін.");
    }
}

async function loginUser() {
    const login = document.getElementById("loginInput")?.value.trim() || "";
    const password = document.getElementById("passwordInput")?.value || "";

    if (!login || !password) {
        alert("Введіть логін і пароль");
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
        container.innerHTML = "<p class='muted-text'>Курси поки недоступні</p>";
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

async function loadCourses() {
    const container = document.getElementById("courseContainer");
    if (!container) return;

    try {
        const response = await fetch(`${API}/courses`);

        if (!response.ok) {
            throw new Error("courses-failed");
        }

        const courses = await response.json();
        renderCourses(courses);
    } catch (error) {
        container.innerHTML = "<p class='muted-text'>Не вдалося завантажити курси з API</p>";
    }
}

function searchCourses() {
    const query = document.getElementById("searchInput")?.value.toLowerCase().trim() || "";

    document.querySelectorAll("#courseContainer .card").forEach(card => {
        card.style.display = card.innerText.toLowerCase().includes(query) ? "" : "none";
    });
}

async function enrollCourse(courseId) {
    const user = getCurrentUser();

    if (!user || !user.id) {
        alert("Увійдіть в акаунт");
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
    if (!user || !user.id) return;

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
        container.innerHTML = "<p>Немає результатів</p>";
        document.getElementById("profileResultsCount") && (document.getElementById("profileResultsCount").innerText =
            [user.cs2_score, user.dota2_score, user.valorant_score].filter(score => Number(score) > 0).length);
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

window.addEventListener("load", function () {
    hideLoader();
    loadCourses();
    loadMyCourses();
    loadResults();

    document.querySelector("header .nav-buttons")?.addEventListener("click", function (event) {
        if (event.target.closest("button")) {
            closeBurgerMenu();
        }
    });

    if (document.querySelector(".counter")) {
        animateCounters();
    }
});

window.addEventListener("resize", function () {
    if (window.innerWidth >= 768) {
        closeBurgerMenu();
    }
});
