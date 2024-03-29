'use strict';

/////////////////////////////////////////////////
///////////////// 💵 Bankist ////////////////////

////////////////Data////////////////

const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2019-11-18T21:31:17.178Z',
    '2019-12-23T07:42:02.383Z',
    '2020-01-28T09:15:04.904Z',
    '2020-04-01T10:17:24.185Z',
    '2020-05-08T14:11:59.604Z',
    '2020-07-26T17:01:17.194Z',
    '2020-07-28T23:36:17.929Z',
    '2024-03-20T10:51:36.790Z',
  ],
  currency: 'EUR',
  locale: 'pt-PT', // de-DE
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    '2019-11-01T13:15:33.035Z',
    '2019-11-30T09:48:16.867Z',
    '2019-12-25T06:04:23.907Z',
    '2020-01-25T14:18:46.235Z',
    '2020-02-05T16:33:06.386Z',
    '2020-04-10T14:43:26.374Z',
    '2020-06-25T18:49:59.371Z',
    '2020-07-26T12:01:20.894Z',
  ],
  currency: 'USD',
  locale: 'en-US',
};

const account3 = {
  owner: 'Steven Thomas Williams',
  movements: [200, -200, 340, -300, -20, 50, 400, -460],
  interestRate: 0.7,
  pin: 3333,
  movementsDates: [
    '2010-11-01T13:15:33.035Z',
    '2020-11-30T09:48:16.867Z',
    '2019-12-25T06:04:23.907Z',
    '2020-01-25T14:18:46.235Z',
    '2022-02-05T16:33:06.386Z',
    '2020-04-10T14:43:26.374Z',
    '2023-06-25T18:49:59.371Z',
    '2021-07-26T12:01:20.894Z',
  ],
  currency: 'USD',
  locale: 'en-US',
};

const account4 = {
  owner: 'Sarah Smith',
  movements: [430, 1000, 700, 50, 90],
  interestRate: 1,
  pin: 4444,
  movementsDates: [
    '2015-11-18T21:31:17.178Z',
    '2019-12-23T07:42:02.383Z',
    '2020-01-28T09:15:04.904Z',
    '2021-04-01T10:17:24.185Z',
    '2021-05-08T14:11:59.604Z',
    '2022-07-26T17:01:17.194Z',
    '2024-02-28T23:36:17.929Z',
    '2024-01-20T10:51:36.790Z',
  ],
  currency: 'EUR',
  locale: 'pt-PT', // de-DE
};

const accounts = [account1, account2, account3, account4];

////////////////Elements////////////////

const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');
const labelLogo = document.querySelector('.logo');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');
let currentAccount, timer;

/////////////////////////////////////////////////
///////////////// Functions ////////////////////

// Formatting the amount
const number_formatting = function (acc, num) {
  return new Intl.NumberFormat(acc.locale, {
    style: 'currency',
    currency: acc.currency,
  }).format(num);
};

// show Movemints
const displayMovemint = function (acc, sort = false) {
  containerMovements.textContent = '';

  const movemint = sort
    ? acc.movements.slice().sort((a, b) => a - b)
    : acc.movements;
  movemint.forEach(function (mov, i) {
    const type = mov > 0 ? 'deposit' : 'withdrawal';
    const html = `<div class="movements__row">
          <div class="movements__type movements__type--${type}">${
      i + 1
    } ${type}</div>
     <div class="movements__date">${getDate(
       acc.movementsDates.at(acc.movements.indexOf(movemint[i]))
     )}</div>
          <div class="movements__value">${number_formatting(
            currentAccount,
            Number(mov.toFixed(2))
          )}</div>
        </div>`;
    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};

// Current balance
const calcDisplayBalance = function (account) {
  const balance = account.movements.reduce(
    (acc, val) => acc + val, // acc = acc + val
    0
  );
  account.balance = balance;
  labelBalance.textContent = number_formatting(currentAccount, balance);
};

// Display Summary
const calcDisplaySummary = function (account) {
  const deposits = account.movements
    .filter(mov => mov > 0)
    .reduce((acc, val) => acc + val, 0);
  labelSumIn.textContent = number_formatting(
    currentAccount,
    Number(deposits.toFixed(2))
  );

  const withdrawals = account.movements
    .filter(mov => mov < 0)
    .reduce((acc, val) => acc + val, 0);
  labelSumOut.textContent = number_formatting(
    currentAccount,
    Number(Math.round(withdrawals).toFixed(2))
  );

  const interest = account.movements
    .filter(mov => mov > 0)
    .map(mov => (mov * account.interestRate) / 100)
    .filter(val => val >= 1)
    .reduce((acc, val) => acc + val, 0);
  labelSumInterest.textContent = number_formatting(
    currentAccount,
    Number(interest.toFixed(2))
  );
};

//LOGOUT
const logout = function () {
  labelWelcome.textContent = 'Log in to get started';
  labelTimer.textContent = '3:00';
  containerApp.style.opacity = '0';
};

// Add Movements
const addMovement = function (
  account,
  amount,
  type = amount > 0 ? 'deposit' : 'withdrawal'
) {
  amount = type === 'deposit' ? amount : amount * -1;
  account.movements.push(amount);
  account.movementsDates.push(new Date().toISOString());
};

// Create UserName of all account
const createUserName = function (accs) {
  accs.forEach(function (accValue) {
    accValue.username = accValue.owner
      .toLowerCase()
      .split(' ')
      .map(name => name.at(0))
      .join('');
  });
};
createUserName(accounts);

// Update
const updateUI = function (acc) {
  // Display movements
  displayMovemint(acc);

  // Display balance
  calcDisplayBalance(acc);

  // Display summary
  calcDisplaySummary(acc);
};

// Get Date
const getDate = function (d, t = false) {
  const now = new Date(d);

  // Date Now
  if (t) {
    const options = {
      hour: 'numeric',
      minute: 'numeric',
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
    };
    return new Intl.DateTimeFormat(currentAccount.local, options).format(now);
  }

  // Calculator Days Passed
  const calcDaysPassed = (day1, day2) =>
    Math.trunc(Math.abs((day2 - day1) / (24 * 60 * 60 * 1000)));

  // Date of movements
  let Dates;
  const day = `${now.getDate()}`.padStart(2, 0);
  const month = `${now.getMonth()}`.padStart(2, 0);
  const year = now.getFullYear();
  const passed = calcDaysPassed(now, new Date());
  if (passed > 1 && passed <= 7) Dates = `${passed} DAYS AGO`;
  else if (passed > 7) Dates = `${day}/${month}/${year}`;
  else if (passed == 1) Dates = `YESTERDAY`;
  else Dates = `TODAY`;

  return Dates;
};

// Time to go out
const startLogoutTime = function () {
  //Start time to 3 minutes
  let time = 3 * 60;

  const clock = () => {
    let min = time / 60;
    let sec = time % 60;
    labelTimer.textContent = `${Math.trunc(min)}:${String(sec).padStart(2, 0)}`;

    //When 0 seconds, stop timer and log out user
    if (time == 0) {
      logout();
      clearInterval(counter);
    }
    // Decrese 1s
    time--;
  };

  // Call the time every second
  const counter = setInterval(clock, 1000);

  return counter;
};

///////////////////////////////////////
/////////// Event handlers ///////////

//LOGIN
btnLogin.addEventListener('click', function (e) {
  e.preventDefault();

  currentAccount = accounts.find(
    acc =>
      acc.username === inputLoginUsername.value &&
      acc.pin === +inputLoginPin.value
  );

  if (currentAccount) {
    // Welcome Message
    labelWelcome.textContent = `Welcome Back,${
      currentAccount.owner.split(' ')[0]
    }`;

    // Update UI
    updateUI(currentAccount);

    labelDate.textContent = getDate(new Date().toISOString(), true);

    if (timer) clearInterval(timer);
    timer = startLogoutTime();

    // Show account
    containerApp.style.opacity = 100;
  } else {
    window.alert('The USER or PIN you entered is incorrect!');
  }

  //Clear inpute fields
  inputLoginUsername.value = inputLoginPin.value = '';
  inputLoginPin.blur();
});

// Transfer money
btnTransfer.addEventListener('click', function (e) {
  e.preventDefault();

  // get input
  const amount = Math.floor(inputTransferAmount.value);
  const receiverAcc = accounts.find(
    acc => acc.username === inputTransferTo.value
  );
  inputTransferAmount.value = inputTransferTo.value = '';
  inputTransferTo.blur();

  if (
    amount > 0 &&
    receiverAcc &&
    currentAccount?.balance >= amount &&
    receiverAcc?.username !== currentAccount.username
  ) {
    addMovement(currentAccount, amount, 'withdrawal');
    updateUI(currentAccount);
    //reseat time
    clearInterval(timer);
    timer = startLogoutTime();
  } else {
    window.alert('The USER you entered is incorrect!');
  }
});

//Request loan
btnLoan.addEventListener('click', function (e) {
  e.preventDefault();
  const amountLoan = Math.floor(inputLoanAmount.value);
  if (
    amountLoan > 0 &&
    currentAccount?.movements.some(acc => acc >= amountLoan / 10)
  ) {
    setTimeout(() => {
      addMovement(currentAccount, amountLoan);
      updateUI(currentAccount);
    }, 2000);
    //reseat time
    clearInterval(timer);
    timer = startLogoutTime();
  }
  //Clear inpute fields
  inputLoanAmount.value = '';
  inputLoanAmount.blur();
});

//Sort Movements
let sorted = true;
btnSort.addEventListener('click', function (e) {
  e.preventDefault();

  displayMovemint(currentAccount, sorted);
  btnSort.textContent = sorted ? `↑ SORT` : `↓ SORT`;
  sorted = !sorted;
});

//Close Account
labelLogo.addEventListener('click', function (e) {
  logout();
  clearInterval(timer);
});

//Delete Account
btnClose.addEventListener('click', function (e) {
  e.preventDefault();
  console.log();
  if (
    currentAccount.username === inputCloseUsername.value &&
    currentAccount.pin === +inputClosePin.value
  ) {
    const index = accounts.findIndex(
      acc => acc.username === inputCloseUsername.value
    );
    accounts.splice(index, 1);
    logout();
  }
});
