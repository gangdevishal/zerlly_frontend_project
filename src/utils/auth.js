// LOGIN
export const login = (user) => {
  sessionStorage.setItem("auth", JSON.stringify(user));
};

// LOGOUT
export const logout = () => sessionStorage.removeItem("auth");

// LOGIN STATUS
export const isLogin = () => {
  var myObj = JSON.parse(sessionStorage.getItem("auth"));
  var size = myObj ? Object.keys(myObj).length : 0;
  console.log("sessionStorage.getItem('auth')", size);
  if (size > 0) return true;
  return false;
};

// GET LOGIN DATA
export const getLoginData = () => {
  return JSON.parse(sessionStorage.getItem("auth"));
};
