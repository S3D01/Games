// قائمة الفرق
let teams = [];
// قائمة النزال الحالي
let currentBattle = [];
// عدد الانتصارات القصوى للفوز بالمسابقة
let maxWins = 3;
// مجموعة تتبع الخاسرين السابقين
let pastLosers = new Set();

// استماع لزر إضافة الفريق
document.getElementById('add-team').addEventListener('click', addTeam);
// استماع لزر بدء اللعبة
document.getElementById('start-game').addEventListener('click', startGame);
// استماع لزر بدء النزال
document.getElementById('start-battle').addEventListener('click', startBattle);
// استماع لزر نهاية اللعبة
document.getElementById('end-game').addEventListener('click', endGame);
// استماع زر التالي بعد الشرح
document.getElementById('next-button').addEventListener('click', showSetup);

//دالة التالي بعد الشرح
function showSetup() {
    document.getElementById('intro').style.display = 'none';
    document.getElementById('setup').style.display = 'block';
}
// دالة لإضافة فريق جديد
function addTeam() {
    const teamName = document.getElementById('team-name').value.trim();
    const teamColor = document.getElementById('team-color').value;
    const teamMembers = document.getElementById('team-members').value.split('-').map(member => member.trim()).filter(member => member);

    if (teamName && teamColor && teamMembers.length > 0) {
        teams.push({ name: teamName, color: teamColor, members: teamMembers });

        // تحديث قائمة الفرق على الشاشة
        const teamsList = document.getElementById('teams-list');
        const teamDiv = document.createElement('div');
        teamDiv.className = 'team border p-3 mb-3';
        teamDiv.innerHTML = `
            <h3 style="color: ${teamColor};">${teamName}</h3>
            <p>الأعضاء: ${teamMembers.join(', ')}</p>
        `;
        teamsList.appendChild(teamDiv);

        // إعادة تعيين حقول إضافة الفريق
        document.getElementById('team-form').reset();
    }
}

// دالة لبدء اللعبة
function startGame() {
    
    if (teams.length < 2) {
        alert('يجب إضافة فريقين على الأقل لبدء اللعبة.');
        return;
    }

    // إخفاء شاشة الإعداد وعرض شاشة اللعبة
    document.getElementById('setup').style.display = 'none';
    document.getElementById('game').style.display = 'block';

    // إعداد اللوحة للعرض
    initializeBoard();
}

// دالة لإعداد اللوحة بالأعضاء الحاليين
function initializeBoard() {
    const board = document.getElementById('board');
    board.innerHTML = ''; // مسح اللوحة قبل البدء

    // حساب عدد الخانات الكلي
    const totalSquares = teams.reduce((sum, team) => sum + team.members.length, 0);
    const squares = [];

    // إضافة كل عضو إلى قائمة الخانات
    teams.forEach(team => {
        team.members.forEach(member => {
            squares.push({ team: team.name, color: team.color, member });
        });
    });

    // خلط الأعضاء
    shuffleArray(squares);

    // عرض الأعضاء على اللوحة
    squares.forEach(square => {
        const squareDiv = document.createElement('div');
        squareDiv.className = 'square';
        squareDiv.style.backgroundColor = square.color;
        squareDiv.textContent = square.member;
        squareDiv.dataset.team = square.team; // إضافة بيانات مخصصة للفريق
        squareDiv.addEventListener('click', () => selectWinner(square.member, square.team));
        board.appendChild(squareDiv);
    });
}

// دالة لبدء النزال

function startBattle() {
    const battleNotice = document.getElementById('battle-notice');
    const notice = document.getElementById('notice');
    battleNotice.innerHTML = '';

    // جمع جميع أعضاء الفرق غير الخاسرين
    let eligibleMembers = [];
    teams.forEach(team => {
        team.members.forEach(member => {
            if (!pastLosers.has(member)) {
                eligibleMembers.push({ team: team.name, member });
            }
        });
    });

    // التحقق من وجود أعضاء كافيين للنزال
    if (eligibleMembers.length < 2) {
        alert('لا يمكن بدء النزال، يجب إضافة أعضاء جدد للفرق.');
        return;
    }

    // خلط أعضاء الفرق غير الخاسرين
    shuffleArray(eligibleMembers);

    // اختيار الأعضاء للنزال
    let team1, team2;
    do {
        team1 = eligibleMembers.pop();
        team2 = eligibleMembers.pop();
    } while (team1.team === team2.team);

    // إضافة الأعضاء المختارين إلى النزال الحالي
    if (team1 && team2) {
        currentBattle = [team1, team2];
        battleNotice.innerHTML = `<strong>${team1.member} (${team1.team})</strong> <span>ضد</span> <strong>${team2.member} (${team2.team})</strong>`;
        notice.style.display = 'block';
        const squares = document.querySelectorAll('.square');
        squares.forEach(square => {
            if (square.textContent === team1.member || square.textContent === team2.member) {
                square.style.animation = 'flash 1s infinite'; // تطبيق تأثير الوميض
                square.classList.add('flashing'); 
            }
        });
    }
}


// دالة لاختيار الفائز
function selectWinner(member, team) {
    const winner = teams.find(t => t.name === team);
    const loser = currentBattle.find(item => item.member !== member || item.team !== team);

    // التحقق من عدم اختيار لاعب من بين الخاسرين
    if (!currentBattle.some(item => item.member === member && item.team === team)) {
        alert('لا يمكن اختيار عضو من فريق غير المشارك في النزال.');
        return;
    }

    if (winner && loser) {
       
        const battleNotice = document.getElementById('battle-notice');
        const notice = document.getElementById('notice');
        battleNotice.innerHTML = '';
        notice.innerHTML = '';
        updateBoard(winner, loser);
        checkWinner(winner);
        addLoser(loser.member); // إضافة الخاسر إلى قائمة الخاسرين
        // إزالة تأثير الوميض عند اختيار الفائز
        const squares = document.querySelectorAll('.square');
        squares.forEach(square => {
                square.classList.remove('flashing'); // إزالة تأثير الوميض
                square.style.animation = '';
        });
    }
}

// دالة لتحديث اللوحة بعد اختيار الفائز
function updateBoard(winner, loser) {
    const squares = document.querySelectorAll('.square');
    squares.forEach(square => {
        if (square.textContent === loser.member) {
            square.style.backgroundColor = winner.color;
            square.dataset.team = winner.name; // تحديث بيانات الفريق في المربع
            square.textContent =   '  أبــطـــال  ' + winner.name + ' مروا من هنا 💪';
        }
    });
}

// دالة للتحقق من الفائز
function checkWinner(winner) {
    const squares = document.querySelectorAll('.square');
    squares.forEach(square => {
        if (square.textContent === winner.member && square.style.backgroundColor === winner.color) {
            square.addEventListener('click', () => {
                square.style.backgroundColor = winner.color;
                square.textContent = winner.member;
            });
        }
    });
}

// دالة لنهاية اللعبة وحساب الفائز
function endGame() {
    const teamScores = {};

    const squares = document.querySelectorAll('.square');
    squares.forEach(square => {
        const team = square.dataset.team;
        if (team) {
            if (!teamScores[team]) {
                teamScores[team] = 0;
            }
            teamScores[team]++;
        }
    });


    // العثور على الفائز بناءً على أعلى نقاط
    let winner = { name: '', score: 0 };
    for (const team in teamScores) {
        if (teamScores[team] > winner.score) {
            winner = { name: team, score: teamScores[team] };
        }
    }

    // عرض جدول النقاط والفائز
    const resultDiv = document.getElementById('result');
    resultDiv.innerHTML = `
        <h2 class='alert alert-success'>الفائز بالمسابقة: ${winner.name}</h2>
        <table class="score-table">
            <thead>
                <tr>
                    <th>الفريق</th>
                    <th>النقاط</th>
                </tr>
            </thead>
            <tbody>
                ${Object.entries(teamScores).map(([team, score]) => `
                    <tr>
                        <td>${team}</td>
                        <td>${score}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}



// دالة لإضافة الخاسر إلى مجموعة الخاسرين
function addLoser(loser) {
    pastLosers.add(loser);
}

// دالة لخلط العناصر في مصفوفة
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}
