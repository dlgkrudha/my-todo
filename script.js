import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, doc, deleteDoc, query, where } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
// 리다이렉트 관련 코드 제거하고 팝업만 남김
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";

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
// ★ 로그인 상태 감지
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
// ★ 버튼 클릭: PC든 폰이든 무조건 "팝업"으로 통일!
// ==========================================
loginBtn.addEventListener('click', async () => {
    const provider = new GoogleAuthProvider();
    try {
        // 폰에서도 이 방식이 훨씬 안전해 (기억 상실 방지)
        await signInWithPopup(auth, provider);
    } catch (error) {
        alert("로그인 실패: " + error.message);
    }
});

logoutBtn.addEventListener('click', () => {
    signOut(auth);
    todoList.innerHTML = '';
});

// 투두리스트 기능
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