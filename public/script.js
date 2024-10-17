var count = 0;
var students = [];
var global_id;

window.onload = function() {
    const branch = localStorage.getItem('branch');
    const division = localStorage.getItem('division');

    if (!branch || !division) {
        alert("Branch and division not selected. Please go back and select.");
        window.location.href = 'branch.html'; // Redirect to branch selection if not set
        return;
    }

    fetch(`/data?branch=${branch}&division=${division}`)
        .then(response => response.json())
        .then(data => {
            students = data;
            count = students.length > 0 ? Math.max(...students.map(s => s.ID)) : 0;
            showTable();
        })
        .catch(error => console.error('Error loading data:', error));
};

function addStudent() {
    const nameValue = document.getElementById('name').value;
    const emailValue = document.getElementById('email').value;
    const ageValue = document.getElementById('age').value;
    const gradeValue = document.getElementById('grade').value;
    const degreeValue = document.getElementById('degree').value;

    if (document.querySelector("#submit").innerText === "Edit Student") {
        let index = students.findIndex(student => student.ID === global_id);
        students[index] = { ID: global_id, name: nameValue, email: emailValue, age: ageValue, grade: gradeValue, degree: degreeValue };
        document.querySelector("#submit").innerHTML = "Add Student";
    } else {
        if (nameValue === '' || emailValue === '' || ageValue === '' || gradeValue === '' || degreeValue === "") {
            alert("All fields are required!");
            return;
        }
        count++;
        students.push({ ID: count, name: nameValue, email: emailValue, age: ageValue, grade: gradeValue, degree: degreeValue });
    }

    clearInputs();
    showTable();
    saveToServer();
}

function clearInputs() {
    document.getElementById('name').value = "";
    document.getElementById('email').value = "";
    document.getElementById('age').value = "";
    document.getElementById('grade').value = "";
    document.getElementById('degree').value = "";
}

function showTable() {
    const table = document.getElementById('tbody');
    while (table.hasChildNodes()) {
        table.removeChild(table.firstChild);
    }

    students.forEach(student => {
        const row = document.createElement('tr');
        Object.values(student).forEach(val => {
            const cell = document.createElement('td');
            cell.innerText = val;
            row.appendChild(cell);
        });
        const actionsCell = document.createElement('td');
        const editBtn = document.createElement('button');
        editBtn.innerHTML = '<i class="fa fa-edit"></i>';
        editBtn.onclick = () => editStudent(student.ID);
        const deleteBtn = document.createElement('button');
        deleteBtn.innerHTML = '<i class="fa fa-trash"></i>';
        deleteBtn.onclick = () => deleteStudent(student.ID);
        actionsCell.appendChild(editBtn);
        actionsCell.appendChild(deleteBtn);
        row.appendChild(actionsCell);
        table.appendChild(row);
    });
}

function deleteStudent(id) {
    students = students.filter(student => student.ID !== id);
    showTable();
    saveToServer();
}

function editStudent(id) {
    global_id = id;
    const student = students.find(student => student.ID === id);
    document.getElementById("name").value = student.name;
    document.getElementById("email").value = student.email;
    document.getElementById("age").value = student.age;
    document.getElementById("grade").value = student.grade;
    document.getElementById("degree").value = student.degree;
    document.querySelector("#submit").innerHTML = "Edit Student";
}

function saveToServer() {
    const branch = localStorage.getItem('branch');
    const division = localStorage.getItem('division');
    fetch('/save', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ branch, division, students })
    })
    .then(response => {
        if (!response.ok) throw new Error('Error saving data');
        return response.text();
    })
    .then(data => console.log(data))
    .catch(error => console.error('Error saving data:', error));
}

function search() {
    const input = document.getElementById('search');
    const filter = input.value.toUpperCase();
    const table = document.getElementById('table');
    const rows = table.getElementsByTagName('tr');

    for (let i = 1; i < rows.length; i++) {
        let row = rows[i];
        let name = row.cells[1].innerText.toUpperCase();
        let email = row.cells[2].innerText.toUpperCase();
        let degree = row.cells[5].innerText.toUpperCase();
        if (name.includes(filter) || email.includes(filter) || degree.includes(filter)) {
            row.style.display = "";
        } else {
            row.style.display = "none";
        }
    }
}
