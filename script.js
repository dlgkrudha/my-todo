import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, doc, deleteDoc, query, where } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
// getRedirectResult 추가됨!
import { getAuth, signInWithRedirect, getRedirectResult, GoogleAuthProvider, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyCqj8MRt3mTierFo2y7dwVNIczMIEIa4kk",
  authDomain: "my-first-todo-server.firebaseapp.com",
  projectId: "my-first-todo-server",
  storageBucket: "my-first-todo-server.firebasestorage.app",
  messagingSenderId: "643667985855",
  appId: "1:643667985855:web:444d298b565486c3c58d0a"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// HTML 요소들
const loginBtn = document.getElementById('login-btn');
const logoutBtn = document.getElementById('logout-btn');
const userInfo = document.getElementById('user-info');
const todoContainer = document.getElementById('todo-container');
const userName = document.getElementById('user-name');
const userPhoto = document.getElementById('user-photo');
const todoList = document.getElementById('todo-list');
const addBtn = document.getElementById('add-btn');
const todoInput = document.getElementById('todo-input');

let currentUser = null;

// ==========================================
// ★ 1. 로그인 결과 확인 (탐정 기능)
// ==========================================
// 페이지가 로드되자마자 "혹시 로그인하고 돌아온 사람인가?" 확인
getRedirectResult(auth)
    .then((result) => {
        if (result) {
            console.log("로그인 성공하고 돌아옴!", result.user);
            // 여기서 굳이 뭘 안 해도 onAuthStateChanged가 처리해 줌
        }
    })
    .catch((error) => {
        console.error("로그인 하다가 에러 남:", error);
        alert("로그인 실패 ㅠㅠ: " + error.message);
    });

// ==========================================
// ★ 2. 로그인 상태 감지 (핵심!)
// ==========================================
onAuthStateChanged(auth, (user) => {
    if (user) {
        // 로그인 된 상태
        console.log("현재 접속자:", user.displayName);
        currentUser = user;
        
        loginBtn.style.display = 'none';      // 로그인 버튼 숨기기
        userInfo.style.display = 'block';     // 정보 보여주기
        todoContainer.style.display = 'block'; // 리스트 보여주기
        
        userName.innerText = user.displayName;
        userPhoto.src = user.photoURL;
        
        loadTodos();
    } else {
        // 로그아웃 상태
        console.log("로그인 안 됨");
        currentUser = null;
        
        // ★ 중요: 확실히 로그아웃 상태일 때만 로그인 버튼을 보여줌
        loginBtn.style.display = 'block';
        
        userInfo.style.display = 'none';
        todoContainer.style.display = 'none';
    }
});

// 버튼 이벤트들
loginBtn.addEventListener('click', () => {
    // 버튼 누르면 로딩 중임을 표시 (버튼 텍스트 변경)
    loginBtn.innerText = "구글로 이동 중...";
    const provider = new GoogleAuthProvider();
    signInWithRedirect(auth, provider);
});

logoutBtn.addEventListener('click', () => {
    signOut(auth);
    todoList.innerHTML = '';
    loginBtn.innerText = "구글로 로그인"; // 텍스트 원상복구
});

// 투두리스트 기능들 (그대로 유지)
async function loadTodos() {
    todoList.innerHTML = '';
    const q = query(collection(db, "todos"), where("uid", "==", currentUser.uid));
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
        const data = doc.data();
        printTodo(data.text, doc.id);
    });
}

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

async function addTodo() {
    const text = todoInput.value;
    if (text === '') return;
    const docRef = await addDoc(collection(db, "todos"), {
        text: text,
        isDone: false,
        uid: currentUser.uid
    });
    printTodo(text, docRef.id);
    todoInput.value = '';
}

addBtn.addEventListener('click', addTodo);
todoInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addTodo();
});