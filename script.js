const todoInput = document.getElementById('todo-input');
const addBtn = document.getElementById('add-btn');
const todoList = document.getElementById('todo-list');

// 1. 로드하기
document.addEventListener('DOMContentLoaded', loadTodos);

function loadTodos() {
    const savedTodos = localStorage.getItem('mytodos');
    
    if (savedTodos) {
        const parsedTodos = JSON.parse(savedTodos);
        // 저장된 것들을 하나씩 화면에 그림
        parsedTodos.forEach(function(todo) {
            paintTodo(todo.text, todo.isDone); // 글자와 완료상태를 같이 넘김
        });
    }
}

// 2. 화면에 그리기 (매개변수 2개 받음: 텍스트, 완료여부)
function paintTodo(text, isDone) {
    const newLi = document.createElement('li');
    const newSpan = document.createElement('span');
    
    newSpan.innerText = text;
    
    // 만약 저장된 상태가 "완료"라면, 줄 긋기 클래스 추가
    if (isDone) {
        newSpan.classList.add('done');
    }

    // ★ 핵심 기능: 글씨 클릭하면 완료 상태 토글(왔다갔다)
    newSpan.addEventListener('click', function() {
        newSpan.classList.toggle('done'); // 줄 긋기/없애기
        saveTodos(); // 바뀐 상태 저장
    });

    const deleteBtn = document.createElement('button');
    deleteBtn.innerText = "삭제";
    deleteBtn.style.marginLeft = "10px";
    deleteBtn.style.backgroundColor = "#ff4444"; 

    deleteBtn.addEventListener('click', function() {
        newLi.remove();
        saveTodos();
    });

    newLi.appendChild(newSpan);
    newLi.appendChild(deleteBtn);
    todoList.appendChild(newLi);
}

// 3. 저장하기 (데이터 구조 변경!)
function saveTodos() {
    const allLi = todoList.querySelectorAll('li');
    const todosArray = [];

    allLi.forEach(function(li) {
        const span = li.querySelector('span');
        // 글자뿐만 아니라, 완료되었는지(done 클래스가 있는지)도 확인해서 객체로 만듦
        const todoObj = {
            text: span.innerText,
            isDone: span.classList.contains('done') // true 또는 false
        };
        todosArray.push(todoObj);
    });

    localStorage.setItem('mytodos', JSON.stringify(todosArray));
}

// 4. 추가하기
function addTodo() {
    if (todoInput.value === '') {
        alert('할 일을 입력해주세요!');
        return;
    }
    // 처음 추가할 때는 완료 안 된 상태(false)로 시작
    paintTodo(todoInput.value, false);
    saveTodos();
    todoInput.value = '';
}

addBtn.addEventListener('click', addTodo);

todoInput.addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        addTodo();
    }
});