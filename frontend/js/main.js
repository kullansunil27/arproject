const greet = document.getElementById("greeting");

if (greet) {
  const hour = new Date().getHours();
  if (hour < 12) greet.innerText = "Good Morning 👋";
  else if (hour < 17) greet.innerText = "Good Afternoon ☀";
  else greet.innerText = "Good Evening 🌙";
}
