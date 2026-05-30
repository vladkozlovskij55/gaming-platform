const API = "https://gaming-platform-tydb.onrender.com";

function normalizeUser(user) {
    if (!user) return null;

    user.name = user.name || user.login || "Player";
    user.email = user.email || `${user.login || "player"}@gamestudy.local`;
    user.avatar = user.avatar || "";
    user.completedLessons = user.completedLessons || [];
    user.completedTests = user.completedTests || [];
    user.myCourses = user.myCourses || [];

    return user;
}

function getStoredUsers() {
    return JSON.parse(localStorage.getItem("users")) || [];
}

function saveStoredUsers(users) {
    localStorage.setItem("users", JSON.stringify(users));
}

function saveCurrentUser(user) {
    const normalizedUser = normalizeUser(user);
    let users = getStoredUsers();
    const index = users.findIndex(item => item.login === normalizedUser.login);

    if (index !== -1) {
        users[index] = normalizedUser;
    } else {
        users.push(normalizedUser);
    }

    saveStoredUsers(users);
    localStorage.setItem("currentUser", JSON.stringify(normalizedUser));
}

// ================= РЕГИСТРАЦИЯ =================
function registerUser() {
    const name = document.getElementById("registerName")?.value.trim() || "";
    const email = document.getElementById("registerEmail")?.value.trim() || "";
    const avatar = document.getElementById("registerAvatar")?.value.trim() || "";
    const login = document.getElementById("registerLogin").value.trim();
    const password = document.getElementById("registerPassword").value;

    if (!name || !email || !login || !password) {
        alert("Заполните имя, email, логин и пароль");
        return;
    }

    const users = getStoredUsers();
    const exists = users.find(user => user.login === login);

    if (exists) {
        alert("Такой пользователь уже существует");
        return;
    }

    const newUser = normalizeUser({
        name,
        email,
        avatar,
        login,
        password,
        role: login === "admin" ? "admin" : "user",
        cs2_score: 0,
        dota2_score: 0,
        valorant_score: 0
    });

    users.push(newUser);
    saveStoredUsers(users);
    localStorage.setItem("currentUser", JSON.stringify(newUser));

    alert("Регистрация успешна");
    window.location.href = "profile.html";
}

// ================= ВХОД =================
function loginUser() {
    const login = document.getElementById("loginInput").value.trim();
    const password = document.getElementById("passwordInput").value;
    const users = getStoredUsers();
    const storedUser = users.find(user => user.login === login && user.password === password);

    if (storedUser) {
        saveCurrentUser(storedUser);
        window.location.href = "profile.html";
        return;
    }

    fetch(`${API}/auth/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ login, password })
    })
    .then(res => {
        if (!res.ok) throw new Error();
        return res.json();
    })
    .then(data => {
        localStorage.setItem("token", data.token);
        saveCurrentUser(data.user);
        window.location.href = "profile.html";
    })
    .catch(() => alert("Помилка входу"));
}

// ================= КУРСЫ =================
function loadCourses() {
    fetch(`${API}/courses`)
    .then(res => res.json())
    .then(data => {
        let html = "";

        data.forEach(course => {
            html += `
                <div class="card">
                    <h3>${course.title}</h3>
                    <p>${course.description}</p>
                    <button onclick="enrollCourse(${course.id})">
                        Записатися
                    </button>
                </div>
            `;
        });

        document.getElementById("courseContainer").innerHTML = html;
    });
}

// ================= ЗАПИСЬ НА КУРС =================
function enrollCourse(courseId) {
    const user = JSON.parse(localStorage.getItem("currentUser"));

    if (!user) {
        alert("Увійдіть в акаунт");
        return;
    }

    fetch(`${API}/courses/enroll`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        body: JSON.stringify({
            user_id: user.id,
            course_id: courseId
        })
    })
    .then(res => res.json())
    .then(() => {
        alert("Ви записані на курс!");
    });
}

// ================= МОИ КУРСЫ =================
function loadMyCourses() {
    const user = normalizeUser(JSON.parse(localStorage.getItem("currentUser")));
    if (!user) return;

    const renderCourses = (data) => {
        let html = "";

        if (!data || data.length === 0) {
            html = "<p>У вас поки немає курсів</p>";
        } else {
            data.forEach(course => {
                const title = course.title || course.name || course;
                const description = course.description || "Збережений курс користувача";

                html += `
                    <div class="card">
                        <h3>${title}</h3>
                        <p>${description}</p>
                    </div>
                `;
            });
        }

        document.getElementById("myCoursesContainer").innerHTML = html;
    };

    if (!user.id) {
        renderCourses(user.myCourses);
        return;
    }

    fetch(`${API}/courses/my/${user.id}`)
    .then(res => res.json())
    .then(renderCourses)
    .catch(() => renderCourses(user.myCourses));
}

// ================= СОХРАНЕНИЕ РЕЗУЛЬТАТА =================
function saveResult(game, score) {
    const user = JSON.parse(localStorage.getItem("currentUser"));
    if (!user) return;

    fetch(`${API}/results`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        body: JSON.stringify({
            user_id: user.id,
            game: game,
            score: score
        })
    });
}

// ================= РЕЗУЛЬТАТЫ =================
function loadResults() {
    const user = normalizeUser(JSON.parse(localStorage.getItem("currentUser")));
    if (!user) return;

    const localResults = [
        { game: "CS2", score: user.cs2_score || 0 },
        { game: "Dota 2", score: user.dota2_score || 0 },
        { game: "Valorant", score: user.valorant_score || 0 }
    ].filter(result => result.score > 0 || user.completedTests.includes(result.game.toLowerCase().replace(" ", "")));

    const renderResults = (data) => {
        let html = "";

        if (!data || data.length === 0) {
            html = "<p>Немає результатів</p>";
        } else {
            data.forEach(r => {
                html += `
                    <div class="card">
                        <h3>${r.game}</h3>
                        <p>Результат: ${r.score} балів</p>
                    </div>
                `;
            });
        }

        document.getElementById("resultsContainer").innerHTML = html;
    };

    if (!user.id) {
        renderResults(localResults);
        return;
    }

    fetch(`${API}/results/${user.id}`)
    .then(res => res.json())
    .then(renderResults)
    .catch(() => renderResults(localResults));
}

// ================= АВТОЗАГРУЗКА =================
window.onload = function() {
    if (document.getElementById("courseContainer")) loadCourses();
    if (document.getElementById("myCoursesContainer")) loadMyCourses();
    if (document.getElementById("resultsContainer")) loadResults();
};
window.addEventListener("load", function () {
    const loader = document.getElementById("loader");

    if (loader) {
        setTimeout(() => {
            loader.classList.add("hide");
        }, 700);
    }
});
function animateCounters() {
    const counters = document.querySelectorAll(".counter");

    counters.forEach(counter => {
        const target = Number(counter.getAttribute("data-target"));
        let current = 0;
        const step = Math.ceil(target / 60);

        const timer = setInterval(() => {
            current += step;

            if (current >= target) {
                current = target;
                clearInterval(timer);
            }

            counter.innerText = target === 100 ? current + "%" : current + "+";
        }, 20);
    });
}

window.addEventListener("load", function () {
    if (document.querySelector(".counter")) {
        animateCounters();
    }
});
function animateCounters() {
    const counters = document.querySelectorAll(".counter");

    counters.forEach(counter => {
        const target = Number(counter.dataset.target);

        let count = 0;
        const speed = target / 50;

        const updateCount = () => {
            count += speed;

            if (count < target) {
                counter.innerText = Math.floor(count);
                requestAnimationFrame(updateCount);
            } else {
                if (target === 100) {
                    counter.innerText = target + "%";
                } else {
                    counter.innerText = target + "+";
                }
            }
        };

        updateCount();
    });
}

window.addEventListener("load", animateCounters);
