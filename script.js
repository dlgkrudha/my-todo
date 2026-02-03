import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, doc, deleteDoc, query, where } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
// 팝업, 리다이렉트 둘 다 가져오기
import { getAuth, signInWithPopup, signInWithRedirect, getRedirectResult, GoogleAuthProvider, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";

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
// ★ 1. 모바일인지 PC인지 확인하는 탐지기
// ==========================================
function isMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

// ==========================================
// ★ 2. 모바일(Redirect)로 돌아왔을 때 처리
// ==========================================
getRedirectResult(auth).then((result) => {
    if (result) {
        console.log("모바일 로그인 복귀 성공!");
    }
}).catch((error) => {
    console.error("로그인 에러:", error);
});

// ==========================================
// ★ 3. 로그인 상태 감지 (화면 바꾸기)
// ==========================================
onAuthStateChanged(auth, (user) => {
    if (user) {
        currentUser = user;
        loginBtn.style.display = 'none';
        userInfo.style.display = 'block';
        todoContainer.style.display = 'block';
        
        userName.innerText = user.displayName;
        userPhoto.src = user.photoURL;
        loadTodos();
    } else {
        currentUser = null;
        loginBtn.style.display = 'block';
        userInfo.style.display = 'none';
        todoContainer.style.display = 'none';
    }
});

// ==========================================
// ★ 4. 로그인 버튼 하나로 PC/모바일 자동 구분!
// ==========================================
loginBtn.addEventListener('click', async () => {
    const provider = new GoogleAuthProvider();
    
    if (isMobile()) {
        // [폰] 페이지 이동 방식
        await signInWithRedirect(auth, provider);
    } else {
        // [컴퓨터] 팝업 창 방식 (영상 문제 해결사!)
        try {
            await signInWithPopup(auth, provider);
        } catch (error) {
            alert("PC 로그인 실패: " + error.message);
        }
    }
});

logoutBtn.addEventListener('click', () => {
    signOut(auth);
    todoList.innerHTML = '';
});

// 투두리스트 기능 (기존 유지)
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