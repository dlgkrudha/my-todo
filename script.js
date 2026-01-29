import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, doc, deleteDoc, query, where } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
// ★ 인증 기능 불러오기 (새로 추가됨!)
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyCqj8MRt3mTierFo2y7dwVNIczMIEIa4kk",
  authDomain: "my-first-todo-server.firebaseapp.com",
  projectId: "my-first-todo-server",
  storageBucket: "my-first-todo-server.firebasestorage.app",
  messagingSenderId: "643667985855",
  appId: "1:643667985855:web:444d298b565486c3c58d0a"
};

// 앱 시작
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app); // 로그인 담당관

// HTML 요소들 가져오기
const loginBtn = document.getElementById('login-btn');
const logoutBtn = document.getElementById('logout-btn');
const userInfo = document.getElementById('user-info');
const todoContainer = document.getElementById('todo-container');
const userName = document.getElementById('user-name');
const userPhoto = document.getElementById('user-photo');
const todoList = document.getElementById('todo-list');
const addBtn = document.getElementById('add-btn');
const todoInput = document.getElementById('todo-input');

// 현재 로그인한 사용자 정보 담을 변수
let currentUser = null;

// ==========================================
// 1. 로그인 & 로그아웃 기능
// ==========================================

// 로그인 버튼 누르면 구글 창 띄우기
loginBtn.addEventListener('click', async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
});

// 로그아웃 버튼
logoutBtn.addEventListener('click', () => {
    signOut(auth);
    todoList.innerHTML = ''; // 화면 비우기
});

// ★ 로그인 상태가 바뀔 때마다 실행되는 감시자
onAuthStateChanged(auth, (user) => {
    if (user) {
        // 로그인 성공했을 때
        currentUser = user;
        
        loginBtn.style.display = 'none';      // 로그인 버튼 숨기기
        userInfo.style.display = 'block';     // 회원 정보 보여주기
        todoContainer.style.display = 'block'; // 투두리스트 보여주기
        
        userName.innerText = user.displayName; // 이름 표시
        userPhoto.src = user.photoURL;         // 사진 표시
        
        loadTodos(); // 내 글 불러오기!
    } else {
        // 로그아웃 했을 때
        currentUser = null;
        
        loginBtn.style.display = 'block';
        userInfo.style.display = 'none';
        todoContainer.style.display = 'none';
    }
});

// ==========================================
// 2. 투두리스트 기능 (개인화 적용!)
// ==========================================

async function loadTodos() {
    todoList.innerHTML = '';
    
    // ★ [핵심] 그냥 가져오는 게 아니라, 'uid'가 '내 아이디'랑 같은 것만 가져와! (Query)
    const q = query(collection(db, "todos"), where("uid", "==", currentUser.uid));
    const querySnapshot = await getDocs(q);
    
    querySnapshot.forEach((doc) => {
        const data = doc.data();
        printTodo(data.text, doc.id);
    });
}

// 화면에 그리기 (이전과 동일)
function printTodo(text, id) {
    const li = document.createElement('li');
    const span = document.createElement('span');
    span.innerText = text;
    const delBtn = document.createElement('button');
    delBtn.innerText = '❌';
    
    delBtn.addEventListener('click', async function() {
        if (confirm("지울까요?")) {
            await deleteDoc(doc(db, "todos", id));
            li.remove();
        }
    });

    li.appendChild(span);
    li.appendChild(delBtn);
    todoList.appendChild(li);
}

// 추가하기 (저장할 때 꼬리표 붙이기)
async function addTodo() {
    const text = todoInput.value;
    if (text === '') return;

    // ★ 저장할 때 'uid: currentUser.uid'를 같이 저장함!
    const docRef = await addDoc(collection(db, "todos"), {
        text: text,
        isDone: false,
        uid: currentUser.uid  // <--- 이게 바로 소유권 표시!
    });
    
    printTodo(text, docRef.id);
    todoInput.value = '';
}

addBtn.addEventListener('click', addTodo);
todoInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addTodo();
});