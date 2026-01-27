import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

// 1. 파이어베이스 설정 (네 출입증)
const firebaseConfig = {
  apiKey: "AIzaSyCqj8MRt3mTierFo2y7dwVNIczMIEIa4kk",
  authDomain: "my-first-todo-server.firebaseapp.com",
  projectId: "my-first-todo-server",
  storageBucket: "my-first-todo-server.firebasestorage.app",
  messagingSenderId: "643667985855",
  appId: "1:643667985855:web:444d298b565486c3c58d0a"
};

// 2. 연결 시작
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const todoInput = document.getElementById('todo-input');
const addBtn = document.getElementById('add-btn');
const todoList = document.getElementById('todo-list');

// 3. 화면에 할 일 하나를 그려주는 함수 (디자인 복구!)
function printTodo(text) {
    const li = document.createElement('li');
    
    // 글자 넣기
    const span = document.createElement('span');
    span.innerText = text;
    
    // 삭제 버튼 (아직 기능은 폼이야!)
    const delBtn = document.createElement('button');
    delBtn.innerText = '❌';

    li.appendChild(span);
    li.appendChild(delBtn);
    todoList.appendChild(li);
}

// 4. [핵심] 사이트 접속하자마자 서버에서 데이터 가져오기!
async function loadTodos() {
    console.log("서버에서 로딩 중...");
    
    // 'todos' 컬렉션에 있는 모든 문서 가져오기
    const querySnapshot = await getDocs(collection(db, "todos"));
    
    // 하나씩 꺼내서 화면에 그리기
    querySnapshot.forEach((doc) => {
        const data = doc.data(); // { text: "서버 테스트", isDone: false }
        printTodo(data.text);
    });
    console.log("로딩 완료!");
}

// 5. 추가 버튼 클릭 이벤트
addBtn.addEventListener('click', async function() {
    const text = todoInput.value;
    if (text === '') return;

    try {
        // 서버에 저장
        await addDoc(collection(db, "todos"), {
            text: text,
            isDone: false
        });
        
        // 화면에도 바로 추가 (새로고침 안 해도 뜨게)
        printTodo(text);
        
        todoInput.value = '';
    } catch (e) {
        console.error("에러 발생: ", e);
        alert("저장 실패 ㅠㅠ");
    }
});

// 사이트 켜지면 바로 로딩 시작!
loadTodos();