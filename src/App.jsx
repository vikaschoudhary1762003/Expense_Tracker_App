import { useState, useEffect, useTransition } from 'react'
import { Chart as ChartJS, CategoryScale, LinearScale,BarElement,  Title,Tooltip, Legend,ArcElement, plugins, PointElement,LineElement} from "chart.js";
ChartJS.register( CategoryScale,LinearScale,BarElement, Title,Tooltip,  Legend,ArcElement, PointElement,LineElement);
 
import { Bar } from "react-chartjs-2";
import { Pie } from "react-chartjs-2";
import { Line } from "react-chartjs-2";
import './App.css'
import { color } from 'chart.js/helpers';

function App() {
  const [page, setPage] = useState('home');  // state for home page nd dashboard page
  const [forms, setForms] =useState(''); // state for display signup and login form
  const [signupFormData , setSignupFormData] = useState({S_user_name:"",S_user_acc:"",S_user_email:"",S_user_pass:""}); // input fields of the singup data form
  const [loginFormData , setLoginFormData] = useState({L_user_name:"",L_user_acc:"",L_user_pass:""}); // input fields of the login form
  const [submitted, setSubmitted] = useState(false); // to change calue
  const [transFormDisplay , setTransFormDisplay]= useState(""); // display transaction form when click on add transaction
  const [type, setType] = useState(''); // state for selecting type income or expense
  const [category, setCategory] = useState(''); // state for selecting category as per type
  const [transFormData , setTransFormData] = useState({amount:"" , type:"" , category:"" , date:"" , description:"" }); // transaction form input fields data
  const [currentUser, setCurrentUser] = useState(null); // state represent current user and their data
  const [transactions, setTransactions] = useState([]); // state store all transactions of a particular user
  const [editFormDisplay , setEditFormDisplay] =useState('');  // Display the edit form when clicked on edit btn in dashboard transaction
  const [editFormData , setEditFormData] = useState({amount:"" , type:"" , category:"" , date:"" , description:""}) // store edit form data
  const [editIndex, setEditIndex] = useState(null); // Edit the transactions 
  const [dashboardView , setDashboardView]= useState('main') // state for change or rerender the pages inside dashboard like budget set , profit loss etc
  const [budgetData , setBudgetData] =useState({});  // object that stores budget data from localstorage
  const [budgetFormData , setBudgetFormData] = useState({amount:"" , months:""}); // input fields of budget form
  const [showmenu, setShowMenu] = useState(false); // display menu list when click on btn like dashboard anaysis budget set and profit loss


 // FUNCTION TO DISPLAY BUDGET WITH EXPENSE
  const getMonthlyExpense = (year, monthName) => {
    const monthIndexMap = {
      Jan: "01", Feb: "02", March: "03", April: "04",
      May: "05", June: "06", July: "07", Aug: "08",
      Sept: "09", October: "10", Nov: "11", Dec: "12"
    };

    const monthIndex = monthIndexMap[monthName];

    return transactions
      .filter(t => {
        if (t.type !== "Expense") return false;

        const [tYear, tMonth] = t.date.split("-");
        return tYear === year && tMonth === monthIndex;
      })
      .reduce((acc, curr) => acc + Number(curr.amount), 0);
  };




//FUNCTION FOR SINGUP FORM INPUT HANDLING
const handleSignupInputs =(e)=>{
   setSignupFormData({...signupFormData ,[e.target.name]:e.target.value});
}

//FUNCTION FOR LOGIN FORM INPUT HANDLING
const handleLoginInputs=(e)=>{
  setLoginFormData({...loginFormData, [e.target.name]:e.target.value});
}


//SINGUP FUNCTION
const signup = (e) => {
  e.preventDefault();
  // validation for name
  if (!/^[A-Za-z]+$/.test(signupFormData.S_user_name)) {
  alert("Only alphabets allowed");
  return;
}

// validation for account no
if (!/^\d{10}$/.test(signupFormData.S_user_acc)) {
  alert("Account number must be exactly 10 digits");
  return;
}

// validation for email
if (!/^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(signupFormData.S_user_email)) {
  alert("Email must be a valid Gmail address");
  return;
}

  // validation for password
  if(signupFormData.S_user_pass.length < 8 ){ 
    alert('Password should be atleast 8 character'); return;
  }
  const hasEmptyField = Object.values(signupFormData).some(      // it initialy red fields and when data enterd the blue
    (value) => !value
  );

  if (hasEmptyField) return; // ⛔ stop saving

  //check if user already exists
  const User_stored_Data = JSON.parse(localStorage.getItem("user_data")) || []; // geting stored data of all user's from localstorage and stored in this variable

  const user_exists = User_stored_Data.find( (user)=> user.S_user_acc === signupFormData.S_user_acc); // checking if user already exists
  
  if(user_exists){ 
    alert("User Already Exists");
    return;
  }
  //in case user not exists then save or add that user to the localStorage
  User_stored_Data.push(signupFormData); // this code push(adding) or updating the new user into the user_stored_data 

  localStorage.setItem("user_data", JSON.stringify(User_stored_Data)); // this code saving updated user_saved_data  to the localstorage

  alert("Registered Successfully");

  setSignupFormData({  // empty the input fields after form submit
    S_user_name: "",
    S_user_acc: "",
    S_user_email: "",
    S_user_pass: ""
  });

  setSubmitted(false); // state to false the submit again
};



//LOGIN FUNCTION
const login=(e)=>{
  e.preventDefault(); // prevent overwriting
  
  // validation for inputs
  if(!loginFormData.L_user_name || !loginFormData.L_user_acc || !loginFormData.L_user_pass){
     return;
  }

  //check if user already registered or not
  const user_stored_data = JSON.parse(localStorage.getItem("user_data")) || []; // getting user stored data from localstorage
  const user_exists = user_stored_data.find( (user)=> user.S_user_acc === loginFormData.L_user_acc   &&   user.S_user_pass === loginFormData.L_user_pass ); // checking if user registered(exists) or not
  if(user_exists){
    setCurrentUser(user_exists); // the loggined user will store here
    setLoginFormData({L_user_name:"",L_user_acc:"",L_user_pass:""});
    setPage('dashboard');
  }else{
    alert("No user found pls singup first");
  }
}

// LOGIC FOR SELECT CATEGPRU AS PER TYPE SELECT
const IncomeCategory = ['Salary' ,'Payment','Bonus','Rent','Others'];
const ExpenseCategory = ['Groceries','Bills','Rent','Food','Other'];
const Categories =transFormData.type === 'Income' ? IncomeCategory : transFormData.type === 'Expense' ? ExpenseCategory : [];


//TRANSACTION FORM HANDLE INPUTS
const handleTransInput=(e)=>{
  setTransFormData({...transFormData , [e.target.name]:e.target.value});
}


// ADD TRANSACTION FUNCTION
const addtransactions =(e)=>{
  e.preventDefault();
  setTransFormData({amount:"" , type:"" , category:"" , date:"" , description:""});
  //validation for input fields
  if(!transFormData.amount || !transFormData.type || !transFormData.category || !transFormData.date || !transFormData.description){
    alert('pls fill required details');
    return;
  }
   
  // save transaction to the localstorage in a particular user account
   // first get existing transactions for adding multiple user transactins
   const key = `user_transaction_${currentUser.S_user_acc}`;
   const existing_trans = JSON.parse(localStorage.getItem(key)) ||[];  // get existing data
   const updated_trans = [...existing_trans , transFormData]; // update existing data with new and add multiple transactions
   localStorage.setItem(key , JSON.stringify(updated_trans)); // save back  new trans to localstorage   , `user_transaction_${loginFormData.L_user_acc}`  this code will add transaction only on that account
   setTransactions(updated_trans);
   alert("Transaction Saved");

   setTransFormData({amount:"" , type:"" , category:"" , date:"" , description:""});
   setTransFormDisplay('');
}


//USE EFFECT TO DISPLAY USER TRANSACTIONS ON SCREEN AND USER DATA LIKE NAME AND AMOUNT , ACC_NO
useEffect( ()=>{
  const user_data = JSON.parse(localStorage.getItem(`user_transaction_${currentUser}`)) ||[]; // get user details of a particular user
  setTransactions(user_data);
},[currentUser])


// USEEFFECT FOR TRANSACTION DATA FETCH
useEffect(() => {
  if (!currentUser) return;

  const key = `user_transaction_${currentUser.S_user_acc}`;
  const user_data = JSON.parse(localStorage.getItem(key)) || [];
  setTransactions(user_data);
}, [currentUser]);

//TOTAL INCOME , EXPENSE ,SAVING LOGICS
const Total_Income = transactions 
  .filter(t => t.type === "Income")
  .reduce((acc, curr) => acc + Number(curr.amount), 0);

const Total_Expense = transactions
    .filter(t => t.type === 'Expense') .reduce( (acc ,curr) => acc +Number(curr.amount),0);

const Total_Saving = Total_Income - Total_Expense;

//PERCENTAGE OF TOTAL EXPENSE AND SAVINGS
const Exp_percentage = ((Total_Expense / Total_Income) * 100) .toFixed(2); // calculation for total expense percentage
const Sav_percentage = ((Total_Saving / Total_Income) *100).toFixed(2) ;



//EDIT HANDLE INPUT CHANGE
const handleEditInput = (e) => {
  setEditFormData({
    ...editFormData,
    [e.target.name]: e.target.value
  });
}


//FUNCTION TO EDIT THE TRANSACTIONS
const edit_transaction =(e)=>{
  e.preventDefault();  //page refresh when form submititng

  const key = `user_transaction_${currentUser.S_user_acc}`;   // Create a unique key for storing this user's transactions in localStorage


  const updated = [...transactions];     // Create a copy of current transactions array (we do this because we should NOT directly modify state in React)
  updated[editIndex] = editFormData;  // Replace the old transaction at "editIndex" with the new edited data and editFormData contains updated values from the edit form
  
  setTransactions(updated);    // Update React state so UI re-renders with new data immediately
  localStorage.setItem(key ,JSON.stringify(updated));  // save updated transaction back to localstorage so data remains even after page refresh
  alert("Edit Successfully");

  setEditFormDisplay("");
  setEditIndex(null);
}


//FUNCTION TO DELETE THE PARTICULAR TRANSACTION
const delete_trans = (targetTransaction) => {
  // Remove the clicked transaction from array
  const updated = transactions.filter(
    (t) =>
      !(
        t.amount === targetTransaction.amount &&
        t.date === targetTransaction.date &&
        t.description === targetTransaction.description &&
        t.type === targetTransaction.type &&
        t.category === targetTransaction.category
      )
  );

  // 🔄 Update UI
  setTransactions(updated);

  // 💾 Update localStorage
  const key = `user_transaction_${currentUser.S_user_acc}`;
  localStorage.setItem(key, JSON.stringify(updated));
};



//LOGOUT FUNCTION
const logout =()=>{
  localStorage.removeItem(currentUser); // remove current user from login
  setCurrentUser(null); // totaly remove the current user
  setPage('home'); // land to home page
}


//BUDGET HANDLE INPUTS
const handleBudgetinputs = (e)=>{
  setBudgetFormData({...budgetFormData,[e.target.name]:e.target.value});
}

//FUNCTION TO SET BUDGET
const budgetset=(e)=>{
  e.preventDefault();

  if(!budgetFormData.amount || !budgetFormData.months){  // check if any field is empty
    return;
  }

  const [year , monthIndex] = budgetFormData.months.split("-");

  const months = [ "Jan" ,"Feb" ,"March" ,"April" ,"May" ,"June" ,"July","Aug","Sept","Oct","Nov","Dec"];  // array containing all months and uses index

  const monthName = months[parseInt(monthIndex) -1]; // making the months 12 not 13 bcz it start at index 0 so reach till 13 and 13 -1 = 12

  setBudgetData( prev => {
    const updatedyear = prev[year]||{};
    
    const updateddata = {
         ...prev,[year]:{...updatedyear,[monthName]:budgetFormData.amount}
    }
    
    const key = `user_budget_${currentUser.S_user_acc}`;
    localStorage.setItem(key, JSON.stringify(updateddata));
    return updateddata;
  });

  alert("Budget Set Successfull");

  setBudgetFormData({amount:"" , months:""});
}

//LOAD BUDGET DATA WHEN USER LOGS IN
useEffect( ()=>{

   if(!currentUser)return;

   const key = `user_budget_${currentUser.S_user_acc}`; // this is key which stores current user account of the budget
   const savedBudget = JSON.parse(localStorage.getItem(key)) ||[]; // getting saved budget from local storage of a current user in a key

   setBudgetData(savedBudget);
},[currentUser]);



//FUNCTION TOTAL YEARLY BUDGET FOR PROFIT AND LOSS
const getyearlybudget =(year)=>{

  const yearData = budgetData[year] || {};  // Get all months budget data for that year Example: { Jan: 1000, Feb: 2000, ... } this is object

  let total = 0;
  for(let month in yearData){
    total += Number(yearData[month] || 0);
  }
  return total;
  console.log("Year Data:", budgetData[year]);
}



// FUNCTION TOTAL YEARLY EXPENSE FOR PROFIT LOSS 
const getyearlyexpense=(year)=>{

  return transactions
  .filter( (t)=>{  // filter only expense transactions of that year
   if(t.type !== 'Expense')return false;  // ignore income

   //extraact year form date yyyy/dd/mm
   const [tyear]=t.date.split('-'); // split the year

   return tyear === year ; // keep only mathing year
  })

  // sum all filterd expenses
  .reduce( (acc , curr)=>{ 
    return acc + Number(curr.amount);  // add each transaction amount
  } ,0) // initial value 0
}


//FUNCTION FOR PIE CHART
const Piechart={

  labels:["Income" , "Expense" , "Savings"],
  datasets:[
    {
      label: "Overview",
      data:[Total_Income , Total_Expense , Total_Saving],
      backgroundColor:['#a4de91' ,'#de2a2a','rgb(44, 59, 108)'],
      borderWidth:'2',
    }
  ]
}
const options = {
  responsive: true,
  maintainAspectRatio: false, // VERY IMPORTANT

  plugins: {
    legend: {
      position: "top",
      labels:{
        color:'#fff',
      }
    },
    scales: {
    x: {
      ticks: {
        color: "white", // X-axis labels
      },
      grid: {
        color: "rgba(255, 255, 255, 0.47)", // optional grid lines
      },
    },
    y: {
      ticks: {
        color: "white", // Y-axis labels
      },
      grid: {
        color: "rgba(255, 255, 255, 0.28)",
      },
    },
  },

    tooltip: {
      callbacks: {
        label: function (context) {
          const data = context.dataset.data;
          const total = data.reduce((a, b) => a + b, 0);
          const value = context.raw;
          const percent = ((value / total) * 100).toFixed(1);
          return `${context.label}: ₹${value} (${percent}%)`;
        }
      }
    }
  }
};

// MONTHLY INCOME AND EXPENSE BAR CHART

// first create monthly data 
const monthlydata = {
  labels :["Jan" ,"Feb" ,'March','April',"May","June",'July',"Aug","Sept","Oct",'Nov',"Dec"],
  datasets:[
    {
      label:'INCOME',
      data:Array(12).fill(0),
      backgroundColor:'#6df45e'
    },

    {
      label:"EXPENSE",
      data :Array(12).fill(0),
      backgroundColor:'#ff1d1d'
    }
  ]
}

// 2nd fill data from transactions
transactions.forEach((t) => {
  if (!t.date) return;

  const date = new Date(t.date);
  const month = date.getMonth();

  if (t.type === "Income") {
    monthlydata.datasets[0].data[month] += Number(t.amount);
  }

  if (t.type === "Expense") {
    monthlydata.datasets[1].data[month] += Number(t.amount);  
  }
});
//3rd options
const barOptions = {
  responsive: true,

  maintainAspectRatio: false,

  plugins: {
    legend: {
      position: "top",
      labels:{
        color:'#fff',
      }
    },
  },
   scales: {
    x: {
      ticks: {
        color: "white", // X-axis labels
      },
      grid: {
        color: "rgba(255,255,255,0.2)", // optional grid lines
      },
    },
    y: {
      ticks: {
        color: "white", // Y-axis labels
      },
      grid: {
        color: "rgba(255,255,255,0.2)",
      },
    },
  }
  
};



//YEARLY PROFIT LOSS LINE CHART
const yearlylabels = Object.keys(budgetData || {});
const yearlyProfitLoss = {
  labels: yearlylabels,
  datasets :[
    {
      label: "PROFIT & LOSS",
      data : yearlylabels.map( (year)=>{
        const totalBudget  = getyearlybudget(year);
        const totalExpense = getyearlyexpense(year);
        const profiltloss = totalBudget - totalExpense;
        return totalBudget - totalExpense; // ✅ MUST return
      
      }),
       

      borderColor: "#e8e8ea71",
      backgroundColor: "rgba(79,70,229,0.2)",
      tension:0.3,
      fill: true,
       // ✅ Dynamic dot color
      pointBackgroundColor: (context) => {
        const value = context.raw;

        if (value < 0) return "rgb(255, 36, 2)";
        if (value >= 0) return "#15f901";
        return "white"; // optional for zero
      },
       pointRadius:8,
    }
  ]
}
const lineOptions = {
  responsive: true,
  maintainAspectRatio: false,

  plugins: {
    legend: {
      position: "top",
      labels:{
        color:'#fff',
      }
    },
  },

   scales: {
    x: {
      ticks: {
        color: "white", // X-axis labels
      },
      grid: {
        color: "rgba(255, 255, 255, 0.47)", // optional grid lines
      },
    },
    y: {
      ticks: {
        color: "white", // Y-axis labels
      },
      grid: {
        color: "rgba(255, 255, 255, 0.28)",
      },
    },
  }
};




  return (
  <div className="main_container">

    {page === 'home' &&(<>
       <div className="home_page">

           <nav className="navbar">
              <div className="logo">
              <h1>Expense Tracker</h1>
              </div>

             <div className="links">
                <a href="#" onClick={()=>{setForms('signup')}}>SignUp👤</a>
                <a href="#" onClick={()=>{setForms('login')}}>Login👤</a>
             </div>
          </nav>

          {/* SIGNUP FORM */}
          {forms === 'signup'&&(<>
          
          
          <div className="signup_form_container">
            <form >
              <a href="">🗙</a>
              <h2>Sign_Up</h2>
              <input type="text" name="S_user_name" placeholder='Name' value={signupFormData.S_user_name} onChange={handleSignupInputs} pattern="^[A-Za-z]+$" title='Only Alphabets are allowed' required  style={{border:!signupFormData.S_user_name ? "2px solid red" : "2px solid blue"}} />
              <input type="text" name="S_user_acc" placeholder='Account Number' value={signupFormData.S_user_acc} onChange={handleSignupInputs} pattern='^[0-9]{10,}$' title='Only numbers are allowed' required  style={{border:!signupFormData.S_user_acc ? "2px solid red" :"2px solid blue"}}/>
              <input type="email" name="S_user_email" placeholder='Email' value={signupFormData.S_user_email} onChange={handleSignupInputs} pattern="^[a-zA-Z0-9._%+-]+@gmail\.com$" title='Must Contain @gmail.com' required style={{border:!signupFormData.S_user_email ? "2px solid red" :"2px solid blue"}}/>
              <input type="password" name="S_user_pass" placeholder='Password' value={signupFormData.S_user_pass} onChange={handleSignupInputs} pattern=".{8,}"title="Password must be at least 8 characters long"  required  style={{border:!signupFormData.S_user_pass ? "2px solid red" :"2px solid blue"}}/>
              <button type='submit' onClick={signup}>SignUp</button>
            </form>
          </div>
         </>)}

         {/*LOGIN FORM*/}
         {forms === 'login'&&(<>
           
           <div className="login_form_container">
            <form>
              <a href="">🗙</a>
              <h2>Login</h2>
              <input type="text" name="L_user_name" placeholder='Name' value={loginFormData.L_user_name} onChange={handleLoginInputs} style={{border:!loginFormData.L_user_name ? "2px solid red" : "2px solid green"}}/>
              <input type="text" name="L_user_acc" placeholder='Account Number' value={loginFormData.L_user_acc} onChange={handleLoginInputs}  style={{border:!loginFormData.L_user_acc ? "2px solid red" : "2px solid green"}}/>
              <input type="password" name="L_user_pass" placeholder='Password' value={loginFormData.L_user_pass} onChange={handleLoginInputs}  style={{border:!loginFormData.L_user_pass ? "2px solid red" : "2px solid green"}}/>
              <button onClick={login}>Login</button>
            </form>
           </div>
         
         </>)}
    </div>
    </>)}

    {page === 'dashboard' &&(<>
      <div className="dashboard_container">
         
         {/* side bar which includes dashboard anaylysis profit loss and budget set etc*/}
        <div className="sidebar">

               
             

             {/* side bar menu list for mobile devices when click on ☰ btn */}
             <div className={`menu sidebar-menu2 ${showmenu ? "active" : ""}`}>

                 <button className="close-btn" onClick={() => setShowMenu(false)}>  ✖</button>
                 <a href="#" onClick={(e)=>{e.preventDefault(); setDashboardView('main')}}> 📊 Dashboard </a>
                 <a href="#" onClick={(e)=>{e.preventDefault(); setDashboardView('BudgetSet')}}> 🎯 Budget Set </a>
                 <a href="#" onClick={(e)=>{e.preventDefault(); setDashboardView('profit_loss')}}> 📶 Profit & Loss</a>
                 <a href="#" onClick={(e)=>{e.preventDefault(); setDashboardView('analysis')}}>  🕵🏻 Analysis</a>
             </div>

             <div className="sidebar-bottom">
              <button className="menu-btn" style={{backgroundColor:'none',border:'none'}}  onClick={()=>{setShowMenu(prev=>!prev)}}>☰</button>
              <button className="logout-btn" onClick={logout}>logout 【﻿⏻】</button>
                 
             </div>

        </div>

         {/*display board where everything will be visible on screen*/}
         <div className="display_board">
           {dashboardView === 'main' && (<> 
              <div className="card_container">
                  {/* total income card*/}
                <div className="cards">
                  <div className="heading" style={{display:'flex' , justifyContent:'space-between' ,width:'100%'}}>
                    <h4>Total Income</h4>
                    <h4> 👤{currentUser?.S_user_name || "Guest"}</h4>
                  </div>

                  <div style={{display:'flex' , justifyContent:'space-between'}}>
                    <h5 style={{color:Total_Income < 0 ? "red" : "green"}}>₹ {Total_Income}</h5>
                    <h1>🪙</h1>
                  </div>

                  <div style={{display:'flex' , justifyContent:'space-between'}}>
                    <h5>Account : {currentUser?.S_user_acc}</h5>
                    <a href="#" style={{textDecoration:'none'}}><h5 onClick={()=>{setTransFormDisplay('transactionform')}}>ADD TRANS</h5></a>
                   </div>
                </div>
                  {/* total expense card*/}
                <div className="cards">
                  <div className="heading" style={{display:'flex' , justifyContent:'space-between' ,width:'100%'}}>
                    <h4>Total Expense</h4>
                  </div>

                  <div style={{display:'flex' , justifyContent:'space-between'}}>
                    <h5 style={{color:'red'}}>₹ {Total_Expense}</h5>
                    <h1>💸</h1>
                  </div>

                  <div style={{display:'flex' , justifyContent:'space-between' ,width:'100%'}}>
                    <h5 style={{color:'red'}}>{Exp_percentage} %</h5>
                  </div>
                </div>

                  {/* total saving card*/}
                <div className="cards">
                  <div className="heading" style={{display:'flex' , justifyContent:'space-between' ,width:'100%'}}>
                    <h4>Total Savings</h4>
                  </div>

                  <div style={{display:'flex' , justifyContent:'space-between'}}>
                    <h5 style={{color:Total_Saving < 0 ? "#f90000" : "#3a2e70"}}>₹ {Total_Saving}</h5>
                    <h1>🐖</h1>
                  </div>

                  <div style={{display:'flex' , justifyContent:'space-between' ,width:'100%'}}>
                    <h5 style={{color:Total_Saving < 0 ? "#f90000" : "#3a2e70"}}>{Sav_percentage} %</h5>
                  </div>
                </div>

                   {/* recent transactions */}
                  <div className="transaction_cont">
                    
                    <nav>
                      <table>
                        <thead>
                          <tr>
                            <th>Date</th>
                            <th>Type</th>
                            <th>Category</th>
                            <th>Amount</th>
                            <th>Description</th>
                            <th>Action</th>
                          </tr>
                        </thead>

                        <tbody>
                          {transactions.map( (data , index) =>(
                            <tr key={index}    style={{fontFamily:'Agency FB'}}>
                              <td>{data.date}</td>
                              <td style={{color:data.type !=='Expense' ? "#48ff00" :"#ff0202"}}>{data.type}</td>
                              <td>{data.category}</td>
                              <td style={{color:data.type === "Income" ? "#48ff00" :"#ff0202"}}>{data.amount}</td>
                              <td>{data.description}</td>
                              <td style={{display:'flex',gap:'1rem', justifyContent:'center' ,alignItems:'center'}}>
                                <button type='button' style={{fontSize:'1.3rem' , border:'none',background:'none'}}  onClick={()=>{setEditFormDisplay("editForm") ; setEditFormData(data); setEditIndex(index)}} >✍</button>
                                <button style={{fontSize:'1.3rem' , border:'none' ,background:'none'}}  onClick={() => delete_trans(data)}>🗑</button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </nav>
                  </div>

                  {/* add transaction form */}
                  {transFormDisplay === 'transactionform' && (<>
                              
                  <div className="transaction_form_container">
                    <form className='transaction_form'>
                      <div style={{textAlign:'end'}}><button type='button' onClick={() =>{setTransFormDisplay(''); setTransFormData({amount:"" , type:"" , category:"" , date:"" , description:""});}}   style={{border:'none',background:'none'}}>🗙</button></div>
                      <h4>ADD TRANSACTION</h4>
                      <input type="text" name="amount" placeholder='Amount' value={transFormData.amount} onChange={handleTransInput}  />
                      <select name="type" value={transFormData.type} onChange={handleTransInput}     style={{padding:'0.4rem' , borderRadius:'0.4rem'}}>  // select type 
                        <option value="">Type</option>
                        <option value="Income">Income</option>
                        <option value="Expense">Expense</option>
                      </select>
                      {transFormData.type && (<>
                        <select name="category" value={transFormData.category} onChange={handleTransInput}     style={{padding:'0.4rem' , borderRadius:'0.4rem'}}>
                           <option value="">Category</option>
                          {/* loop to display categories as per type */}
                          {Categories.map( (cat , index) => (
                            <option value={cat} key={index}> {cat} </option>
                          ))}
                        </select>
                      </>)}
                      
                      <input type="date" name="date" placeholder='Date' value={transFormData.date} onChange={handleTransInput} />
                      <input type="text" name="description" placeholder='Description' value={transFormData.description} onChange={handleTransInput}/>
                      <button type='button' onClick={addtransactions}>ADD TRANSACTION</button>
                    </form>
                  </div>
                  </>)} 


                  {/*EDIT FORM FOR TRANSACTIONS IN DASHBOARD */}

                  {editFormDisplay === "editForm" && (<>     
                  
                  <div className="edit_trans_container">
                    <form >
                      <div style={{textAlign:'end'}}><button type='button' onClick={() =>{setEditFormDisplay(''); setEditFormData({amount:"" , type:"" , category:"" , date:"" , description:""});}}   style={{border:'none',background:'none'}}>🗙</button></div>
                      <h4>EDIT FORM</h4>
                      <input type="text" name="amount" placeholder='Amount' value={editFormData.amount} onChange={handleEditInput}  />
                      <select name="type" value={editFormData.type} onChange={handleEditInput}     style={{padding:'0.4rem' , borderRadius:'0.4rem'}}>  // select type 
                        <option value="">Type</option>
                        <option value="Income">Income</option>
                        <option value="Expense">Expense</option>
                      </select>
                      {transFormData.type && (<>
                        <select name="category" value={editFormData.category} onChange={handleEditInput}     style={{padding:'0.4rem' , borderRadius:'0.4rem'}}>
                           <option value="">Category</option>
                          {/* loop to display categories as per type */}
                          {Categories.map( (cat , index) => (
                            <option value={cat} key={index}> {cat} </option>
                          ))}
                        </select>
                      </>)}
                      
                      <input type="date" name="date" placeholder='Date' value={editFormData.date} onChange={handleEditInput} />
                      <input type="text" name="description" placeholder='Description' value={editFormData.description} onChange={handleEditInput}/>
                      <button type='button' onClick={edit_transaction} >EDIT TRANSACTION</button>
                    </form>
                  </div>
                  </>)} 
              </div>
               </>)}

              {/* BUDGET SET */}

              {dashboardView === 'BudgetSet' && (<>
                <div className="budgetset_heading">
                  <h1>Set Your Budget</h1>
                </div>

                {/* budget form */}
                <div className="budget_form_cont">
                  <form>
                    <input type="text" name="amount" placeholder='Amount' value={budgetFormData.amount} onChange={handleBudgetinputs} />
                    <input type="month" name="months" placeholder='Months' value={budgetFormData.months} onChange={handleBudgetinputs} />
                    <button type='button' onClick={budgetset}>Set Budget</button>
                  </form>
                </div>

                {/* budget history */}
                <div className="budget_history">
                  <table>
                    <thead>
                      <tr>
                        <th>Years</th>
                        <th>Jan</th>
                        <th>Feb</th>
                        <th>March</th>
                        <th>April</th>
                        <th>May</th>
                        <th>June</th>
                        <th>July</th>
                        <th>Aug</th>
                        <th>Sept</th>
                        <th>Oct</th>
                        <th>Nov</th>
                        <th>Dec</th>
                      </tr>
                    </thead>
                    <tbody>
                       {Object.keys(budgetData).map((year) => (
                        <tr key={year}  style={{fontFamily:'Agency FB' ,backgroundColor:'#e0dadacd'}}>
                           <td>{year}</td>

                             {["Jan","Feb","March","April","May","June","July","Aug","Sept","Oct","Nov","Dec"].map((m) => {
                                 const hasBudget = budgetData[year][m];

                                    if (!hasBudget) {
                                        return <td key={m}>-</td>;
                                    }

                                    const expense = getMonthlyExpense(year, m);
                                    const budget = Number(hasBudget);
                                    const isOver = expense > budget;

                                   return (
                                     <td key={m}>
                                        <div style={{ color: isOver ? "red" : "green" }}>   {/* display budget and expense of a particular month and display accordingly if expense > budget red in color */}
                                          <div>₹{budget} ₹{expense}</div>   {/* display budget + expense */} 
                                        </div>
                                     </td>
                                   );
                              })}
                        </tr>
                      ))}
                   </tbody>
                  </table>
                </div>
              </>)}
              

              
              {/*PROFIT LOSS*/}
              {dashboardView === 'profit_loss' && (<>
              

              
               <div className="profit_loss_heading">
                <h1>Profit & Loss</h1>
               </div>
              <div className="profit_loss_table_wrapper">
               <div style={{paddingTop:'2rem'}}>
                <table>
                  <thead>
                    <tr>
                      <th>Years</th>
                      <th>Jan</th>
                      <th>Feb</th>
                      <th>March</th>
                      <th>April</th>
                      <th>May</th>
                      <th>June</th>
                      <th>July</th>
                      <th>Aug</th>
                      <th>Sept</th>
                      <th>Oct</th>
                      <th>Nov</th>
                      <th>Dec</th>
                      <th>T_Budget</th>
                      <th>T_Expese</th>
                      <th>P & L</th>
                    </tr>
                  </thead>
                  <tbody style={{fontFamily:'Agency FB'}}>
                      {Object.keys(budgetData).map((year) => {

                              // ✅ correct function names
                              const totalBudget = getyearlybudget(year);
                              const totalExpense = getyearlyexpense(year);
                              const profitLoss = totalBudget - totalExpense;

                       return (
                         <tr key={year}>
                           <td>{year}</td>

                             {["Jan","Feb","March","April","May","June","July","Aug","Sept","Oct","Nov","Dec"].map((m) => {

                                const hasBudget = budgetData[year][m];

                                if (!hasBudget) {
                                  return <td key={m}>-</td>;
                                }

                                 const expense = getMonthlyExpense(year, m);
                                 const budget = Number(hasBudget);
                                 const isOver = expense > budget;

                       return (
                         <td key={m}>
                          <div style={{ color: isOver ? "red" : "green" }}>₹{budget} ₹{expense}</div>
                         </td>
                       );
                     })}

                  {/* ✅ Total Budget */}
                  <td>₹{totalBudget}</td>
                  <td>₹ {totalExpense}</td>
                  {/* ✅ Profit / Loss */}
                 <td style={{ color: profitLoss < 0 ? "red" : "green"}} > {profitLoss < 0 ? "▇▅▃": "▃▅▇"}₹{profitLoss}</td>

              </tr>
                  );
             })}
                  </tbody>

                 </table>
               </div>
              </div>
              </>)}
              {/*ANALYSIS*/}
              {dashboardView === 'analysis'&&(<>
              <div className="over_view_cont" style={{display:'grid' ,objectFit:'fill'}}>

              
                <div className="analysis_heading">
                  <h1>Analysis</h1>
                </div>

                <div className="analysis_container">
                  {/* pie chart*/}
                   <div className="pie_cont">
                    <Pie  data={Piechart} options={options}></Pie>
                   </div>
                  
                  {/*bar chart*/}
                    <div className="bar_cont">
                     <Bar data={monthlydata} options={barOptions} />
                    </div>

                  {/*line chart profit and loss */}
                    <div className='line_chart_cont'>
                       <Line data={yearlyProfitLoss} options={lineOptions} />
                    </div>
                </div>
              </div>
              </>)}
         </div>
      </div>   
    </>)}
    
  </div>
)
}
export default App
