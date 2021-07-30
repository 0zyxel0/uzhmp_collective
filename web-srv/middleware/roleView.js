export default function(context) {
  // Check the Role of the Logged in user
  if (context.$auth.$state.user == null) {
    return context.redirect('/login')
  } 
  // else {
  //   if (context.$auth.$state.user.meta.role !== "admin") {
  //     return context.redirect("/profile");
  //   }
  //   else{
  //     next();
  //   }
  // }
}
