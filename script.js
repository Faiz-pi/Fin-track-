let app=document.getElementById("app");
let loginPage=document.getElementById("login-page");
let registerPage=document.getElementById("register-page");
let loginBtn=document.getElementById("login-btn");
let registerBtn=document.getElementById("register-btn");
let showRegister=document.getElementById("show-register");
let showLogin=document.getElementById("show-login");

showRegister.onclick=function(e){
    e.preventDefault();
    loginPage.style.display="none";
    registerPage.style.display="flex";
}

showLogin.onclick=function(e){
    e.preventDefault();
    registerPage.style.display="none";
    loginPage.style.display="flex";
}

registerBtn.onclick=function(){

    let name=document.getElementById("reg-name").value;
    let email=document.getElementById("reg-email").value;
    let pass=document.getElementById("reg-pass").value;
    let pass2=document.getElementById("reg-pass2").value;
    
    if(name==""||email==""||pass==""||pass2==""){
        alert("Fill all fields");
        return;
    }

    if(pass!=pass2){
        alert("Passwords do not match");
        return;
    }
    let user={
        name:name,
        email:email,
        pass:pass
    };

    localStorage.setItem("user",JSON.stringify(user));
    alert("Account created");
    registerPage.style.display="none";
    loginPage.style.display="flex";
}

loginBtn.onclick=function(){
    let email=document.getElementById("login-email").value;
    let pass=document.getElementById("login-pass").value;
    let user=JSON.parse(localStorage.getItem("user"));

    if(!user){
        alert("Create an account first");
        return;
    }

    if(email==user.email && pass==user.pass){
        sessionStorage.setItem("login","true");
        loginPage.style.display="none";
        app.style.display="block";

    }else{
        alert("Wrong email or password");
    }
}

document.getElementById("logout-btn").onclick=function(){
    sessionStorage.removeItem("login");

    app.style.display="none";
    loginPage.style.display="flex";
}

if(sessionStorage.getItem("login")=="true"){
    app.style.display="block";
    loginPage.style.display="none";
}else{
    app.style.display="none";
    loginPage.style.display="flex";
}

let list = [];
let chart;
let filter = "all";

let data = localStorage.getItem("list");
if (data) {
    list = JSON.parse(data);
}

let name = localStorage.getItem("name") || "";
let currency = localStorage.getItem("currency") || "₹";
let dark = localStorage.getItem("dark") || "false";

let dashboard = document.getElementById("dashboard");
let settings = document.getElementById("settings");
let modal = document.getElementById("modal");

let homeBtn = document.getElementById("home-btn");
let settingBtn = document.getElementById("setting-btn");

let addBtn = document.getElementById("add-btn");
let closeBtn = document.getElementById("close-btn");

let form = document.getElementById("form");

let balance = document.getElementById("balance");
let income = document.getElementById("income");
let expense = document.getElementById("expense");
let total = document.getElementById("total");

let table = document.getElementById("table-data");

let nameInput = document.getElementById("name");
let currencyInput = document.getElementById("currency");
let darkInput = document.getElementById("dark");

nameInput.value = name;
currencyInput.value = currency;

if (dark == "true") {
    document.body.classList.add("dark");
    darkInput.checked = true;
}

function showPage(page) {
    if (page == "dashboard") {
        dashboard.style.display = "block";
        settings.style.display = "none";
    } else {
        dashboard.style.display = "none";
        settings.style.display = "block";
    }
}

homeBtn.onclick = function(e) {
    e.preventDefault();
    showPage("dashboard");
}

settingBtn.onclick = function(e) {
    e.preventDefault();
    showPage("settings");
}

addBtn.onclick = function() {
    modal.style.display = "flex";
}

closeBtn.onclick = function() {
    modal.style.display = "none";
}

window.onclick = function(e) {
    if (e.target == modal) {
        modal.style.display = "none";
    }
}

function saveData() {
    localStorage.setItem("list", JSON.stringify(list));
}

function updateCards() {
    let inMoney = 0;
    let exMoney = 0;
    
    for (let item of list) {
        if (item.type == "income") {
            inMoney += item.amount;
        } else {
            exMoney += item.amount;
        }
    }
    
    balance.textContent = currency + (inMoney - exMoney);
    income.textContent = currency + inMoney;
    expense.textContent = currency + exMoney;
    total.textContent = list.length;
}

function showTable() {
    table.innerHTML = "";
    
    let showList = list;
    
    if (filter != "all") {
        showList = list.filter(function(item) {
            return item.type == filter;
        });
    }
    
    for (let item of showList) {
        
        let row = document.createElement("tr");
        
        row.innerHTML = `
        <td>${item.date}</td>
        <td>${item.text}</td>
        <td>${item.category}</td>
        <td style="color:${item.type=="income"?"green":"red"}">
            ${currency}${item.amount}
        </td>
        <td>
            <button onclick="deleteItem(${item.id})">Delete</button>
        </td>
        `;
        
        table.appendChild(row);
    }
}

form.onsubmit = function(e) {
    e.preventDefault();
    
    let type = document.getElementById("type").value;
    let text = document.getElementById("text").value;
    let amount = document.getElementById("amount").value;
    let date = document.getElementById("date").value;
    let category = document.getElementById("category").value;
    
    if (type == "" || text == "" || amount == "" || date == "" || category == "") {
        alert("Fill all fields");
        return;
    }
    
    let item = {
        id: Date.now(),
        type: type,
        text: text,
        amount: Number(amount),
        date: date,
        category: category
    };
    
    list.push(item);
    
    saveData();
    refresh();
    
    form.reset();
    modal.style.display = "none";
}

function deleteItem(id) {
    let ok = confirm("Delete this transaction?");
    if (!ok) {
        return;
    }
    list = list.filter(function(item) {
        return item.id != id;
    });
    
    saveData();
    refresh();
}

let filterBtn = document.querySelectorAll(".filter-btn");

for (let btn of filterBtn) {
    btn.onclick = function() {
        filter = this.dataset.type;
        showTable();
    }
}

function showChart() {
    
    let label = [];
    let inData = [];
    let exData = [];
    
    for (let item of list) {
        label.push(item.date);
        
        if (item.type == "income") {
            inData.push(item.amount);
            exData.push(0);
        } else {
            inData.push(0);
            exData.push(item.amount);
        }
    }
    
    if (chart) {
        chart.destroy();
    }
    
    let ctx = document.getElementById("chart");
    
    chart = new Chart(ctx, {
        type: "bar",
        data: {
            labels: label,
            datasets: [
            {
                label: "Income",
                data: inData,
                backgroundColor: "green"
            },
            {
                label: "Expense",
                data: exData,
                backgroundColor: "red"
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });
}

function refresh() {
    updateCards();
    showTable();
    showChart();
}
refresh();

nameInput.oninput=function(){
    localStorage.setItem("name",this.value);
}

currencyInput.onchange=function(){
    currency=this.value;
    localStorage.setItem("currency",currency);
    refresh();
}

darkInput.onchange=function(){
    if(this.checked){
        document.body.classList.add("dark");
        localStorage.setItem("dark","true");
    }else{
        document.body.classList.remove("dark");
        localStorage.setItem("dark","false");
    }
}

document.getElementById("reset-btn").onclick=function(){

    let ok=confirm("Reset all data?");

    if(!ok){
        return;
    }

    list=[];

    saveData();

    localStorage.removeItem("name");
    localStorage.removeItem("currency");
    localStorage.removeItem("dark");

    nameInput.value="";
    currency="₹";
    currencyInput.value="₹";
    darkInput.checked=false;
    
    document.body.classList.remove("dark");
    refresh();
}

showPage("dashboard");
refresh();