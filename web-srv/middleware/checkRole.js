export default function(context) {
  // Check the Role of the Logged in user
  if (context.$auth.$state.user !== null) {
    if (context.$auth.$state.user.role !== "admin") {
      context.redirect("/error/401");
    }
  } else {
    console.log("user empty");
  }
}
