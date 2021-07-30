export default function(context) {
    // Check if the user has been deactivated
    if(context.$auth.user.profile.is_active != true){
      return context.redirect('/error/deactivatedUser');
    }
  }
  