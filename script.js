import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, doc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

// 1. 파이어베이스 설정 (네 출입증 그대로)
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

// 3. 화면에 그리기 함수 (삭제 기능 추가됨!)
// id: 서버에 저장된 문서의 주민번호(ID)
function printTodo(text, id) {
    const li = document.createElement('li');
    
    const span = document.createElement('span');
    span.innerText = text;
    
    const delBtn = document.createElement('button');
    delBtn.innerText = '❌';
    
    // [중요] 삭제 버튼 클릭 시 실행될 코드
    delBtn.addEventListener('click', async function() {
        if (confirm("진짜 지울까요?")) { // 실수로 누르는 거 방지
            try {
                // 1. 서버(DB)에서 삭제 명령: "todos 폴더에 있는 이 id를 가진 문서를 지워라!"
                await deleteDoc(doc(db, "todos", id));
                
                // 2. 화면(HTML)에서도 삭제
                li.remove();
            } catch (e) {
                console.error("삭제 실패:", e);
                alert("삭제하다가 문제가 생겼어요 ㅠㅠ");
            }
        }
    });

    li.appendChild(span);
    li.appendChild(delBtn);
    todoList.appendChild(li);
}

// 4. 데이터 불러오기
async function loadTodos() {
    todoList.innerHTML = ''; // 중복 방지 (기존 목록 싹 비우고 시작)
    
    const querySnapshot = await getDocs(collection(db, "todos"));
    
    querySnapshot.forEach((doc) => {
        const data = doc.data();
        // doc.id : 파이어베이스가 자동으로 만들어준 신분증 번호
        printTodo(data.text, doc.id);
    });
}

// 5. 할 일 추가하기 함수 (기능 분리)
async function addTodo() {
    const text = todoInput.value;
    if (text === '') return;

    try {
        // 서버에 저장하고, 저장된 결과(참조)를 받아옴
        const docRef = await addDoc(collection(db, "todos"), {
            text: text,
            isDone: false
        });
        
        // 화면에 그릴 때, 방금 받은 따끈따끈한 ID(docRef.id)를 같이 넘겨줌
        printTodo(text, docRef.id);
        
        todoInput.value = '';
    } catch (e) {
        console.error("에러 발생: ", e);
    }
}

// 6. 버튼 클릭 이벤트
addBtn.addEventListener('click', addTodo);

// 7. [추가됨] 엔터 키 이벤트!
todoInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        addTodo();
    }
});

// 시작!
loadTodos();