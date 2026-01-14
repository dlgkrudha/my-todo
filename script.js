const todoInput = document.getElementById('todo-input');
const addBtn = document.getElementById('add-btn');
const todoList = document.getElementById('todo-list');

document.addEventListener('DOMContentLoaded', loadTodos);

function loadTodos(){
    const savedTodos = localStorage.getItem('mytodos');

    if(savedTodos){
        const parsedTodos = JSON.parse(savedTodos);

        parsedTodos.forEach(function(todoText){
            paintTodo(todoText);
        });
    }
}

function paintTodo(text) {
    const newLi = document.createElement('li');

    const newSpan = document.createElement('span');
    newSpan.innerText = text;

    const deleteBtn = document.createElement('button');
    deleteBtn.innerText = '삭제';
    deleteBtn.style.marginLeft = "10px";
    deleteBtn.style.backgroundColor ="#ff4444";

    deleteBtn.addEventListener('click', function(){
        newLi.remove();
        saveTodos();
    });

    newLi.appendChild(newSpan);
    newLi.appendChild(deleteBtn);
    todoList.appendChild(newLi);
}

function saveTodos() {
    const allLi = todoList.querySelectorAll('li');
    const todosArray = [];

    allLi.forEach(function(li){
        const text = li.querySelector('span').innerText;
        todosArray.push(text);
    });

    localStorage.setItem('mytodos', JSON.stringify(todosArray));

}

function addTodo(){
    if(todoInput.value ===''){
        alert('할 일을 입력해주세요!');
        return;
    }

    paintTodo(todoInput.value); //화면에 그리고
    saveTodos();
    todoInput.value = '';
}

addBtn.addEventListener('click', addTodo);

todoInput.addEventListener('keypress', function(event){
    if(event.key === 'Enter'){
        addTodo();
    }
});