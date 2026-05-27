const API = "https://gaming-platform-tydb.onrender.com";

// ================= РЕГИСТРАЦИЯ =================
function registerUser() {
    const login = document.getElementById("registerLogin").value;
    const password = document.getElementById("registerPassword").value;

    fetch(`${API}/auth/register`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ login, password })
    })
    .then(res => res.json())
    .then(() => {
        alert("Реєстрація успішна");
    });
}

// ================= ВХОД =================
function loginUser() {
    const login = document.getElementById("loginInput").value;
    const password = document.getElementById("passwordInput").value;

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
        localStorage.setItem("currentUser", JSON.stringify(data.user));
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
    const user = JSON.parse(localStorage.getItem("currentUser"));
    if (!user) return;

    fetch(`${API}/courses/my/${user.id}`)
    .then(res => res.json())
    .then(data => {
        let html = "";

        if (data.length === 0) {
            html = "<p>У вас поки немає курсів</p>";
        } else {
            data.forEach(course => {
                html += `
                    <div class="card">
                        <h3>${course.title}</h3>
                        <p>${course.description}</p>
                    </div>
                `;
            });
        }

        document.getElementById("myCoursesContainer").innerHTML = html;
    });
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
    const user = JSON.parse(localStorage.getItem("currentUser"));
    if (!user) return;

    fetch(`${API}/results/${user.id}`)
    .then(res => res.json())
    .then(data => {
        let html = "";

        if (data.length === 0) {
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
    });
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